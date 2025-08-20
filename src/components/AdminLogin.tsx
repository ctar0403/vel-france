import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Shield, Loader2 } from "lucide-react";

export function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, loginError, isLoginPending } = useAdminAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: t('AdminLogin.error', 'Error'),
        description: t('AdminLogin.enterusernamepassword', 'Please enter both username and password'),
        variant: "destructive",
      });
      return;
    }

    login({ username, password }, {
      onSuccess: () => {
        toast({
          title: t('AdminLogin.success', 'Success'),
          description: t('AdminLogin.authenticationsuccessful', 'Admin authentication successful'),
        });
      },
      onError: () => {
        toast({
          title: t('AdminLogin.error', 'Error'),
          description: loginError || t('AdminLogin.invalidcredentials', 'Invalid admin credentials'),
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">{t('AdminLogin.adminaccess', 'Admin Access')}</CardTitle>
          <p className="text-gray-600">{t('AdminLogin.signintoaccess', 'Sign in to access admin panel')}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('AdminLogin.username', 'Username')}</Label>
              <Input
                id="username"
                type="text"
                placeholder={t('AdminLogin.enteradminusername', 'Enter admin username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoginPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('AdminLogin.password', 'Password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('AdminLogin.enteradminpassword', 'Enter admin password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoginPending}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoginPending}
            >
              {isLoginPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('AdminLogin.signingin', 'Signing in...')}
                </>
              ) : (
                t('AdminLogin.signin', 'Sign In')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}