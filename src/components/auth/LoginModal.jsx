import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export function LoginModal({ children, defaultOpen = false, onOpenChange }) {
  const navigate = useNavigate();
  const router = { push: navigate };
  const { login, register, loading } = useAuth();
  
  // State for forms
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [role, setRole] = useState("citizen"); // "citizen" | "admin" for login, or "citizen" | "admin" for register
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState("citizen@demo.com");
  const [loginPassword, setLoginPassword] = useState("123456");
  const [loginError, setLoginError] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("citizen");
  const [regError, setRegError] = useState("");

  // Handle Login
  const onLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      await login({ email: loginEmail, password: loginPassword, role });
      // Close modal by calling onOpenChange if provided, or just redirect
      if (onOpenChange) onOpenChange(false);
      router.push(role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setLoginError(err?.message ?? "Login failed.");
    }
  };

  // Handle Register
  const onRegister = async (e) => {
    e.preventDefault();
    setRegError("");
    try {
      await register({ name: regName, email: regEmail, password: regPassword, role: regRole });
      if (onOpenChange) onOpenChange(false);
      router.push(regRole === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setRegError(err?.message ?? "Registration failed.");
    }
  };

  return (
    <Dialog open={defaultOpen ? true : undefined} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Welcome</DialogTitle>
          <DialogDescription className="text-center">
            Sign in or create a new account to continue.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2 rounded-full">
            <TabsTrigger value="login" className="rounded-full">Sign In</TabsTrigger>
            <TabsTrigger value="register" className="rounded-full">Sign Up</TabsTrigger>
          </TabsList>

          {/* LOGIN FORM */}
          <TabsContent value="login" className="space-y-4 mt-4">
            <div className="flex justify-center gap-4 mb-4">
              <Label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={role === "citizen"} onChange={() => { setRole("citizen"); setLoginEmail("citizen@demo.com"); }} />
                Citizen
              </Label>
              <Label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={role === "admin"} onChange={() => { setRole("admin"); setLoginEmail("admin@demo.com"); }} />
                Admin
              </Label>
            </div>
            <form onSubmit={onLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email Address</Label>
                <Input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-pw">Password</Label>
                <Input id="login-pw" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
              </div>
              {loginError && <p className="text-sm text-destructive">{loginError}</p>}
              <Button className="w-full rounded-full font-semibold" disabled={loading} type="submit">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          {/* REGISTER FORM */}
          <TabsContent value="register" className="space-y-4 mt-4">
            <div className="flex justify-center gap-4 mb-4">
              <Label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={regRole === "citizen"} onChange={() => setRegRole("citizen")} />
                Citizen
              </Label>
              <Label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={regRole === "admin"} onChange={() => setRegRole("admin")} />
                Admin
              </Label>
            </div>
            <form onSubmit={onRegister} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="reg-name">Full Name</Label>
                <Input id="reg-name" value={regName} onChange={(e) => setRegName(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reg-email">Email Address</Label>
                <Input id="reg-email" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reg-pw">Password</Label>
                <Input id="reg-pw" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
              </div>
              {regError && <p className="text-sm text-destructive">{regError}</p>}
              <Button className="w-full rounded-full font-semibold mt-2" disabled={loading} type="submit">
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
