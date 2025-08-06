import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock } from "lucide-react";
import logoImage from "@assets/1_1753538677596.webp";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const { toast } = useToast();
  const { isAuthenticated, login, isLoginPending, loginError } = useAdminAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/admin-panel");
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await new Promise<void>((resolve, reject) => {
        login(
          { username: credentials.username, password: credentials.password },
          {
            onSuccess: () => {
              toast({
                title: "Admin login successful",
                description: "Welcome to the admin panel",
              });
              setLocation("/admin-panel");
              resolve();
            },
            onError: (error: any) => {
              toast({
                title: "Invalid credentials",
                description: error?.message || "Please check your username and password",
                variant: "destructive",
              });
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          
          <h1 className="text-2xl font-bold text-navy">Admin Access</h1>
          <p className="text-navy/70">Secure login for administrators</p>
        </div>

        <Card className="border-gold/20 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-gold" />
            </div>
            <CardTitle className="text-navy">Administrator Login</CardTitle>
            <CardDescription>
              Enter your admin credentials to access the management panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-navy">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) =>
                      setCredentials({ ...credentials, username: e.target.value })
                    }
                    placeholder="Enter admin username"
                    className="pl-10"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-navy">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({ ...credentials, password: e.target.value })
                    }
                    placeholder="Enter admin password"
                    className="pl-10"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/90 text-navy font-medium"
                disabled={isLoginPending}
              >
                {isLoginPending ? "Authenticating..." : "Access Admin Panel"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                className="text-navy/70 hover:text-navy"
                onClick={() => setLocation("/")}
              >
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-xs text-navy/50">
          This is a secure area. Unauthorized access is prohibited.
        </div>
      </div>
    </div>
  );
}