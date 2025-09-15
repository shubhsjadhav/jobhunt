import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Search, ArrowLeft, Loader2 } from "lucide-react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated and test Supabase connection
  useEffect(() => {
    if (user) {
      navigate("/");
    }

    // Test Supabase connection on component mount
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.from('companies').select('count').limit(1);
        if (error) {
          console.error('Supabase connection test failed:', error);
        } else {
          console.log('Supabase connection test successful:', data);
        }
      } catch (err) {
        console.error('Supabase connection test error:', err);
      }
    };

    testConnection();
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      console.log('Attempting to sign up with:', { email, fullName, redirectUrl });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      console.log('Sign up response:', { data, error });

      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }

      console.log('Sign up successful:', data);

      toast({
        title: "Account created successfully!",
        description: "Please check your email and click the verification link to activate your account.",
      });
    } catch (error: any) {
      console.error('Sign up catch block:', error);
      toast({
        title: "Error creating account",
        description: error.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting to sign in with:', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Sign in response:', { data, error });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      console.log('Sign in successful:', data);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      navigate("/");
    } catch (error: any) {
      console.error('Sign in catch block:', error);
      
      // Handle specific error cases
      let errorTitle = "Error signing in";
      let errorDescription = error.message || 'An unexpected error occurred';
      
      if (error.message?.includes('email not confirm') || error.message?.includes('Email not confirmed')) {
        errorTitle = "Email Not Verified";
        errorDescription = "Please check your email and click the verification link before signing in.";
      } else if (error.message?.includes('Invalid login credentials')) {
        errorTitle = "Invalid Credentials";
        errorDescription = "Please check your email and password and try again.";
      } else if (error.message?.includes('User not found')) {
        errorTitle = "Account Not Found";
        errorDescription = "No account found with this email. Please sign up first.";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    setResendingEmail(true);
    try {
      console.log('Resending verification email to:', email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        console.error('Resend verification error:', error);
        throw error;
      }

      console.log('Verification email sent successfully');
      
      toast({
        title: "Verification Email Sent",
        description: "Please check your email and click the verification link.",
      });
    } catch (error: any) {
      console.error('Resend verification catch block:', error);
      toast({
        title: "Error Sending Email",
        description: error.message || 'Failed to resend verification email',
        variant: "destructive",
      });
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card/95 backdrop-blur shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <Link to="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Home</span>
              </Link>
            </div>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-hero-gradient p-3 rounded-lg">
                <Search className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="font-heading text-2xl">Welcome to Job Hunt</CardTitle>
            <CardDescription>
              Join thousands of job seekers finding their dream careers
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                    variant="hero"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={resendingEmail || !email}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {resendingEmail ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Resend Verification Email"
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                    variant="hero"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}