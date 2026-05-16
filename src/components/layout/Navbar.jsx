
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Shield, Menu, X } from "lucide-react";
import { LoginModal } from "@/components/auth/LoginModal";
import { useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const router = { push: navigate };
  const { user, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // New CivicGuardian navigation links
  const links = [
    { href: "/", label: "Home", show: true },
    { href: "/dashboard", label: "Dashboard", show: !!user },
    { href: "#", label: "About", show: !user },
    { href: "#", label: "Contact", show: !user },
    { href: "/admin", label: "Admin", show: user?.role === "admin" },
  ].filter((l) => l.show);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        
        {/* Branding */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 z-50">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/20 text-primary">
            <Shield className="h-5 w-5" />
          </span>
          <span className="font-semibold tracking-wide">Samadhaan Setu</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden gap-6 md:flex items-center">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              className={`text-base font-medium transition-colors hover:text-foreground ${pathname === l.href ? "text-foreground" : "text-muted-foreground"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth & Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <LoginModal open={modalOpen} onOpenChange={setModalOpen}>
                <button className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  Login
                </button>
              </LoginModal>
            ) : (
              <>
                <span className="text-sm text-muted-foreground">{user.name}</span>
                <button onClick={() => { logout(); navigate("/"); }} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Green Report Now button (visible everywhere) */}
          <Button size="sm" asChild className="rounded-sm px-4 sm:px-6 bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
            <Link to="/report">Report Now</Link>
          </Button>

          {/* Mobile Menu Hamburger */}
          <button
            className="md:hidden p-1 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 shadow-lg">
          <nav className="flex flex-col space-y-4">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.href}
                className={`text-base font-medium transition-colors hover:text-foreground ${pathname === l.href ? "text-primary" : "text-foreground"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border/50 flex flex-col space-y-4">
              {!user ? (
                <LoginModal open={modalOpen} onOpenChange={setModalOpen}>
                  <button className="text-left text-base font-medium text-foreground transition-colors">
                    Login
                  </button>
                </LoginModal>
              ) : (
                <>
                  <span className="text-sm text-muted-foreground">Logged in as {user.name}</span>
                  <button
                    onClick={() => { logout(); navigate("/"); setMobileMenuOpen(false); }}
                    className="text-left text-base font-medium text-destructive transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
