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
const navbarVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
      staggerChildren: 0.1,
    },
  },
};

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

const mobileMenuVariants = {
  hidden: {
    opacity: 0,
    x: "100%",
    transition: {
      duration: 0.3,
      ease: "easeInOut" as const,
    },
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as const,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    x: "100%",
    transition: {
      duration: 0.3,
      ease: "easeInOut" as const,
    },
  },
};

const mobileLinkVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
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

  // Close mobile menu on route change
  const handleLinkClick = (href: string) => {
    setIsMobileOpen(false);
    const elementId = href.substring(1);
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <motion.header
        initial="hidden"
        animate="visible"
        variants={navbarVariants}
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
          <motion.div variants={linkVariants} className="flex items-center gap-2">
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
          <motion.div
            variants={linkVariants}
            className="hidden lg:flex items-center gap-1"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.href);
                }}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
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
          </motion.div>

          {/* Right Side Actions */}
          <motion.div
            variants={linkVariants}
            className="flex items-center gap-2 sm:gap-3"
          >
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="relative size-9 rounded-full overflow-hidden hover:bg-accent/10"
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
              className="hidden sm:inline-flex text-muted-foreground hover:text-foreground hover:bg-accent/10"
            >
              Sign In
            </Button>

            {/* Get Started CTA Button */}
            <Button
              size="sm"
              className="hidden sm:inline-flex bg-biored hover:bg-biored-dark text-white shadow-lg shadow-biored/25 hover:shadow-biored/40 transition-all duration-300 group"
            >
              Get Started
              <ArrowRight className="size-4 ml-1 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden size-9 hover:bg-accent/10"
                asChild
              >
                <SheetTriggerWrapper setIsMobileOpen={setIsMobileOpen}>
                  <Menu className="size-5" />
                </SheetTriggerWrapper>
              </Button>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 bg-background/95 backdrop-blur-xl">
                <motion.div
                  variants={mobileMenuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col h-full"
                >
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
                    <motion.nav className="flex flex-col gap-1">
                      {navLinks.map((link, index) => {
                        const Icon = link.icon;
                        return (
                          <motion.a
                            key={link.name}
                            href={link.href}
                            custom={index}
                            variants={mobileLinkVariants}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => {
                              e.preventDefault();
                              handleLinkClick(link.href);
                            }}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 no-underline",
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
                            {activeSection === link.href.substring(1) && (
                              <motion.div
                                layoutId="mobileActiveNav"
                                className="ml-auto size-2 rounded-full bg-biored"
                                transition={{
                                  type: "spring",
                                  stiffness: 380,
                                  damping: 30,
                                }}
                              />
                            )}
                          </motion.a>
                        );
                      })}
                    </motion.nav>
                  </div>

                  <Separator className="bg-border/50" />

                  {/* Mobile CTA Buttons */}
                  <div className="p-6 space-y-3">
                    <Button
                      variant="outline"
                      className="w-full h-11 border-border hover:bg-accent/10"
                      asChild
                    >
                      <SheetClose asChild>
                        <a href="#signin" className="no-underline">
                          Sign In
                        </a>
                      </SheetClose>
                    </Button>
                    <Button
                      className="w-full h-11 bg-biored hover:bg-biored-dark text-white shadow-lg shadow-biored/25"
                      asChild
                    >
                      <SheetClose asChild>
                        <a href="#get-started" className="no-underline flex items-center justify-center gap-2">
                          Get Started
                          <ArrowRight className="size-4" />
                        </a>
                      </SheetClose>
                    </Button>
                  </div>
                </motion.div>
              </SheetContent>
            </Sheet>
          </motion.div>
        </nav>
      </motion.header>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16" />
    </>
  );
}

// SheetTrigger wrapper component to work with Sheet's onOpenChange
function SheetTriggerWrapper({
  children,
  setIsMobileOpen,
}: {
  children: React.ReactNode;
  setIsMobileOpen: (open: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => setIsMobileOpen(true)}
      className="inline-flex items-center justify-center"
    >
      {children}
    </button>
  );
}

function SheetTrigger({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
}) {
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}
