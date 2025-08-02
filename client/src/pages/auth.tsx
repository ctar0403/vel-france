import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { RegisterData, LoginData, CartItem } from "@shared/schema";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Fetch cart items for header
  const { data: cartItems = [] } = useQuery<(CartItem & { product: any })[]>({
    queryKey: ["/api/cart"],
  });
  
  const [loginForm, setLoginForm] = useState<LoginData>({
    email: "",
    password: "",
  });
  
  const [registerForm, setRegisterForm] = useState<RegisterData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerForm);
  };

  // Calculate cart count for header
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header 
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
      />
      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        isLoading={false}
      />
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center">
          {/* Auth Forms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="w-full max-w-md mx-auto shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-navy">{t('auth.joinvelfrance', 'Join Vel France')}</CardTitle>
                <CardDescription>
                  {t('auth.signinto', 'Sign in to your account or create a new one')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">{t('auth.signin', 'Sign In')}</TabsTrigger>
                    <TabsTrigger value="register">{t('auth.signup', 'Sign Up')}</TabsTrigger>
                  </TabsList>
                  
                  {/* Login Tab */}
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="login-email">{t('auth.email', 'Email')}</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder={t('auth.enteryouremail', 'Enter your email')}
                            className="pl-10"
                            value={loginForm.email}
                            onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="login-password">{t('auth.password', 'Password')}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder={t('auth.enteryourpassword', 'Enter your password')}
                            className="pl-10 pr-10"
                            value={loginForm.password}
                            onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gold hover:bg-deep-gold text-navy"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? t('auth.signingin', 'Signing in...') : t('auth.signin', 'Sign In')}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  {/* Register Tab */}
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="register-firstName">{t('auth.firstname', 'First Name')}</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="register-firstName"
                              type="text"
                              placeholder={t('auth.firstname', 'First name')}
                              className="pl-10"
                              value={registerForm.firstName}
                              onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="register-lastName">{t('auth.lastname', 'Last Name')}</Label>
                          <Input
                            id="register-lastName"
                            type="text"
                            placeholder={t('auth.lastname', 'Last name')}
                            value={registerForm.lastName || ""}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="register-email">{t('auth.email', 'Email')}</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder={t('auth.enteryouremail', 'Enter your email')}
                            className="pl-10"
                            value={registerForm.email}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="register-password">{t('auth.password', 'Password')}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            placeholder={t('auth.createapassword', 'Create a password')}
                            className="pl-10 pr-10"
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="register-confirmPassword">{t('auth.confirmpassword', 'Confirm Password')}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t('auth.confirmyourpassword', 'Confirm your password')}
                            className="pl-10 pr-10"
                            value={registerForm.confirmPassword}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gold hover:bg-deep-gold text-navy"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? t('auth.creatingaccount', 'Creating account...') : t('auth.createaccount', 'Create Account')}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}