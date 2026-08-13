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
  Coffee,
  ArrowRight,
  LogIn,
  LogOut,
  UserPlus,
  User,
  Loader2,
  Search,
  Settings,
  HelpCircle,
  Phone,
  Mail,
  ExternalLink,
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

// Navigation links configuration - all now functional
const navLinks = [
  {
    name: "Dashboard",
    href: "#dashboard",
    icon: LayoutDashboard,
    description: "Your analytics hub",
    action: "dashboard" as const,
  },
  {
    name: "Tools",
    href: "#tools",
    icon: Wrench,
    description: "Bioinformatics toolkit",
    action: "tools" as const,
  },
  {
    name: "Databases",
    href: "#databases",
    icon: Database,
    description: "Search NCBI & more",
    action: "databases" as const,
  },
  {
    name: "Documentation",
    href: "#documentation",
    icon: BookOpen,
    description: "API & guides",
    action: "documentation" as const,
  },
  {
    name: "Tutorials",
    href: "#tutorials",
    icon: GraduationCap,
    description: "Learn BioAlign",
    action: "tutorials" as const,
  },
  {
    name: "Support Me",
    href: "#coffee",
    icon: Coffee,
    description: "Buy me a coffee ☕",
    action: "coffee" as const,
  },
];

// Database search options
const databaseOptions = [
  { id: "ncbi", name: "NCBI GenBank", url: "https://www.ncbi.nlm.nih.gov/", description: "Nucleotide sequences", color: "bg-blue-500" },
  { id: "uniprot", name: "UniProt", url: "https://www.uniprot.org/", description: "Protein database", color: "bg-red-500" },
  { id: "pdb", name: "PDB", url: "https://www.rcsb.org/", description: "Protein structures", color: "bg-purple-500" },
  { id: "ensembl", name: "Ensembl", url: "https://ensembl.org/", description: "Genome browser", color: "bg-orange-500" },
  { id: "kegg", name: "KEGG", url: "https://www.genome.jp/kegg/", description: "Pathway database", color: "bg-teal-500" },
  { id: "pubmed", name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/", description: "Literature search", color: "bg-red-500" },
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
  
  // Search state
  const [showSearch, setShowSearch] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<typeof databaseOptions>([]);
  
  // Form state
  const [authEmail, setAuthEmail] = React.useState("");
  const [authPassword, setAuthPassword] = React.useState("");
  const [authName, setAuthName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState("");
  
  // Contact modal
  const [showContactModal, setShowContactModal] = React.useState(false);
  
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

  // Handle navigation click - ALL links are now functional
  const handleNavClick = (href: string, action?: string) => {
    setIsMobileOpen(false);
    
    if (action && onNavigate) {
      onNavigate(action);
      window.scrollTo({ top: 0 });
      return;
    }
    
    // For landing page sections that exist
    const elementId = href.substring(1);
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else if (onNavigate) {
      // Navigate to view if section doesn't exist on current page
      onNavigate(elementId);
      window.scrollTo({ top: 0 });
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

  // Handle sign out with proper cleanup
  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      // Sign out from NextAuth
      await signOut({ redirect: false })
      // Force page refresh to clear any cached state
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
      // Fallback: force redirect anyway
      window.location.href = '/'
    }
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

  // Handle database search
  const handleDatabaseSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const filtered = databaseOptions.filter(db => 
        db.name.toLowerCase().includes(query.toLowerCase()) ||
        db.description.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  // Open external database link
  const openDatabaseLink = (url: string, dbName: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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
                if (onNavigate) {
                  onNavigate('landing');
                  window.scrollTo({ top: 0 });
                } else {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-lg bg-red-primary/20 blur-lg group-hover:bg-red-primary/30 transition-colors duration-300" />
                <Dna className="relative size-8 text-red-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-foreground">Bio</span>
                <span className="text-red-primary">Align</span>
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
                  handleNavClick(link.href, link.action);
                }}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer",
                  "hover:text-foreground hover:bg-accent/10",
                  activeSection === link.href.substring(1) || 
                  (link.href.substring(1) === 'coffee' && activeSection === 'pricing')
                    ? "text-red-primary font-semibold"
                    : "text-muted-foreground"
                )}
              >
                <span className="relative z-10">{link.name}</span>
                {/* Active indicator */}
                {(activeSection === link.href.substring(1) || 
                  (link.href.substring(1) === 'coffee' && activeSection === 'pricing')) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-md bg-red-primary/10 border border-red-primary/20"
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
            {/* Global Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
              className="relative size-9 rounded-full hover:bg-accent/10 cursor-pointer"
              aria-label="Search databases"
            >
              <Search className="size-4" />
            </Button>

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

            {/* Contact Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowContactModal(true)}
              className="hidden md:flex size-9 rounded-full hover:bg-accent/10 cursor-pointer"
              aria-label="Contact us"
            >
              <Phone className="size-4" />
            </Button>

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
                  <div className="size-7 rounded-full bg-red-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-red-primary">{getUserInitials()}</span>
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
                  className="hidden sm:inline-flex bg-red-primary hover:bg-red-dark text-white shadow-lg shadow-red-primary/25 hover:shadow-red-primary/40 transition-all duration-300 group cursor-pointer"
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
                        <Dna className="size-6 text-red-primary" />
                        <span className="text-xl font-bold">
                          <span className="text-foreground">Bio</span>
                          <span className="text-red-primary">Align</span>
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
                          <div className="size-9 rounded-full bg-red-primary/10 flex items-center justify-center">
                            <User className="size-4 text-red-primary" />
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
                          className="flex-1 bg-red-primary hover:bg-red-dark text-white cursor-pointer"
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
                              setIsMobileOpen(false);
                              handleNavClick(link.href, link.action);
                            }}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 no-underline cursor-pointer",
                              "hover:bg-accent/10",
                              activeSection === link.href.substring(1)
                                ? "bg-red-primary/10 text-red-primary font-medium"
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
                      
                      {/* Contact option in mobile */}
                      <button
                        onClick={() => {
                          setIsMobileOpen(false);
                          setShowContactModal(true);
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full text-left cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent/10"
                      >
                        <Phone className="size-5 shrink-0" />
                        <span>Contact Us</span>
                      </button>
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

      {/* Global Database Search Dropdown */}
      <AnimatePresence>
        {showSearch && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowSearch(false)}
            />
            
            {/* Search Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="fixed top-16 left-0 right-0 z-[60] bg-background/98 backdrop-blur-xl border-b shadow-2xl rounded-b-2xl mx-4 mt-2 max-w-[calc(100vw-2rem)]"
            >
              <div className="max-w-4xl mx-auto p-5">
                {/* Search Header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Search className="size-5 text-red-primary" />
                    Search Biological Databases
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSearch(false)}
                    className="cursor-pointer hover:bg-muted"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Type to search... (NCBI, UniProt, PDB, PubMed, KEGG...)"
                    value={searchQuery}
                    onChange={(e) => handleDatabaseSearch(e.target.value)}
                    className="pl-12 pr-4 py-3 text-base h-14 border-2 focus:border-red-primary/50"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setShowSearch(false);
                    }}
                  />
                </div>
                
                {/* Search Results / Quick Access */}
                <div className="mt-4 max-h-[400px] overflow-y-auto">
                  {searchQuery.length > 0 ? (
                    <div>
                      <p className="text-sm text-muted-foreground mb-3 font-medium">
                        {searchResults.length} database{searchResults.length !== 1 ? 's' : ''} found:
                      </p>
                      {searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {searchResults.map((db) => (
                            <button
                              key={db.id}
                              onClick={() => {
                                openDatabaseLink(db.url, db.name);
                                setShowSearch(false);
                              }}
                              className="flex items-center gap-3 p-4 rounded-xl border-2 hover:border-red-primary/50 hover:bg-red-primary/5 transition-all cursor-pointer text-left group"
                            >
                              <div className={`w-4 h-4 rounded-full ${db.color} group-hover:scale-110 transition-transform`} />
                              <div className="flex-1">
                                <p className="font-semibold text-sm group-hover:text-red-primary transition-colors">{db.name}</p>
                                <p className="text-xs text-muted-foreground">{db.description}</p>
                              </div>
                              <ExternalLink className="size-4 text-muted-foreground group-hover:text-red-primary transition-colors" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No databases match your search</p>
                          <p className="text-sm text-muted-foreground mt-1">Try: NCBI, UniProt, PDB, Ensembl, KEGG, PubMed</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-muted-foreground mb-3 font-medium">Quick Access to Databases:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {databaseOptions.map((db) => (
                          <button
                            key={db.id}
                            onClick={() => {
                              openDatabaseLink(db.url, db.name);
                              setShowSearch(false);
                            }}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 hover:border-red-primary/50 hover:bg-red-primary/5 transition-all cursor-pointer group"
                          >
                            <div className={`w-6 h-6 rounded-full ${db.color} group-hover:scale-110 transition-transform`} />
                            <span className="text-xs font-medium text-center group-hover:text-red-primary transition-colors">{db.name}</span>
                          </button>
                        ))}
                      </div>
                      
                      {/* Popular Searches */}
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Popular searches:</p>
                        <div className="flex flex-wrap gap-2">
                          {['BLAST', 'Genome', 'Protein', 'Structure', 'Pathway'].map((term) => (
                            <button
                              key={term}
                              onClick={() => handleDatabaseSearch(term)}
                              className="px-3 py-1 text-xs bg-muted hover:bg-red-primary/10 hover:text-red-primary rounded-full transition-colors cursor-pointer"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Authentication Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="relative">
            {/* Header gradient */}
            <div className="bg-gradient-to-br from-red-primary to-red-dark p-6 text-white">
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
                  <button type="button" className="text-xs text-red-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-red-primary hover:bg-red-dark text-white cursor-pointer"
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
                      className="text-red-primary hover:underline font-medium cursor-pointer"
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
                      className="text-red-primary hover:underline font-medium cursor-pointer"
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

      {/* Contact Us Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="relative">
            <div className="bg-gradient-to-br from-red-dark to-teal-700 p-6 text-white">
              <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
                <Phone className="size-5" />
                Contact Us
              </DialogTitle>
              <DialogDescription className="text-white/80 text-center mt-1">
                Get in touch with the BioAlign team
              </DialogDescription>
            </div>

            <div className="p-6 space-y-6">
              {/* Email Contact */}
              <a
                href="mailto:toufikmahata20@gmail.com"
                className="flex items-center gap-4 p-4 rounded-lg border hover:border-red-primary/30 hover:bg-red-primary/5 transition-all no-underline group"
              >
                <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground group-hover:text-red-primary transition-colors">
                    toufikmahata20@gmail.com
                  </p>
                </div>
              </a>

              {/* Phone Contact */}
              <a
                href="tel:+916296159691"
                className="flex items-center gap-4 p-4 rounded-lg border hover:border-red-primary/30 hover:bg-red-primary/5 transition-all no-underline group"
              >
                <div className="size-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="size-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Phone</p>
                  <p className="text-sm text-muted-foreground group-hover:text-red-primary transition-colors">
                    +91 62961 56961
                  </p>
                </div>
              </a>

              {/* Availability Notice */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground text-center">
                  🕐 Available Monday-Friday, 9 AM - 6 PM IST<br/>
                  📍 CBSH, RPCAU, Pusa, Samastipur, Bihar
                </p>
              </div>

              <Button 
                onClick={() => setShowContactModal(false)}
                className="w-full cursor-pointer"
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
