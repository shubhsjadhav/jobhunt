import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, User, LogOut, Briefcase, Building2, Menu, X, Bell, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useState } from "react";

interface HeaderProps {
  user?: SupabaseUser | null;
}

export const Header = ({ user }: HeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/");
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    }
  };

  const navItems = [
    { href: "/", label: "Home", icon: Briefcase },
    { href: "/jobs", label: "Find Jobs", icon: Search },
    { href: "/companies", label: "Companies", icon: Building2 },
    { href: "/apply", label: "Job Search", icon: Search },
    { href: "/hire", label: "Post Jobs", icon: Building2 },
    { href: "/contact", label: "Contact", icon: User },
  ];

  if (user) {
    navItems.push({ href: "/dashboard", label: "Dashboard", icon: User });
  }

  return (
    <header className="sticky top-0 z-50 w-full nav-professional">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-r from-primary to-secondary p-2.5 rounded-xl shadow-md">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-xl text-gradient-hero">JobHunt</span>
            <span className="text-xs text-gray-500 -mt-1">Professional</span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 group font-medium"
              >
                <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="hover:bg-gray-50">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" asChild className="hover:bg-gray-50">
                <Link to="/dashboard" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" asChild className="hover:bg-gray-50">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="btn-hero shadow-md">
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden hover:bg-gray-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl">
          <div className="container py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            <div className="pt-4 border-t border-gray-200/50 space-y-2">
              {user ? (
                <>
                  <Button variant="ghost" size="sm" asChild className="w-full justify-start hover:bg-gray-50">
                    <Link to="/dashboard" className="flex items-center space-x-3" onClick={() => setIsMobileMenuOpen(false)}>
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full hover:bg-red-50 hover:text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild className="w-full hover:bg-gray-50">
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button size="sm" asChild className="w-full btn-hero">
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};