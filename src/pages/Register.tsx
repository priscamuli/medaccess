import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/services/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, User, Building2 } from "lucide-react";
import { toast } from "sonner";
import { doc, setDoc } from "firebase/firestore";


export default function Register() {
  const [role, setRole] = useState<"patient" | "clinic">("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clinicId, setClinicId] = useState("");
  const [clinics, setClinics] = useState<any[]>([]);
  const { login } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth();

  // 🔹 Load clinics for dropdown
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "clinics"), (snap) => {
      setClinics(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      if (snap.docs.length > 0 && !clinicId) {
        setClinicId(snap.docs[0].id);
      }
    });
    return () => unsub();
  }, []);


const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!name.trim() || !email.trim() || !password.trim()) {
    toast.error("Please fill in all fields");
    return;
  }

  try {
    // 🔹 Create account in Firebase Auth
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // 🔹 Derive clinicName if role is clinic
    let clinicName: string | null = null;
    if (role === "clinic") {
      const selectedClinic = clinics.find((c) => c.id === clinicId);
      clinicName = selectedClinic ? selectedClinic.name : null;
    }

    // 🔹 Save role + extra info in Firestore
    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      role,
      clinicId: role === "clinic" ? clinicId : null,
      clinicName,
      createdAt: new Date(),
    });

    toast.success("Account created successfully!");

    // 🔹 Redirect based on role
    navigate(role === "patient" ? "/patient" : "/clinic");
  } catch (err: any) {
    toast.error(err.message);
  }
};



  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md shadow-card border-none">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Heart className="h-6 w-6 text-primary" fill="currentColor" />
          </div>
          <CardTitle className="font-display text-2xl">Create Account</CardTitle>
          <CardDescription>
            Register with email and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Role Toggle */}
          <div className="mb-6 flex rounded-lg bg-muted p-1">
            <button
              onClick={() => setRole("patient")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all ${
                role === "patient"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <User className="h-4 w-4" /> Patient
            </button>
            <button
              onClick={() => setRole("clinic")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all ${
                role === "clinic"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <Building2 className="h-4 w-4" /> Clinic
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="name">
                {role === "patient" ? "Your Name" : "Clinic Admin Name"}
              </Label>
              <Input
                id="name"
                placeholder={
                  role === "patient" ? "e.g. Priya Sharma" : "e.g. Dr. Gupta"
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {role === "clinic" && (
              <div>
                <Label htmlFor="clinic">Select Clinic</Label>
                <select
                  id="clinic"
                  value={clinicId}
                  onChange={(e) => setClinicId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              Register as {role === "patient" ? "Patient" : "Clinic Admin"}
            </Button>
          </form>
            <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login here
          </a>
        </p>
        </CardContent>
      </Card>
    </div>
  );
}
