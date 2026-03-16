import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/services/firebase";
import { doc, getDoc } from "firebase/firestore";
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
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 🔹 Login with Firebase Auth
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // 🔹 Fetch role from Firestore
      const userDoc = await getDoc(doc(db, "users", cred.user.uid));
      if (!userDoc.exists()) {
        toast.error("User profile not found");
        return;
      }

      const data = userDoc.data();
      toast.success("Logged in successfully!");

      // 🔹 Redirect based on Firestore role
      if (data.role === "patient") {
        navigate("/patient");
      } else if (data.role === "clinic") {
        navigate("/clinic");
      } else {
        navigate("/");
      }
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
          <CardTitle className="font-display text-2xl">Login</CardTitle>
          <CardDescription>Enter your email and password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button
              type="submit"
              className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              Login
            </Button>
          </form>

          <p className="mt-4 text-center text-sm">
            Don’t have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Register here
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
