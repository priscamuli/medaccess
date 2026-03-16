import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Heart, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { isLoggedIn, role, name, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <Heart className="h-6 w-6 text-primary" fill="currentColor" />
          <span>Med<span className="text-gradient-primary">Access</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 md:flex">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Login</Link>
              <Button asChild size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                <Link to="/login">Get Started</Link>
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">
                Welcome, <span className="font-semibold text-foreground">{name}</span>
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-1 h-4 w-4" /> Logout
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t bg-card px-4 py-3 md:hidden">
          {!isLoggedIn ? (
            <div className="flex flex-col gap-2">
              <Link to="/login" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>Login</Link>
              <Button asChild size="sm" className="bg-gradient-primary text-primary-foreground">
                <Link to="/login" onClick={() => setMobileOpen(false)}>Get Started</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Welcome, {name}</span>
              <Button variant="ghost" size="sm" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                <LogOut className="mr-1 h-4 w-4" /> Logout
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
