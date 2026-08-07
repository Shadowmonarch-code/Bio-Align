"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Dna,
  Menu,
  X,
  Sun,
  Moon,
  LayoutDashboard,
  Wrench,
  Database,
  BookOpen,
  GraduationCap,
  CreditCard,
  ArrowRight,
  LogIn,
  LogOut,
  UserPlus,
  User,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Navigation links configuration
const navLinks = [
  {
    name: "Dashboard",
    href: "#dashboard",
    icon: LayoutDashboard,
    description: "Your analytics hub",
  },
  {
    name: "Tools",
    href: "#tools",
    icon: Wrench,
    description: "Bioinformatics toolkit",
  },
  {
    name: "Databases",
    href: "#databases",
    icon: Database,
    description: "Genomic databases",
  },
  {
    name: "Documentation",
    href: "#documentation",
    icon: BookOpen,
    description: "API & guides",
  },
  {
    name: "Tutorials",
    href: "#tutorials",
    icon: GraduationCap,
    description: "Learn BioAlign",
  },
  {
    name: "Pricing",
    href: "#pricing",
    icon: CreditCard,
    description: "Plans & pricing",
  },
];

// Animation variants (using tuple types for framer-motion compatibility)
const linkVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

interface NavbarProps {
  onNavigate?: (view: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<"signin" | "signup">("signin");
  
  // Form state
  const [authEmail, setAuthEmail] = React.useState("");
  const [authPassword, setAuthPassword] = React.useState("");
  const [authName, setAuthName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState("");
  
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();

  // Handle mount state for theme
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll detection for glassmorphism effect
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Detect active section
      const sections = navLinks.map((link) => link.href.substring(1));
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Handle navigation click
  const handleNavClick = (href: string) => {
    setIsMobileOpen(false);
    
    // Check if it's a special navigation action
    if (onNavigate) {
      if (href === '#dashboard' || href === '#get-started') {
        onNavigate('dashboard');
        window.scrollTo({ top: 0 });
        return;
      }
    }
    
    // Regular anchor scrolling
    const elementId = href.substring(1);
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle Get Started button click
  const handleGetStarted = () => {
    if (onNavigate) {
      onNavigate('dashboard');
      window.scrollTo({ top: 0 });
    }
  };

  // Handle Sign In button click
  const handleSignIn = () => {
    setShowAuthModal(true);
    setAuthMode('signin');
    setAuthError("");
  };

  // Handle Sign Up button click  
  const handleSignUp = () => {
    setShowAuthModal(true);
    setAuthMode('signup');
    setAuthError("");
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Reset form when modal opens
  React.useEffect(() => {
    if (showAuthModal) {
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
      setAuthError("");
    }
  }, [showAuthModal, authMode]);

  // Handle form submission with real authentication
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        // Registration
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: authName,
            email: authEmail,
            password: authPassword,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        // After successful registration, sign in
        const result = await signIn('credentials', {
          email: authEmail,
          password: authPassword,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error);
        }
      } else {
        // Sign in
        const result = await signIn('credentials', {
          email: authEmail,
          password: authPassword,
          redirect: false,
        });

        if (result?.error) {
          throw new Error('Invalid email or password');
        }
      }

      // Success - close modal and navigate to dashboard
      setShowAuthModal(false);
      if (onNavigate) {
        onNavigate('dashboard');
        window.scrollTo({ top: 0 });
      }
    } catch (error: any) {
      setAuthError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // User initials for avatar
  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (session?.user?.email) {
      return session.user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
          isScrolled
            ? "glass shadow-sm border-b border-border/50"
            : "bg-transparent"
        )}
      >
        <nav
          className={cn(
            "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8",
            "transition-all duration-300"
          )}
        >
          {/* Logo */}
          <motion.div className="flex items-center gap-2">
            <a
              href="#"
              className="group flex items-center gap-2.5 no-underline"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-lg bg-biored/20 blur-lg group-hover:bg-biored/30 transition-colors duration-300" />
                <Dna className="relative size-8 text-biored transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-foreground">Bio</span>
                <span className="text-biored">Align</span>
              </span>
            </a>
          </motion.div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer",
                  "hover:text-foreground hover:bg-accent/10",
                  activeSection === link.href.substring(1)
                    ? "text-biored font-semibold"
                    : "text-muted-foreground"
                )}
              >
                <span className="relative z-10">{link.name}</span>
                {/* Active indicator */}
                {activeSection === link.href.substring(1) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-md bg-biored/10 border border-biored/20"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </a>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="relative size-9 rounded-full overflow-hidden hover:bg-accent/10 cursor-pointer"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {theme === "dark" ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, scale: 0, opacity: 0 }}
                      animate={{ rotate: 0, scale: 1, opacity: 1 }}
                      exit={{ rotate: 90, scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute"
                    >
                      <Sun className="size-4 text-yellow-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, scale: 0, opacity: 0 }}
                      animate={{ rotate: 0, scale: 1, opacity: 1 }}
                      exit={{ rotate: -90, scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute"
                    >
                      <Moon className="size-4 text-slate-700" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            )}

            {/* Auth Section */}
            {status === "loading" ? (
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            ) : session?.user ? (
              /* Logged In State */
              <div className="flex items-center gap-2">
                {/* User Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate?.("dashboard")}
                  className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/10 cursor-pointer"
                >
                  <div className="size-7 rounded-full bg-biored/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-biored">{getUserInitials()}</span>
                  </div>
                  <span className="text-sm font-medium">{session.user.name || 'User'}</span>
                </Button>
                
                {/* Sign Out Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="hidden sm:inline-flex text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer gap-2"
                >
                  <LogOut className="size-4" />
                  <span className="hidden md:inline">Sign Out</span>
                </Button>

                {/* Mobile Sign Out */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="sm:hidden size-9 hover:bg-accent/10 cursor-pointer"
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : (
              /* Logged Out State */
              <>
                {/* Sign In Button - Desktop */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignIn}
                  className="hidden sm:inline-flex text-muted-foreground hover:text-foreground hover:bg-accent/10 cursor-pointer gap-2"
                >
                  <LogIn className="size-4" />
                  Sign In
                </Button>

                {/* Get Started CTA Button */}
                <Button
                  size="sm"
                  onClick={handleGetStarted}
                  className="hidden sm:inline-flex bg-biored hover:bg-biored-dark text-white shadow-lg shadow-biored/25 hover:shadow-biored/40 transition-all duration-300 group cursor-pointer"
                >
                  Get Started
                  <ArrowRight className="size-4 ml-1 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden size-9 hover:bg-accent/10 cursor-pointer"
                onClick={() => setIsMobileOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 bg-background/95 backdrop-blur-xl">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <SheetHeader className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="flex items-center gap-2.5">
                        <Dna className="size-6 text-biored" />
                        <span className="text-xl font-bold">
                          <span className="text-foreground">Bio</span>
                          <span className="text-biored">Align</span>
                        </span>
                      </SheetTitle>
                    </div>
                    <SheetDescription className="sr-only">
                      Navigation menu for BioAlign platform
                    </SheetDescription>
                  </SheetHeader>

                  <Separator className="bg-border/50" />

                  {/* Auth Status in Mobile Menu */}
                  <div className="px-4 py-3 border-b border-border/50">
                    {session?.user ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-biored/10 flex items-center justify-center">
                            <User className="size-4 text-biored" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{session.user.name || 'User'}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {session.user.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSignOut}
                          className="text-destructive hover:text-destructive cursor-pointer"
                        >
                          <LogOut className="size-4 mr-1" />
                          Out
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            setIsMobileOpen(false);
                            handleSignIn();
                          }}
                        >
                          <LogIn className="size-4 mr-1" />
                          Sign In
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-biored hover:bg-biored-dark text-white cursor-pointer"
                          onClick={() => {
                            setIsMobileOpen(false);
                            handleGetStarted();
                          }}
                        >
                          Get Started
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Mobile Navigation Links */}
                  <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-hide">
                    <nav className="flex flex-col gap-1">
                      {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <a
                            key={link.name}
                            href={link.href}
                            onClick={(e) => {
                              e.preventDefault();
                              handleNavClick(link.href);
                            }}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 no-underline cursor-pointer",
                              "hover:bg-accent/10",
                              activeSection === link.href.substring(1)
                                ? "bg-biored/10 text-biored font-medium"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <Icon className="size-5 shrink-0" />
                            <div className="flex flex-col">
                              <span>{link.name}</span>
                              <span className="text-xs text-muted-foreground/70">
                                {link.description}
                              </span>
                            </div>
                          </a>
                        );
                      })}
                    </nav>
                  </div>

                  <Separator className="bg-border/50" />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </motion.header>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16" />

      {/* Authentication Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="relative">
            {/* Header gradient */}
            <div className="bg-gradient-to-br from-biored to-biored-dark p-6 text-white">
              <DialogTitle className="text-xl font-bold text-center">
                {authMode === 'signin' ? 'Welcome Back' : 'Join BioAlign'}
              </DialogTitle>
              <DialogDescription className="text-white/80 text-center mt-1">
                {authMode === 'signin' 
                  ? 'Sign in to access your bioinformatics workspace' 
                  : 'Create your free account to start analyzing'}
              </DialogDescription>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{authError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              {authMode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Dr. Jane Smith" 
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    required 
                    disabled={isLoading}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="jane@university.edu" 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required 
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required 
                  minLength={8}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters
                </p>
              </div>

              {authMode === 'signin' && (
                <div className="flex justify-end">
                  <button type="button" className="text-xs text-biored hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-biored hover:bg-biored-dark text-white cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    {authMode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  authMode === 'signin' ? 'Sign In' : 'Create Account'
                )}
              </Button>

              {/* Demo Credentials Notice */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground text-center mb-2 font-medium">
                  🧪 Demo Mode - Create a new account to test
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Or use existing credentials after registration
                </p>
              </div>

              {/* Toggle between signin/signup */}
              <p className="text-center text-sm text-muted-foreground">
                {authMode === 'signin' ? (
                  <>
                    Don't have an account?{' '}
                    <button 
                      type="button" 
                      onClick={() => setAuthMode('signup')}
                      className="text-biored hover:underline font-medium cursor-pointer"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button 
                      type="button" 
                      onClick={() => setAuthMode('signin')}
                      className="text-biored hover:underline font-medium cursor-pointer"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
