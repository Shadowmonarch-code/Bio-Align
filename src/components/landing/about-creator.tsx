'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Dna, 
  Brain, 
  Code2, 
  Microscope,
  Heart,
  Github,
  Twitter,
  Linkedin,
  Mail,
  ExternalLink,
  Sparkles,
  BookOpen,
  Cpu,
  Leaf,
  FlaskConical
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Skills/Interests data
const interests = [
  { icon: Dna, label: 'Bioinformatics & Computational Biology', color: 'text-blue-500' },
  { icon: Brain, label: 'AI for Life Sciences', color: 'text-purple-500' },
  { icon: Microscope, label: 'Genomics, Proteomics & Structural Biology', color: 'text-green-500' },
  { icon: Cpu, label: 'Machine Learning in Biotechnology', color: 'text-orange-500' },
  { icon: Leaf, label: 'Precision Agriculture & Ag-Bioinformatics', color: 'text-emerald-500' },
  { icon: Code2, label: 'Scientific Software Development', color: 'text-cyan-500' },
  { icon: FlaskConical, label: 'Open-Source Research Tools', color: 'text-red-500' },
  { icon: BookOpen, label: 'Scientific Communication', color: 'text-yellow-600' },
];

// Timeline/Achievements
const achievements = [
  { year: '2024', title: 'BioAlign Platform', desc: 'Launched comprehensive bioinformatics platform' },
  { year: '2024', title: 'CBSH, RPCAU', desc: 'Biotechnology undergraduate research' },
  { year: '2023', title: 'AI Integration', desc: 'Started building AI-powered bio tools' },
];

interface AboutProps {
  onBack?: () => void;
}

export default function AboutCreator({ onBack }: AboutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-biored via-rose-700 to-purple-900 text-white py-20 overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4 text-white/70 hover:text-white hover:bg-white/10"
            >
              ← Back to Home
            </Button>
          )}
          
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Photo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden ring-4 ring-white/20 shadow-2xl">
                <img
                  src="/images/toufik-mahata.jpg"
                  alt="Toufik Mahata"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-biored to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-1">
                <Sparkles className="size-4" />
                Creator
              </div>
            </motion.div>
            
            {/* Intro Text */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex-1 text-center md:text-left"
            >
              <p className="text-lg text-white/80 mb-2">Meet the Creator</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Toufik Mahata
              </h1>
              <p className="text-xl text-white/90 mb-4">
                Biotechnology Undergraduate • Bioinformatician • AI Enthusiast
              </p>
              <p className="text-white/70 max-w-xl">
                CBSH, RPCAU (Pusa, New Delhi)
              </p>
              
              {/* Social Links */}
              <div className="flex justify-center md:justify-start gap-3 mt-6">
                <a href="mailto:toufikmahata20@gmail.com" className="size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Mail className="size-5" />
                </a>
                <a href="#" className="size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Github className="size-5" />
                </a>
                <a href="#" className="size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Twitter className="size-5" />
                </a>
                <a href="#" className="size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Linkedin className="size-5" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* About Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-card border rounded-2xl p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <User className="size-6 text-biored" />
              About Me
            </h2>
            
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 text-muted-foreground">
              <p className="text-lg leading-relaxed">
                Hi, I'm <span className="font-semibold text-foreground">Toufik Mahata</span>, a Biotechnology undergraduate with a deep passion for{' '}
                <span className="text-biored font-medium">Bioinformatics</span>,{' '}
                <span className="text-biored font-medium">Artificial Intelligence</span>,{' '}
                <span className="text-biored font-medium">Computational Biology</span>, and{' '}
                <span className="text-biored font-medium">Scientific Innovation</span>.
              </p>
              
              <p className="leading-relaxed">
                I believe the future of biology lies at the intersection of life sciences and intelligent computing. My goal is to build technologies that simplify complex biological research, empower scientists with advanced computational tools, and make cutting-edge biotechnology accessible to everyone—from students taking their first steps in bioinformatics to researchers solving real-world challenges.
              </p>
              
              <div className="bg-gradient-to-r from-biored/10 to-purple-500/10 border border-biored/20 rounded-xl p-6 my-8">
                <h3 className="font-bold text-foreground text-lg mb-2 flex items-center gap-2">
                  <Sparkles className="size-5 text-biored" />
                  HelixX Vision
                </h3>
                <p className="text-foreground/80">
                  <strong>BioAlign</strong> is my vision of a unified platform where biological data analysis, AI-assisted research, and modern computational workflows come together in one intelligent ecosystem. Rather than forcing researchers to navigate dozens of disconnected tools, BioAlign aims to provide a seamless environment for genomic analysis, protein studies, structural biology, drug discovery, systems biology, and many other areas of biotechnology.
                </p>
              </div>
              
              <p className="leading-relaxed">
                I am committed to developing impactful technologies that bridge biology and computer science while contributing to a future where scientific discovery becomes faster, more collaborative, and more accessible through innovation.
              </p>
            </div>

            {/* Quote */}
            <blockquote className="mt-8 pl-6 border-l-4 border-biored italic text-lg">
              <p className="text-foreground">
                "Innovation begins where biology meets intelligence."
              </p>
              <footer className="mt-2 text-biored font-medium not-italic">
                — Toufik Mahata
              </footer>
            </blockquote>
          </div>
        </motion.section>

        {/* Interests Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center">My Interests & Expertise</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {interests.map((interest, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-card border rounded-xl p-5 hover:border-biored/30 hover:shadow-md transition-all group cursor-default"
              >
                <interest.icon className={`size-8 ${interest.color} mb-3 group-hover:scale-110 transition-transform`} />
                <p className="font-medium text-sm">{interest.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Timeline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Journey</h2>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-px" />
            
            <div className="space-y-8">
              {achievements.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`relative flex items-start gap-6 ${
                    idx % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-biored rounded-full mt-2 md:-translate-x-1.5 ring-4 ring-background z-10" />
                  
                  {/* Content */}
                  <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${
                    idx % 2 === 0 ? 'md:text-right' : ''
                  }`}>
                    <span className="inline-block px-3 py-1 bg-biored/10 text-biored text-sm font-medium rounded-full mb-2">
                      {item.year}
                    </span>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Contact CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-8 md:p-12 text-white text-center"
        >
          <Heart className="size-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Let's Connect!</h2>
          <p className="text-white/90 max-w-xl mx-auto mb-8">
            I'm always open to discussing research collaborations, bioinformatics projects, or just having a chat about science and technology!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:toufikmahata20@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-white/90 transition-all no-underline"
            >
              <Mail className="size-5" />
              toufikmahata20@gmail.com
            </a>
            <a
              href="tel:+916296159691"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-800 text-white font-semibold rounded-xl hover:bg-emerald-900 transition-all no-underline border border-white/20"
            >
              📞 +91 62961 56961
            </a>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
