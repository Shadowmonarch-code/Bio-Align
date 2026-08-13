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
      {/* Background decoration - subtle scientific glow */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-brand dark:bg-red-brand rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-brand dark:bg-red-brand rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
            <a href="#" className="flex items-center gap-2 no-underline group" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-lg bg-green-brand/20 dark:bg-red-brand/20 blur-lg group-hover:bg-green-brand/30 dark:hover:bg-red-brand/30 transition-colors duration-300" />
                <Dna className="relative size-8 text-green-brand dark:text-red-brand transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-white">Bio</span>
                <span className="text-green-brand dark:text-red-brand">Align</span>
              </span>
            </a>
            
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xs">
              The most comprehensive bioinformatics platform for researchers, students, and scientists worldwide.
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <a
                href="mailto:toufikmahata20@gmail.com"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-green-bright dark:hover:text-red-hover transition-colors no-underline"
              >
                <Mail className="size-4" />
                toufikmahata20@gmail.com
              </a>
              <a
                href="tel:+916296159691"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-green-bright dark:hover:text-red-hover transition-colors no-underline"
              >
                <Phone className="size-4" />
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
                  className="size-9 rounded-lg bg-white/5 hover:bg-green-brand/20 dark:hover:bg-red-brand/20 flex items-center justify-center transition-all hover:scale-110 no-underline"
                >
                  <social.icon className="size-4 text-slate-400 hover:text-green-bright dark:hover:text-red-hover" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith('mailto:') || link.href.startsWith('tel:') ? (
                      <a
                        href={link.href}
                        className="text-sm text-slate-400 hover:text-green-bright dark:hover:text-red-hover transition-colors no-underline flex items-center gap-1"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <button
                        onClick={() => handleLinkClick(link.href)}
                        className="text-sm text-slate-400 hover:text-green-bright dark:hover:text-red-hover transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                      >
                        <ChevronRight className="size-3 opacity-0 group-hover:opacity-100" />
                        {link.name}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.08] py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 text-center md:text-left">
              © {new Date().getFullYear()} BioAlign. Developed by{' '}
              <span className="text-green-bright dark:text-red-hover font-medium">Toufik Mahata</span>, CBSH, RPCAU.
            </p>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 flex items-center gap-1">
                Made with <Heart className="size-3 text-red-500 inline" /> &{' '}
                <Coffee className="size-3 text-amber-500 inline" /> for science
              </span>
              
              {/* Scroll to Top Button */}
              <button
                onClick={scrollToTop}
                className="size-9 rounded-lg bg-white/5 hover:bg-green-brand/20 dark:hover:bg-red-brand/20 flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                aria-label="Scroll to top"
              >
                <ArrowUp className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
