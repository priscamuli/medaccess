import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { ClinicMap, Clinic } from "@/components/ClinicMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { MapPin, Baby, Clock, CheckCircle2, XCircle, Search, Send, Heart, Pill, Shield, Droplets, Apple } from "lucide-react";
import { toast } from "sonner";

import { db } from "../services/firebase";
import { collection, getDocs, addDoc, onSnapshot } from "firebase/firestore";

interface PatientRequest {
  id: string;
  patientName: string;
  medicine: string;
  clinicId: string;
  clinicName: string;
  status: string;
  date: string;
}

interface HealthTip {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
}

const iconMap: Record<string, any> = { Heart, Pill, Shield, Droplets, Apple, Baby };

export default function PatientDashboard() {
  const { name } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedClinic, setSelectedClinic] = useState<string | undefined>();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [requests, setRequests] = useState<PatientRequest[]>([]);
  const [reqName, setReqName] = useState(name);
  const [reqMedicine, setReqMedicine] = useState("");
  const [reqClinicId, setReqClinicId] = useState<string | undefined>();
  const [healthTips, setHealthTips] = useState<HealthTip[]>([]);

  // 🔹 Helper to compute clinic status
function getClinicStatus(clinic: Clinic): "maternal" | "unknown" | "low" | "available" {
  if (!clinic.medicines || clinic.medicines.length === 0) return "unknown";

  const maternalOut = clinic.medicines.some(
    m => (m.isMaternal || m.category?.toLowerCase() === "maternal") && m.quantity === 0
  );

  const lowStock = clinic.lowStock || clinic.medicines.some(m => m.quantity <= 10);

  if (maternalOut) return "maternal";
  if (lowStock) return "low";
  return "available";
}


  // 🔹 Live fetch clinics
 useEffect(() => {
  const unsub = onSnapshot(collection(db, "clinics"), (snap) => {
    const data = snap.docs.map(doc => {
      const raw = doc.data() as any;
      return {
        id: doc.id,
        ...raw,
        status: getClinicStatus(raw), // ✅ always computed here
      };
    });
    setClinics(data);
  });
  return () => unsub();
}, []);


  // 🔹 Fetch health tips
  useEffect(() => {
    async function fetchTips() {
      const snap = await getDocs(collection(db, "healthTips"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as HealthTip[];
      setHealthTips(data);
    }
    fetchTips();
  }, []);

  // 🔹 Fetch requests
  useEffect(() => {
    async function fetchRequests() {
      const snap = await getDocs(collection(db, "requests"));
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PatientRequest[];
      setRequests(data);
    }
    fetchRequests();
  }, []);

  // 🔹 Filter clinics by search
  const filteredClinics = search
    ? clinics.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.medicines?.some(m =>
          m.name.toLowerCase().includes(search.toLowerCase())
        )
      )
    : clinics;

  const selectedClinicData = clinics.find(c => c.id === selectedClinic);

  // 🔹 Submit request
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName.trim() || !reqMedicine.trim() || !reqClinicId) return;

    const clinic = clinics.find(c => c.id === reqClinicId);
    const docRef = await addDoc(collection(db, "requests"), {
      patientName: reqName,
      medicine: reqMedicine,
      clinicId: reqClinicId,
      clinicName: clinic?.name || "",
      status: "pending",
      date: new Date().toISOString().split("T")[0],
    });

    const newReq: PatientRequest = {
      id: docRef.id,
      patientName: reqName,
      medicine: reqMedicine,
      clinicId: reqClinicId,
      clinicName: clinic?.name || "",
      status: "pending",
      date: new Date().toISOString().split("T")[0],
    };

    setRequests(prev => [newReq, ...prev]);
    setReqMedicine("");
    toast.success("Appointment request submitted!");
  };

  const statusIcon = (s: string) => {
    if (s === "pending") return <Clock className="h-3.5 w-3.5" />;
    if (s === "approved" || s === "completed") return <CheckCircle2 className="h-3.5 w-3.5" />;
    return <XCircle className="h-3.5 w-3.5" />;
  };

  const statusColor = (s: string) => {
    if (s === "pending") return "bg-warning/10 text-warning border-warning/20";
    if (s === "approved") return "bg-accent/10 text-accent border-accent/20";
    if (s === "completed") return "bg-success/10 text-success border-success/20";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Patient Dashboard</h1>
        <p className="text-muted-foreground">Find medicines, request appointments, and stay informed.</p>
      </div>

      <Tabs defaultValue="map" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="map">Clinic Map</TabsTrigger>
          <TabsTrigger value="tips">Health Tips</TabsTrigger>
          <TabsTrigger value="history">My Requests</TabsTrigger>
        </TabsList>

        {/* 🔹 Clinic Map */}
        <TabsContent value="map" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search medicines or clinics..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ClinicMap clinics={filteredClinics} selectedClinic={selectedClinic} onSelectClinic={setSelectedClinic} />
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full bg-success" /> Available</span>
                <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full bg-warning" /> Some shortage</span>
                <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full bg-destructive" /> Maternal shortage</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Clinic detail */}
              {selectedClinicData ? (
                <Card className="shadow-card border-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base font-display">
                      <MapPin className="h-4 w-4 text-primary" /> {selectedClinicData.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{selectedClinicData.address}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Medicine Stock:</p>
                    <div className="space-y-1.5">
                      {selectedClinicData.medicines.map((m, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-sm">
                          <span className="flex items-center gap-1.5">
                            {m.isMaternal && <Baby className="h-3 w-3 text-primary" />}
                            {m.name}
                          </span>
                          <Badge variant={m.quantity === 0 ? "destructive" : "secondary"} className="text-xs">
                            {m.quantity === 0 ? "Out" : m.quantity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-card border-none">
                  <CardContent className="p-6 text-center text-sm text-muted-foreground">
                    <MapPin className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                    Click a clinic marker to see details
                  </CardContent>
                </Card>
              )}

              {/* Quick request */}
              <Card className="shadow-card border-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-display">Request Appointment</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitRequest} className="space-y-3">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input value={reqName} onChange={e => setReqName(e.target.value)} required />
                    </div>
                                        <div>
                      <Label className="text-xs">Medicine Needed</Label>
                      <Input
                        value={reqMedicine}
                        onChange={e => setReqMedicine(e.target.value)}
                        placeholder="e.g. Oxytocin"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Clinic</Label>
                      <select
                        value={reqClinicId}
                        onChange={e => setReqClinicId(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        required
                      >
                        <option value="">Select a clinic</option>
                        {clinics.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      className="w-full bg-gradient-primary text-primary-foreground"
                    >
                      <Send className="mr-1.5 h-3.5 w-3.5" /> Submit Request
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* 🔹 Health Tips */}
        <TabsContent value="tips">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {healthTips.length === 0 ? (
              <p className="text-sm text-muted-foreground">No health tips available.</p>
            ) : (
              healthTips.map(tip => {
                const Icon = iconMap[tip.icon] || Heart;
                const catColor =
                  tip.category === "maternal"
                    ? "text-primary"
                    : tip.category === "preventive"
                    ? "text-accent"
                    : "text-success";
                return (
                  <Card
                    key={tip.id}
                    className="shadow-card border-none hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Icon className={`h-5 w-5 ${catColor}`} />
                      </div>
                      <Badge variant="secondary" className="mb-2 text-xs capitalize">
                        {tip.category}
                      </Badge>
                      <h3 className="mb-1 font-display font-semibold">{tip.title}</h3>
                      <p className="text-sm text-muted-foreground">{tip.description}</p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* 🔹 Request History */}
        <TabsContent value="history">
          <Card className="shadow-card border-none">
            <CardHeader>
              <CardTitle className="font-display text-base">Request History</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No requests yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {requests.map(r => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{r.medicine}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.clinicName} · {r.date}
                        </p>
                      </div>
                      <Badge
                        className={`${statusColor(r.status)} flex items-center gap-1 border`}
                        variant="outline"
                      >
                        {statusIcon(r.status)} {r.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

