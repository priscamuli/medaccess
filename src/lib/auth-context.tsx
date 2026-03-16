import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";

type UserRole = "patient" | "clinic" | null;

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  role: UserRole;
  name: string;
  clinicId?: string;
  clinicName?: string;
}

interface AuthContextType extends AuthState {
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoggedIn: false,
    role: null,
    name: "",
  });

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const data = userDoc.exists() ? userDoc.data() : {};
        setAuthState({
          user: firebaseUser,
          isLoggedIn: true,
          role: (data.role as UserRole) || null,
          name: (data.name as string) || firebaseUser.email || "",
          clinicId: data.clinicId as string | undefined,
          clinicName: data.clinicName as string | undefined,
        });
      } else {
        setAuthState({ user: null, isLoggedIn: false, role: null, name: "" });
      }
    });
    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(getAuth());
    setAuthState({ user: null, isLoggedIn: false, role: null, name: "" });
  };

  return (
    <AuthContext.Provider value={{ ...authState, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
