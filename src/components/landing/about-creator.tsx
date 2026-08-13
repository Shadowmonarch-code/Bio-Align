'use client';

import React from 'react';
import Image from 'next/image';
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
  FlaskConical,
  GraduationCap,
  Award,
  Target,
  Database,
  ChevronRight,
  MapPin,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Creators data
const creators = [
  {
    id: 'toufik',
    name: 'Toufik Mahata',
    title: 'Biotechnology Undergraduate • Bioinformatician • AI Enthusiast',
    institution: 'CBSH, RPCAU (Pusa, Samastipur, Bihar)',
    photo: '/images/toufik-mahata.jpg',
    email: 'toufikmahata20@gmail.com',
    phone: '+91 62961 56961',
    bio: `Hi, I'm Toufik Mahata, a Biotechnology undergraduate with a deep passion for Bioinformatics, Artificial Intelligence, Computational Biology, and Scientific Innovation.`,
    vision: `BioAlign is my vision of a unified platform where biological data analysis, AI-assisted research, and modern computational workflows come together in one intelligent ecosystem. Rather than forcing researchers to navigate dozens of disconnected tools, BioAlign aims to provide a seamless environment for genomic analysis, protein studies, structural biology, drug discovery, systems biology, and many other areas of biotechnology.`,
    quote: "Innovation begins where biology meets intelligence.",
    socials: {
      github: '#',
      twitter: '#',
      linkedin: '#'
    },
    interests: [
      { icon: Dna, label: 'Bioinformatics & Computational Biology', color: 'text-blue-600 dark:text-blue-400' },
      { icon: Brain, label: 'AI for Life Sciences', color: 'text-purple-600 dark:text-purple-400' },
      { icon: Code2, label: 'Scientific Software Development', color: 'text-cyan-600 dark:text-cyan-400' },
      { icon: FlaskConical, label: 'Open-Source Research Tools', color: 'text-amber-600 dark:text-amber-400' }
    ],
    badge: { text: 'Creator', color: 'bg-emerald-500 dark:bg-red-500' }
  },
  {
    id: 'nitesh',
    name: 'Dr. Nitesh Kumar Sharma',
    title: 'Assistant Professor | Agricultural Biotechnology & Molecular Breeding | Bioinformatics',
    institution: 'Dr. Rajendra Prasad Central Agricultural University (RPCAU), Pusa',
    photo: '/images/nitesh-sharma.png',
    email: '#',
    phone: '',
    bio: `Dr. Nitesh Kumar Sharma is an Assistant Professor at Dr. Rajendra Prasad Central Agricultural University, Pusa, specializing in Bioinformatics, Genomics, Transcriptomics, and AI/ML-based predictive modelling. He holds an M.Sc. and Ph.D. from ICAR–IARI, New Delhi.`,
    vision: `His research focuses on computational analysis of genomic and transcriptomic data, including SNPs, copy number variations, gene expression, genomic diversity, and non-coding RNAs, contributing to data-driven research in agricultural and biological sciences.`,
    quote: "Data-driven discovery transforms agricultural science.",
    socials: {
      github: '#',
      twitter: '#',
      linkedin: '#'
    },
    interests: [
      { icon: Microscope, label: 'Genomics & Transcriptomics', color: 'text-rose-600 dark:text-rose-400' },
      { icon: Cpu, label: 'AI/ML Predictive Modelling', color: 'text-orange-600 dark:text-orange-400' },
      { icon: Leaf, label: 'Molecular Breeding', color: 'text-green-600 dark:text-green-400' },
      { icon: Database, label: 'Genomic Diversity Analysis', color: 'text-teal-600 dark:text-teal-400' }
    ],
    badge: { text: 'Co-Creator & Mentor', color: 'bg-teal-600 dark:bg-red-700' }
  }
];

