"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
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
  UserPlus,
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

interface NavbarProps {
  onNavigate?: (view: string) => void;
}

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

export default function Navbar({ onNavigate }: NavbarProps) {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'signin' | 'signup'>('signin');
  const { theme, setTheme } = useTheme();

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
  };

  // Handle Sign Up button click  
  const handleSignUp = () => {
    setShowAuthModal(true);
    setAuthMode('signup');
  };

  // Handle form submission
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes - just close modal and navigate to dashboard
    setShowAuthModal(false);
    if (onNavigate) {
      onNavigate('dashboard');
      window.scrollTo({ top: 0 });
    }
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

                  {/* Mobile CTA Buttons */}
                  <div className="p-6 space-y-3">
                    <Button
                      variant="outline"
                      className="w-full h-11 border-border hover:bg-accent/10 cursor-pointer gap-2"
                      onClick={() => {
                        setIsMobileOpen(false);
                        handleSignIn();
                      }}
                    >
                      <LogIn className="size-4" />
                      Sign In
                    </Button>
                    <Button
                      className="w-full h-11 bg-biored hover:bg-biored-dark text-white shadow-lg shadow-biored/25 cursor-pointer"
                      onClick={() => {
                        setIsMobileOpen(false);
                        handleGetStarted();
                      }}
                    >
                      Get Started
                      <ArrowRight className="size-4 ml-2" />
                    </Button>
                  </div>
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

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              {authMode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Dr. Jane Smith" required />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="jane@university.edu" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" required />
              </div>

              {authMode === 'signin' && (
                <div className="flex justify-end">
                  <button type="button" className="text-xs text-biored hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              <Button type="submit" className="w-full bg-biored hover:bg-biored-dark text-white cursor-pointer">
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </Button>

              {/* Social Login Options */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button type="button" variant="outline" className="cursor-pointer">
                  <svg className="size-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                </Button>
                <Button type="button" variant="outline" className="cursor-pointer">
                  <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </Button>
                <Button type="button" variant="outline" className="cursor-pointer">
                  ORCID
                </Button>
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
