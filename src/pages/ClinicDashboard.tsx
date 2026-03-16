import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "../services/firebase";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertTriangle,
  Baby,
  Package,
  Users,
  BarChart3,
  Plus,
  Check,
  X,
  Clock,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

interface Medicine {
  id: string;
  name: string;
  category: string;
  quantity: number;
  isMaternal?: boolean;
}

interface PatientRequest {
  id: string;
  patientName: string;
  medicine: string;
  clinicId: string;
  clinicName: string;
  status: "pending" | "approved" | "completed" | "rejected";
  date: string;
}

export default function ClinicDashboard() {
  const { clinicId, name } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [requests, setRequests] = useState<PatientRequest[]>([]);

  // New medicine form
  const [newMedName, setNewMedName] = useState("");
  const [newMedQty, setNewMedQty] = useState("");
  const [newMedMaternal, setNewMedMaternal] = useState(false);

  // 🔹 Fetch clinic medicines live
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "clinics", clinicId), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as any;
        setMedicines(data.medicines || []);
      }
    });
    return () => unsub();
  }, [clinicId]);

  // 🔹 Fetch requests live
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "requests"), (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((r: any) => r.clinicId === clinicId);
      setRequests(data as PatientRequest[]);
    });
    return () => unsub();
  }, [clinicId]);

  // 🔹 Update request status
  const updateRequestStatus = async (
    id: string,
    status: PatientRequest["status"]
  ) => {
    await updateDoc(doc(db, "requests", id), { status });
    toast.success(`Request ${status}`);
  };

  // 🔹 Update medicine quantity
  const updateQuantity = async (id: string, delta: number) => {
    const updated = medicines.map((m) =>
      m.id === id ? { ...m, quantity: Math.max(0, m.quantity + delta) } : m
    );
    setMedicines(updated);
    await updateDoc(doc(db, "clinics", clinicId), { medicines: updated });
    toast.success("Stock updated");
  };

  const setQuantity = async (id: string, qty: number) => {
    const updated = medicines.map((m) =>
      m.id === id ? { ...m, quantity: Math.max(0, qty) } : m
    );
    setMedicines(updated);
    await updateDoc(doc(db, "clinics", clinicId), { medicines: updated });
  };

  const addMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;
    const med: Medicine = {
      id: `m${Date.now()}`,
      name: newMedName.trim(),
      category: newMedMaternal ? "Maternal" : "General",
      quantity: parseInt(newMedQty) || 0,
      isMaternal: newMedMaternal,
    };
    const updated = [...medicines, med];
    setMedicines(updated);
    await updateDoc(doc(db, "clinics", clinicId), { medicines: updated });
    setNewMedName("");
    setNewMedQty("");
    setNewMedMaternal(false);
    toast.success("Medicine added");
  };

  const lowStockMeds = medicines.filter((m) => m.quantity <= 10);
  const maternalAlerts = medicines.filter(
    (m) => m.isMaternal && m.quantity === 0
  );
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const { clinicName, } = useAuth();

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">{clinicName}</h1>
        <p className="text-muted-foreground">
          Manage stock, respond to requests, and monitor alerts.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Medicines",
            value: medicines.length,
            icon: Package,
            color: "text-primary",
          },
          {
            label: "Low Stock",
            value: lowStockMeds.length,
            icon: TrendingDown,
            color: "text-warning",
          },
          {
            label: "Maternal Alerts",
            value: maternalAlerts.length,
            icon: Baby,
            color: "text-destructive",
          },
          {
            label: "Pending Requests",
            value: pendingRequests.length,
            icon: Users,
            color: "text-accent",
          },
        ].map((stat, i) => (
          <Card key={i} className="shadow-card border-none">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold font-display">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {maternalAlerts.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-destructive">
                Maternal Medicine Shortage Alert
              </p>
              <p className="text-sm text-muted-foreground">
                {maternalAlerts.map((m) => m.name).join(", ")} — out of stock.
                Immediate restocking required.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Stock Tab */}
        <TabsContent value="stock" className="space-y-4">
          {/* Add medicine */}
          <Card className="shadow-card border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Medicine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={addMedicine}
                className="flex flex-wrap gap-3 items-end"
              >
                <div className="flex-1 min-w-[150px]">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="Medicine name"
                    required
                  />
                </div>
                <div className="w-24">
                  <Label className="text-xs">Quantity</Label>
                  <Input
                    type="number"
                    value={newMedQty}
                    onChange={(e) => setNewMedQty(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={newMedMaternal}
                    onChange={(e) => setNewMedMaternal(e.target.checked)}
                    className="rounded"
                  />
                                    <Baby className="h-3.5 w-3.5 text-primary" /> Maternal
                </label>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-gradient-primary text-primary-foreground"
                >
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Stock list */}
          <Card className="shadow-card border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">
                Medicine Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {medicines.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      m.quantity === 0
                        ? "border-destructive/30 bg-destructive/5"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {m.isMaternal && (
                        <Baby className="h-4 w-4 text-primary" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(m.id, -10)}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        value={m.quantity}
                        onChange={(e) =>
                          setQuantity(m.id, parseInt(e.target.value) || 0)
                        }
                        className="w-16 h-7 text-center text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(m.id, 10)}
                      >
                        +
                      </Button>
                      {m.quantity === 0 && (
                        <Badge variant="destructive" className="text-xs">
                          Out
                        </Badge>
                      )}
                      {m.quantity > 0 && m.quantity <= 10 && (
                        <Badge
                          className="bg-warning/10 text-warning border-warning/20 text-xs"
                          variant="outline"
                        >
                          Low
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests">
          <Card className="shadow-card border-none">
            <CardHeader>
              <CardTitle className="text-base font-display">
                Patient Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No requests.
                </p>
              ) : (
                <div className="space-y-3">
                  {requests.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{r.patientName}</p>
                        <p className="text-xs text-muted-foreground">
                          Needs: {r.medicine} · {r.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.status === "pending" ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-success border-success/30"
                              onClick={() =>
                                updateRequestStatus(r.id, "approved")
                              }
                            >
                              <Check className="mr-1 h-3 w-3" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-destructive border-destructive/30"
                              onClick={() =>
                                updateRequestStatus(r.id, "rejected")
                              }
                            >
                              <X className="mr-1 h-3 w-3" /> Reject
                            </Button>
                          </>
                        ) : r.status === "approved" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() =>
                              updateRequestStatus(r.id, "completed")
                            }
                          >
                            <Check className="mr-1 h-3 w-3" /> Complete
                          </Button>
                        ) : (
                          <Badge
                            variant={
                              r.status === "completed"
                                ? "secondary"
                                : "destructive"
                            }
                            className="text-xs capitalize"
                          >
                            {r.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-card border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Stock Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {medicines.map((m) => {
                    const pct = Math.min(100, (m.quantity / 200) * 100);
                    return (
                      <div key={m.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center gap-1">
                            {m.isMaternal && (
                              <Baby className="h-3 w-3 text-primary" />
                            )}
                            {m.name}
                          </span>
                          <span className="text-muted-foreground">
                            {m.quantity}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              m.quantity === 0
                                ? "bg-destructive"
                                : m.quantity <= 10
                                ? "bg-warning"
                                : "bg-success"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" /> Request Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Pending",
                      count: requests.filter((r) => r.status === "pending")
                        .length,
                      color: "text-warning",
                    },
                    {
                      label: "Approved",
                      count: requests.filter((r) => r.status === "approved")
                        .length,
                      color: "text-accent",
                    },
                    {
                      label: "Completed",
                      count: requests.filter((r) => r.status === "completed")
                        .length,
                      color: "text-success",
                    },
                    {
                      label: "Rejected",
                      count: requests.filter((r) => r.status === "rejected")
                        .length,
                      color: "text-destructive",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-muted/50 p-3 text-center"
                    >
                      <p
                        className={`text-2xl font-bold font-display ${item.color}`}
                      >
                        {item.count}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