// Combined expertise areas
const sharedInterests = [
  { icon: Dna, label: 'Bioinformatics & Computational Biology', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  { icon: Brain, label: 'AI for Life Sciences', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  { icon: Microscope, label: 'Genomics, Proteomics & Structural Biology', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30' },
  { icon: Cpu, label: 'Machine Learning in Biotechnology', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  { icon: Leaf, label: 'Precision Agriculture & Ag-Bioinformatics', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30' },
  { icon: Code2, label: 'Scientific Software Development', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
  { icon: FlaskConical, label: 'Open-Source Research Tools', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { icon: BookOpen, label: 'Scientific Communication', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
];

interface AboutProps {
  onBack?: () => void;
}

export default function AboutCreator({ onBack }: AboutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Header - Rich gradient with proper contrast */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 dark:from-red-700 dark:via-red-800 dark:to-red-900 text-white py-20 md:py-28"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large floating circles */}
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl" />
          
          {/* DNA Helix pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          
          {/* Floating particles - Use CSS-only animation to avoid hydration mismatch */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/10 rounded-full animate-float-particle"
              style={{
                left: `${((i * 17 + 13) % 100)}%`,
                top: `${((i * 23 + 7) % 100)}%`,
                animationDelay: `${(i * 0.4) % 5}s`,
                animationDuration: `${5 + (i % 3)}s`,
              }}
            />
          ))}
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-6 text-white/80 hover:text-white hover:bg-white/15 border border-white/10"
            >
              <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
              Back to Home
            </Button>
          )}
          
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2.5 rounded-full text-sm font-medium mb-6 border border-white/20"
            >
              <Sparkles className="w-4 h-4" />
              Meet The Team Behind BioAlign
            </motion.div>
            
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
            >
              Our{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-100 to-emerald-200 dark:from-red-200 dark:via-orange-200 dark:to-yellow-200">
                Creators
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed"
            >
              A collaboration between academic excellence and innovative student research
            </motion.p>
          </div>

          {/* Creator Cards - Enhanced visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {creators.map((creator, index) => (
              <motion.div
                key={creator.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.15 }}
                className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative flex flex-col items-center text-center">
                  {/* Photo */}
                  <div className="relative mb-5">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden ring-4 ring-white/25 shadow-2xl group-hover:scale-105 transition-transform duration-300 bg-white/10">
                      <Image
                        src={creator.photo}
                        alt={creator.name}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                        priority
                      />
                    </div>
                    <div className={`absolute -bottom-2 -right-2 ${creator.badge.color} text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1`}>
                      <Sparkles className="w-3 h-3" />
                      {creator.badge.text}
                    </div>
                  </div>

                  {/* Info - High contrast */}
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{creator.name}</h2>
                  <p className="text-sm text-white/90 mb-1 font-medium">{creator.title}</p>
                  <p className="text-xs text-white/70 mb-5 flex items-center justify-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {creator.institution}
                  </p>

                  {/* Social Links */}
                  <div className="flex justify-center gap-2 mb-5">
                    <a href={creator.email === '#' ? '#' : `mailto:${creator.email}`} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all hover:scale-110 border border-white/10">
                      <Mail className="w-4 h-4" />
                    </a>
                    <a href={creator.socials.github} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all hover:scale-110 border border-white/10">
                      <Github className="https://github.com/Shadowmonarch-code/" />
                    </a>
                    <a href={creator.socials.twitter} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all hover:scale-110 border border-white/10">
                      <Twitter className="w-4 h-4" />
                    </a>
                    <a href={creator.socials.linkedin} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all hover:scale-110 border border-white/10">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Quick Interests */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {creator.interests.slice(0, 3).map((interest, i) => (
                      <span key={i} className={`text-[10px] px-2.5 py-1 rounded-full bg-white/15 text-white/90 border border-white/10`}>
                        {interest.label.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 33.3C840 37 960 43 1080 45C1200 47 1320 45 1380 43.3L1440 42V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="currentColor" className="text-white dark:text-black"/>
          </svg>
        </div>
      </motion.div>

      {/* Content Section - Clean white/dark with rich backgrounds */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-20">
        
        {/* Individual About Sections */}
        {creators.map((creator, index) => (
          <motion.section
            key={creator.id}
            id={`about-${creator.id}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
          >
            <div className="relative bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 md:p-10 lg:p-12 shadow-sm overflow-hidden">
              {/* Background decorations */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50 to-transparent dark:from-red-950/30 dark:to-transparent rounded-full blur-3xl -z-0" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-50 to-transparent dark:from-orange-950/20 dark:to-transparent rounded-full blur-3xl -z-0" />
              
              {/* Accent bar */}
              <div className={`absolute top-0 left-0 w-1.5 h-full ${index === 0 ? 'bg-gradient-to-b from-emerald-500 to-teal-600 dark:from-red-500 dark:to-red-700' : 'bg-gradient-to-b from-teal-500 to-cyan-600 dark:from-red-700 dark:to-orange-700'} rounded-l-2xl`} />
              
              <div className="flex flex-col lg:flex-row items-start gap-8">
                {/* Photo Column */}
                <div className="flex-shrink-0 mx-auto lg:mx-0">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-xl overflow-hidden ring-2 ring-gray-200 dark:ring-zinc-700 shadow-lg">
                    <Image
                      src={creator.photo}
                      alt={creator.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Quick info cards */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900 px-3 py-2 rounded-lg">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[180px]">{creator.institution.split(',')[0]}</span>
                    </div>
                    {index === 1 && (
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900 px-3 py-2 rounded-lg">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        Ph.D. ICAR–IARI
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                    <User className={`w-7 h-7 p-1.5 rounded-lg ${index === 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-red-950/50 dark:text-red-400' : 'bg-teal-100 text-teal-600 dark:bg-red-900/30 dark:text-red-400'}`} />
                    About {creator.name.split(' ')[0]}
                    {index === 1 && (
                      <span className="ml-2 text-xs font-normal bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-1 rounded-full">
                        Ph.D.
                      </span>
                    )}
                  </h2>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">{creator.title}</p>
                  
                  <div className="space-y-6">
                    {/* Bio paragraph with highlighted keywords */}
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                        {creator.bio.split(' ').map((word, i) => {
                          const keywords = ['Bioinformatics', 'Artificial Intelligence', 'Computational Biology', 'Scientific Innovation', 'Genomics', 'Transcriptomics', 'AI/ML'];
                          if (keywords.some(k => word.includes(k))) {
                            return <span key={i} className={`${index === 0 ? 'text-emerald-700 dark:text-red-400 font-semibold' : 'text-teal-700 dark:text-red-400 font-semibold'}`}>{word} </span>;
                          }
                          return word + ' ';
                        })}
                      </p>
                    </div>
                    
                    {/* Vision box - High contrast */}
                    <div className={`relative rounded-xl p-6 border ${
                      index === 0 
                        ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-red-950/40 dark:to-red-900/20 border-emerald-200/50 dark:border-red-800/30' 
                        : 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-red-900/30 dark:to-orange-950/20 border-teal-200/50 dark:border-red-800/30'
                    }`}>
                      <div className="absolute top-3 right-3 opacity-20">
                        <Target className={`w-10 h-10 ${index === 0 ? 'text-emerald-500 dark:text-red-500' : 'text-teal-500 dark:text-red-500'}`} />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-3 flex items-center gap-2">
                        <Target className={`w-5 h-5 ${index === 0 ? 'text-emerald-600 dark:text-red-400' : 'text-teal-600 dark:text-red-400'}`} />
                        {index === 0 ? 'BioAlign Vision' : 'Research Focus'}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {creator.vision}
                      </p>
                    </div>
                    
                    {index === 1 && (
                      <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-500" />
                          Academic Background
                        </h4>
                        <ul className="space-y-2">
                          {[
                            'M.Sc. from ICAR–IARI, New Delhi',
                            'Ph.D. from ICAR–IARI, New Delhi',
                            'Specialization: Genomics & Bioinformatics'
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-red-500 mt-1.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Quote - Styled properly */}
                  <blockquote className="mt-8 pl-5 border-l-4 border-emerald-500 dark:border-red-500 italic">
                    <p className="text-lg text-gray-800 dark:text-gray-200 font-medium">
                      &ldquo;{creator.quote}&rdquo;
                    </p>
                    <footer className={`mt-2 text-sm ${index === 0 ? 'text-emerald-700 dark:text-red-400' : 'text-teal-700 dark:text-red-400'} font-semibold not-italic`}>
                      — {creator.name}
                    </footer>
                  </blockquote>
                </div>
              </div>
            </div>
          </motion.section>
        ))}

        {/* Shared Expertise Grid - Enhanced cards */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Shared Expertise & Interests
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Our combined knowledge spans multiple domains of bioinformatics and computational biology
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sharedInterests.map((interest, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`group bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 hover:border-emerald-300 dark:hover:border-red-800 hover:shadow-lg hover:shadow-emerald-500/5 dark:hover:shadow-red-500/10 transition-all cursor-default`}
              >
                <div className={`w-11 h-11 rounded-lg ${interest.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <interest.icon className={`w-5 h-5 ${interest.color}`} />
                </div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                  {interest.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Collaboration Section - Rich background */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          className="relative overflow-hidden rounded-2xl"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-red-950/40 dark:via-zinc-950 dark:to-orange-950/30" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-100/50 dark:bg-red-900/20 rounded-full blur-3xl -z-0" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-100/50 dark:bg-orange-900/20 rounded-full blur-3xl -z-0" />
          
          <div className="relative bg-transparent border border-emerald-200/50 dark:border-red-900/30 rounded-2xl p-8 md:p-12">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-2 rounded-full text-sm font-medium mb-5 shadow-sm border border-gray-200 dark:border-zinc-800">
                <Heart className="w-4 h-4 text-red-500" />
                Student-Faculty Collaboration
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Bridging Academia & Innovation
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg mb-8 leading-relaxed">
                BioAlign represents a unique collaboration between experienced academic guidance and fresh student innovation. 
                Together, we&apos;re building tools that serve both the research community and the next generation of bioinformaticians.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { icon: GraduationCap, label: 'Academic Excellence', color: 'text-emerald-600 dark:text-red-400' },
                  { icon: Sparkles, label: 'Student Innovation', color: 'text-purple-600 dark:text-purple-400' },
                  { icon: Code2, label: 'Open Source', color: 'text-teal-600 dark:text-teal-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Contact CTA - Bold gradient */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          className="relative overflow-hidden rounded-2xl"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 dark:from-red-700 dark:via-red-800 dark:to-red-900" />
          
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl" />
          </div>
          
          <div className="relative text-center py-12 md:py-16 px-6">
            <div className="w-16 h-16 mx-auto mb-5 bg-white/10 rounded-2xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Get In Touch!</h2>
            <p className="text-white/90 max-w-xl mx-auto mb-8 text-base leading-relaxed">
              We&apos;re always open to discussing research collaborations, bioinformatics projects, or just having a chat about science and technology!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:toufikmahata20@gmail.com"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-emerald-700 dark:text-red-500 font-semibold rounded-xl hover:bg-white/90 transition-all no-underline shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Mail className="w-5 h-5" />
                Contact Toufik
              </a>
              <a
                href="#about-nitesh"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('about-nitesh')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all no-underline border border-white/25 backdrop-blur-sm"
              >
                <ExternalLink className="w-5 h-5" />
                Learn More About Dr. Sharma
              </a>
            </div>
          </div>
        </motion.section>
      </div>
      
      {/* Add float animation keyframe */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
