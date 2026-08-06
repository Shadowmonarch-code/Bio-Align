'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Dna,
  ArrowUp,
  Github,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  Send,
  ChevronRight,
  Heart,
  Globe,
} from 'lucide-react';

// Footer link configuration
const footerLinks = {
  product: {
    title: 'Product',
    links: [
      { name: 'Features', href: '#features' },
      { name: 'Tools', href: '#tools' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'API', href: '#api' },
      { name: 'Changelog', href: '#changelog' },
      { name: 'Roadmap', href: '#roadmap' },
    ],
  },
  resources: {
    title: 'Resources',
    links: [
      { name: 'Documentation', href: '#docs' },
      { name: 'Tutorials', href: '#tutorials' },
      { name: 'Blog', href: '#blog' },
      { name: 'Case Studies', href: '#case-studies' },
      { name: 'Webinars', href: '#webinars' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { name: 'About', href: '#about' },
      { name: 'Careers', href: '#careers' },
      { name: 'Press', href: '#press' },
      { name: 'Partners', href: '#partners' },
      { name: 'Contact', href: '#contact' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { name: 'Privacy', href: '#privacy' },
      { name: 'Terms', href: '#terms' },
      { name: 'Security', href: '#security' },
      { name: 'GDPR', href: '#gdpr' },
      { name: 'Cookie Policy', href: '#cookies' },
    ],
  },
  support: {
    title: 'Support',
    links: [
      { name: 'Help Center', href: '#help' },
      { name: 'Community Forum', href: '#community' },
      { name: 'Status Page', href: '#status' },
      { name: 'Contact Us', href: '#contact-us' },
    ],
  },
};

// Social links configuration
const socialLinks = [
  { name: 'GitHub', icon: Github, href: 'https://github.com', ariaLabel: 'Visit our GitHub' },
  { name: 'Twitter/X', icon: Twitter, href: 'https://twitter.com', ariaLabel: 'Follow us on Twitter' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com', ariaLabel: 'Connect on LinkedIn' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com', ariaLabel: 'Watch on YouTube' },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Footer() {
  const [email, setEmail] = React.useState('');
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [showBackToTop, setShowBackToTop] = React.useState(false);

  // Handle scroll to show/hide back to top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Newsletter subscription handler
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Simulate subscription
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer className="relative bg-[#0A0A0A] text-white overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Gradient orbs */}
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-biored/[0.03] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] bg-biored/[0.02] rounded-full blur-3xl" />
      </div>

      {/* Top border accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-biored/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="py-16 md:py-20 lg:py-24"
        >
          {/* Newsletter Section */}
          <motion.div
            variants={itemVariants}
            className="mb-16 md:mb-20 p-6 md:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
              {/* Left side - Text content */}
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-xl md:text-2xl font-bold mb-2">
                  Stay Updated with{' '}
                  <span className="text-biored">BioAlign</span>
                </h3>
                <p className="text-gray-400 text-sm md:text-base max-w-lg">
                  Get the latest updates on new tools, features, and bioinformatics insights delivered to your inbox.
                </p>
              </div>

              {/* Right side - Email form */}
              <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 lg:w-80">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] 
                             text-white placeholder:text-gray-500 focus:outline-none focus:border-biored/50 
                             focus:bg-white/[0.08] transition-all duration-300"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubscribed}
                  className={`group relative inline-flex items-center justify-center gap-2 px-6 py-3 
                           rounded-xl font-semibold text-sm transition-all duration-300
                           ${isSubscribed 
                             ? 'bg-green-600 text-white cursor-default' 
                             : 'bg-biored hover:bg-biored-dark text-white shadow-lg shadow-biored/25 hover:shadow-biored/40'
                           }`}
                >
                  {isSubscribed ? (
                    <>
                      <span>Subscribed!</span>
                      <Heart className="w-4 h-4 fill-current animate-pulse" />
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12 mb-16 md:mb-20">
            {Object.values(footerLinks).map((section) => (
              <motion.div key={section.title} variants={itemVariants}>
                <h4 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        onClick={(e) => e.preventDefault()}
                        className="group inline-flex items-center gap-1.5 text-sm text-gray-400 
                                 hover:text-biored transition-colors duration-200"
                      >
                        <ChevronRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />

          {/* Bottom Section */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row items-center justify-between gap-6"
          >
            {/* Logo & Copyright */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Logo */}
              <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                 className="group flex items-center gap-2 no-underline">
                <Dna className="w-7 h-7 text-biored group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-lg font-bold tracking-tight">
                  <span className="text-white">Bio</span>
                  <span className="text-biored">Align</span>
                </span>
              </a>

              {/* Copyright */}
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} BioAlign. All rights reserved.
              </p>
            </div>

            {/* Made with love tagline */}
            <p className="text-sm text-gray-500 flex items-center gap-1.5 order-first md:order-none">
              Made with <Heart className="w-4 h-4 text-biored fill-current animate-pulse" /> for science
            </p>

            {/* Social & Language */}
            <div className="flex items-center gap-4">
              {/* Language Selector Placeholder */}
              <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg 
                               bg-white/[0.05] border border-white/[0.1] text-sm text-gray-400 
                               hover:text-white hover:border-white/20 transition-all duration-200">
                <Globe className="w-4 h-4" />
                <span>EN</span>
              </button>

              {/* Social Links */}
              <div className="flex items-center gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.ariaLabel}
                    className="group relative w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.1]
                             flex items-center justify-center text-gray-400 
                             hover:text-biored hover:border-biored/30 hover:bg-white/[0.08]
                             transition-all duration-300"
                  >
                    <social.icon className="w-4 h-4" />
                    
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 
                                  transition-opacity duration-300 blur-md bg-biored/20 -z-10" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: showBackToTop ? 1 : 0, 
          scale: showBackToTop ? 1 : 0.8 
        }}
        transition={{ duration: 0.3 }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full 
                 bg-biored text-white shadow-lg shadow-biored/30
                 hover:bg-biored-dark hover:shadow-biored/50 hover:-translate-y-1
                 active:translate-y-0 transition-all duration-300
                 flex items-center justify-center
                 focus:outline-none focus:ring-2 focus:ring-biored/50 focus:ring-offset-2 focus:ring-offset-background"
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
        
        {/* Animated ring on hover */}
        <span className="absolute inset-0 rounded-full border-2 border-biored/30 animate-ping opacity-20" />
      </motion.button>
    </footer>
  );
}
