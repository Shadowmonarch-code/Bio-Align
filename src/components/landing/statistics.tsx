"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { 
  Wrench, 
  BarChart3, 
  Users, 
  Globe, 
  ShieldCheck, 
  Headphones,
  TrendingUp,
  Zap
} from "lucide-react";

// Stats data interface
interface StatItem {
  id: string;
  value: number;
  suffix: string;
  prefix?: string;
  isDecimal?: boolean;
  label: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

// Statistics data
const statsData: StatItem[] = [
  {
    id: "tools",
    value: 50,
    suffix: "+",
    label: "Integrated Tools",
    description: "Comprehensive bioinformatics suite",
    icon: <Wrench className="w-7 h-7" />,
    gradient: "from-green-brand to-green-hover dark:from-red-brand dark:to-red-dark",
  },
  {
    id: "analyses",
    value: 10,
    suffix: "M+",
    label: "Analyses Completed",
    description: "And growing every second",
    icon: <BarChart3 className="w-7 h-7" />,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "researchers",
    value: 100,
    suffix: "K+",
    label: "Active Researchers",
    description: "Trusted by scientists worldwide",
    icon: <Users className="w-7 h-7" />,
    gradient: "from-green-brand to-green-hover dark:from-red-brand dark:to-red-dark",
  },
  {
    id: "countries",
    value: 200,
    suffix: "+",
    label: "Countries Served",
    description: "Global research community",
    icon: <Globe className="w-7 h-7" />,
    gradient: "from-purple-500 to-violet-500",
  },
  {
    id: "uptime",
    value: 99.99,
    suffix: "%",
    isDecimal: true,
    label: "Uptime Guarantee",
    description: "Enterprise-grade reliability",
    icon: <ShieldCheck className="w-7 h-7" />,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "support",
    value: 24,
    suffix: "/7",
    label: "Expert Support",
    description: "Always here to help you",
    icon: <Headphones className="w-7 h-7" />,
    gradient: "from-pink-500 to-rose-500",
  },
];

// Animated counter component
function AnimatedCounter({ 
  value, 
  suffix, 
  isDecimal = false,
  isInView 
}: { 
  value: number; 
  suffix: string; 
  isDecimal?: boolean;
  isInView: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    if (!isInView) return;

    const duration = 2000; // 2 seconds animation
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (value - startValue) * eased;
      
      if (isDecimal) {
        setDisplayValue(parseFloat(currentValue.toFixed(2)));
      } else {
        setDisplayValue(Math.floor(currentValue));
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    // Start animation with a small delay for visual effect
    const timeoutId = setTimeout(() => {
      animate();
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [isInView, value, isDecimal]);

  return (
    <span className="tabular-nums">
      {displayValue}{suffix}
    </span>
  );
}

// Individual stat card component
function StatCard({ stat, index }: { stat: StatItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      className="group relative"
    >
      <div className="relative h-full p-6 sm:p-8 rounded-2xl border border-border/50 bg-white dark:bg-black backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-green-brand/5 dark:hover:shadow-red-brand/5 hover:border-green-brand/20 dark:hover:border-red-brand/20 transition-all duration-300 overflow-hidden">
        {/* Background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-brand/[0.02] dark:from-red-brand/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Icon container */}
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
          <div className="text-white">
            {stat.icon}
          </div>
        </div>

        {/* Value */}
        <div className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-foreground group-hover:text-green-brand dark:group-hover:text-red-brand transition-colors duration-300">
          <AnimatedCounter 
            value={stat.value} 
            suffix={stat.suffix} 
            isDecimal={stat.isDecimal}
            isInView={isInView} 
          />
        </div>

        {/* Label & Description */}
        <h3 className="font-semibold text-base mb-1 text-foreground">
          {stat.label}
        </h3>
        <p className="text-sm text-muted-foreground">
          {stat.description}
        </p>

        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-green-brand/5 dark:from-red-brand/5 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  );
}

export default function Statistics() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 overflow-hidden bg-white dark:bg-black"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(green-brand 1px, transparent 1px), linear-gradient(90deg, green-brand 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Glowing orbs */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-green-brand/[0.05] dark:bg-red-brand/[0.05] rounded-full blur-[120px]"
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] bg-green-brand/[0.04] dark:bg-red-brand/[0.04] rounded-full blur-[100px]"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-bg/50 dark:bg-red-bg/30 border border-green-brand/20 dark:border-red-brand/20 mb-6"
          >
            <TrendingUp className="w-4 h-4 text-green-brand dark:text-red-brand" />
            <span className="text-sm font-medium text-green-brand dark:text-red-brand">Platform Impact</span>
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Trusted by{" "}
            <span className="gradient-text">Researchers</span>{" "}
            Worldwide
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform continues to grow and serve the global scientific community 
            with cutting-edge bioinformatics tools.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsData.map((stat, index) => (
            <StatCard key={stat.id} stat={stat} index={index} />
          ))}
        </div>

        {/* Bottom CTA / Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-8 py-6 px-8 rounded-2xl border border-border/50 bg-white dark:bg-black backdrop-blur-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="w-5 h-5 text-green-brand dark:text-red-brand" />
              <span className="text-sm font-medium">Lightning Fast</span>
            </div>
            <div className="w-px h-6 bg-border hidden sm:block" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="w-5 h-5 text-green-brand dark:text-red-brand" />
              <span className="text-sm font-medium">Secure & Private</span>
            </div>
            <div className="w-px h-6 bg-border hidden sm:block" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="w-5 h-5 text-green-brand dark:text-red-brand" />
              <span className="text-sm font-medium">Global Infrastructure</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
