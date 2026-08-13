'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Dna,
  ArrowUp,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  ChevronRight,
  Heart,
  Coffee,
  ExternalLink,
} from 'lucide-react';

// Footer link configuration - updated with working links
const footerLinks = {
  product: {
    title: 'Product',
    links: [
      { name: 'Features', href: '#features' },
      { name: 'Tools Catalog', href: '#tools' },
      { name: 'Databases', href: '#databases' },
      { name: 'Documentation', href: '#documentation' },
      { name: 'Tutorials', href: '#tutorials' },
      { name: 'Support Me ☕', href: '#coffee' },
    ],
  },
  resources: {
    title: 'Resources',
    links: [
      { name: 'Documentation', href: '#documentation' },
      { name: 'Tutorials', href: '#tutorials' },
      { name: 'About Creator', href: '#about' },
      { name: 'Contact Us', href: '#' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { name: 'About the Creator', href: '#about' },
      { name: 'Support Development', href: '#coffee' },
      { name: 'Contact', href: 'mailto:toufikmahata20@gmail.com' },
    ],
  },
};

// Social links configuration
const socialLinks = [
  { name: 'GitHub', icon: Github, href: 'https://github.com/toufikmahata', ariaLabel: 'Visit GitHub' },
  { name: 'Twitter/X', icon: Twitter, href: 'https://twitter.com/toufikmahata', ariaLabel: 'Follow on Twitter' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/in/toufikmahata', ariaLabel: 'Connect on LinkedIn' },
];

export default function FooterSection() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle link clicks for navigation
  const handleLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      const elementId = href.substring(1);
      if (elementId === 'about') {
        // Trigger navigation event
        window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'about' } }));
        return;
      }
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Try navigating via custom event
        window.dispatchEvent(new CustomEvent('navigate', { detail: { view: elementId } }));
      }
    }
  };

  return (
    <footer className="relative bg-zinc-950 text-white overflow-hidden mt-auto">
      {/* Rich background decoration */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
            <a 
              href="#" 
              className="flex items-center gap-2.5 no-underline group" 
              onClick={(e) => { e.preventDefault(); scrollToTop(); }}
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-lg bg-emerald-500/20 blur-lg group-hover:bg-emerald-500/30 transition-colors duration-300" />
                <Dna className="relative w-8 h-8 text-emerald-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-white">Bio</span>
                <span className="text-emerald-400">Align</span>
              </span>
            </a>
            
            <p className="mt-5 text-sm text-gray-400 leading-relaxed max-w-xs">
              The most comprehensive bioinformatics platform for researchers, students, and scientists worldwide.
            </p>

            {/* Contact Info - Clear visibility */}
            <div className="mt-6 space-y-3">
              <a
                href="mailto:toufikmahata20@gmail.com"
                className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-emerald-300 transition-colors no-underline group"
              >
                <span className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center group-hover:bg-emerald-900/40 transition-colors">
                  <Mail className="w-4 h-4" />
                </span>
                toufikmahata20@gmail.com
              </a>
              <a
                href="tel:+916296159691"
                className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-emerald-300 transition-colors no-underline group"
              >
                <span className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center group-hover:bg-emerald-900/40 transition-colors">
                  <Phone className="w-4 h-4" />
                </span>
                +91 62961 56961
              </a>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.ariaLabel}
                  className="w-10 h-10 rounded-lg bg-zinc-800/50 hover:bg-emerald-900/40 flex items-center justify-center transition-all hover:scale-110 no-underline border border-zinc-700/50 hover:border-emerald-700/40"
                >
                  <social.icon className="w-4 h-4 text-gray-400 hover:text-emerald-300 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith('mailto:') || link.href.startsWith('tel:') ? (
                      <a
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-emerald-300 transition-colors no-underline flex items-center gap-1.5 group"
                      >
                        <ChevronRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-emerald-400" />
                        {link.name}
                      </a>
                    ) : (
                      <button
                        onClick={() => handleLinkClick(link.href)}
                        className="text-sm text-gray-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0 group text-left"
                      >
                        <ChevronRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-emerald-400" />
                        {link.name}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar - Enhanced styling */}
        <div className="border-t border-zinc-800 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 text-center md:text-left">
              © {new Date().getFullYear()} BioAlign. Developed by{' '}
              <span className="text-emerald-300 font-medium">Toufik Mahata</span>, CBSH, RPCAU.
            </p>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 flex items-center gap-1.5">
                Made with <Heart className="w-3.5 h-3.5 text-red-500 inline animate-pulse" /> &{' '}
                <Coffee className="w-3.5 h-3.5 text-amber-500 inline" /> for science
              </span>
              
              {/* Scroll to Top Button */}
              <button
                onClick={scrollToTop}
                className="w-10 h-10 rounded-lg bg-zinc-800/50 hover:bg-emerald-900/40 flex items-center justify-center transition-all hover:scale-110 cursor-pointer border border-zinc-700/50 hover:border-emerald-700/40"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-4 h-4 text-gray-400 hover:text-emerald-300 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
