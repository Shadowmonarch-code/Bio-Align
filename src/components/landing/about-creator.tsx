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
  Database
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
      { icon: Dna, label: 'Bioinformatics & Computational Biology', color: 'text-blue-500' },
      { icon: Brain, label: 'AI for Life Sciences', color: 'text-purple-500' },
      { icon: Code2, label: 'Scientific Software Development', color: 'text-cyan-500' },
      { icon: FlaskConical, label: 'Open-Source Research Tools', color: 'text-red-500' }
    ],
    badge: { text: 'Creator', gradient: 'from-green-brand to-purple-600 dark:from-red-brand' }
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
      { icon: Microscope, label: 'Genomics & Transcriptomics', color: 'text-red-600' },
      { icon: Cpu, label: 'AI/ML Predictive Modelling', color: 'text-orange-500' },
      { icon: Leaf, label: 'Molecular Breeding', color: 'text-green-brand dark:text-red-brand' },
      { icon: Database, label: 'Genomic Diversity Analysis', color: 'text-teal-500' }
    ],
    badge: { text: 'Co-Creator & Mentor', gradient: 'from-green-hover dark:from-red-dark to-teal-700' }
  }
];

// Combined expertise areas
const sharedInterests = [
  { icon: Dna, label: 'Bioinformatics & Computational Biology', color: 'text-blue-500' },
  { icon: Brain, label: 'AI for Life Sciences', color: 'text-purple-500' },
  { icon: Microscope, label: 'Genomics, Proteomics & Structural Biology', color: 'text-red-600' },
  { icon: Cpu, label: 'Machine Learning in Biotechnology', color: 'text-orange-500' },
  { icon: Leaf, label: 'Precision Agriculture & Ag-Bioinformatics', color: 'text-green-brand dark:text-red-brand' },
  { icon: Code2, label: 'Scientific Software Development', color: 'text-cyan-500' },
  { icon: FlaskConical, label: 'Open-Source Research Tools', color: 'text-red-500' },
  { icon: BookOpen, label: 'Scientific Communication', color: 'text-yellow-600' },
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
        className="relative bg-gradient-to-br from-green-brand via-rose-700 dark:from-red-brand dark:via-red-dark to-green-hover dark:to-red-dark text-white py-20 overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute top-20 right-40 w-32 h-32 bg-green-bright dark:bg-red-hover rounded-full blur-2xl" />
          <div className="absolute bottom-32 left-40 w-48 h-48 bg-blue-300 rounded-full blur-2xl" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4 text-white/70 hover:text-white hover:bg-white/10"
            >
              ← Back to Home
            </Button>
          )}
          
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4"
            >
              <Sparkles className="size-4" />
              Meet The Team Behind BioAlign
            </motion.div>
            
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            >
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-green-soft dark:to-red-soft">Creators</span>
            </motion.h1>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-white/80 max-w-2xl mx-auto"
            >
              A collaboration between academic excellence and innovative student research
            </motion.p>
          </div>

          {/* Creator Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {creators.map((creator, index) => (
              <motion.div
                key={creator.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.15 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Photo */}
                  <div className="relative mb-5">
                    <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden ring-4 ring-white/20 shadow-xl group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={creator.photo}
                        alt={creator.name}
                        width={176}
                        height={176}
                        className="w-full h-full object-cover"
                        priority
                      />
                    </div>
                    <div className={`absolute -bottom-3 -right-3 bg-gradient-to-r ${creator.badge.gradient} text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1`}>
                      <Sparkles className="size-3" />
                      {creator.badge.text}
                    </div>
                  </div>

                  {/* Info */}
                  <h2 className="text-2xl font-bold mb-1">{creator.name}</h2>
                  <p className="text-sm text-white/90 mb-1">{creator.title}</p>
                  <p className="text-xs text-white/70 mb-4 flex items-center justify-center gap-1">
                    <GraduationCap className="size-3" />
                    {creator.institution}
                  </p>

                  {/* Social Links */}
                  <div className="flex justify-center gap-2 mb-4">
                    <a href={creator.email} className="size-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                      <Mail className="size-4" />
                    </a>
                    <a href={creator.socials.github} className="size-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                      <Github className="size-4" />
                    </a>
                    <a href={creator.socials.twitter} className="size-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                      <Twitter className="size-4" />
                    </a>
                    <a href={creator.socials.linkedin} className="size-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                      <Linkedin className="size-4" />
                    </a>
                  </div>

                  {/* Quick Interests */}
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {creator.interests.slice(0, 3).map((interest, i) => (
                      <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full bg-white/10 ${interest.color}`}>
                        {interest.label.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* Individual About Sections */}
        {creators.map((creator, index) => (
          <motion.section
            key={creator.id}
            id={`about-${creator.id}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="bg-card border rounded-2xl p-8 md:p-12 shadow-sm relative overflow-hidden">
              {/* Accent bar */}
              <div className={`absolute top-0 left-0 w-1.5 h-full ${index === 0 ? 'bg-green-brand dark:bg-red-brand' : 'bg-green-hover dark:bg-red-dark'}`} />
              
              <div className="flex items-start gap-6 mb-6">
                <div className="hidden sm:block flex-shrink-0">
                  <div className="w-24 h-24 rounded-xl overflow-hidden ring-2 ring-border">
                    <Image
                      src={creator.photo}
                      alt={creator.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <User className={`size-6 ${index === 0 ? 'text-green-brand dark:text-red-brand' : 'text-green-hover dark:text-red-dark'}`} />
                    About {creator.name.split(' ')[0]}
                    {index === 1 && (
                      <span className="ml-2 text-xs bg-green-pale dark:bg-red-dark/30 text-green-hover dark:text-red-primary px-2 py-0.5 rounded-full font-normal">
                        Ph.D.
                      </span>
                    )}
                  </h2>
                  
                  <div className="space-y-4 text-muted-foreground mt-4">
                    <p className="text-base leading-relaxed">
                      {creator.bio.split(' ').map((word, i) => {
                        const keywords = ['Bioinformatics', 'Artificial Intelligence', 'Computational Biology', 'Scientific Innovation', 'Genomics', 'Transcriptomics', 'AI/ML'];
                        if (keywords.some(k => word.includes(k))) {
                          return <span key={i} className={`${index === 0 ? 'text-green-brand dark:text-red-brand' : 'text-green-hover dark:text-red-dark'} font-medium`}>{word} </span>;
                        }
                        return word + ' ';
                      })}
                    </p>
                    
                    <div className={`bg-gradient-to-r ${index === 0 ? 'from-green-brand/10 to-purple-500/10 border-green-brand/20' : 'from-green-brand/10 to-teal-500/10 border-green-brand/20'} border rounded-xl p-6`}>
                      <h3 className="font-bold text-foreground text-lg mb-2 flex items-center gap-2">
                        <Target className={`size-5 ${index === 0 ? 'text-green-brand dark:text-red-brand' : 'text-green-hover dark:text-red-dark'}`} />
                        {index === 0 ? 'BioAlign Vision' : 'Research Focus'}
                      </h3>
                      <p className="text-foreground/80 text-sm leading-relaxed">
                        {creator.vision}
                      </p>
                    </div>
                    
                    {index === 1 && (
                      <div className="bg-muted/50 border rounded-xl p-4">
                        <h4 className="font-medium text-foreground text-sm mb-2 flex items-center gap-2">
                          <Award className="size-4 text-yellow-500" />
                          Academic Background
                        </h4>
                        <ul className="text-sm space-y-1">
                          <li>• M.Sc. from ICAR–IARI, New Delhi</li>
                          <li>• Ph.D. from ICAR–IARI, New Delhi</li>
                          <li>• Specialization: Genomics & Bioinformatics</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Quote */}
                  <blockquote className="mt-6 pl-6 border-l-4 border-current italic text-lg text-muted-foreground">
                    <p className="text-foreground">
                      "{creator.quote}"
                    </p>
                    <footer className={`mt-2 ${index === 0 ? 'text-green-brand dark:text-red-brand' : 'text-green-hover dark:text-red-dark'} font-medium not-italic`}>
                      — {creator.name}
                    </footer>
                  </blockquote>
                </div>
              </div>
            </div>
          </motion.section>
        ))}

        {/* Shared Expertise Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Shared Expertise & Interests</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sharedInterests.map((interest, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-card border rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all group cursor-default"
              >
                <interest.icon className={`size-8 ${interest.color} mb-3 group-hover:scale-110 transition-transform`} />
                <p className="font-medium text-sm">{interest.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Collaboration Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-green-brand/5 via-purple-500/5 to-green-brand/5 border border-green-brand/10 rounded-2xl p-8 md:p-12"
        >
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-sm">
              <Heart className="size-4 text-red-500" />
              Student-Faculty Collaboration
            </div>
            
            <h2 className="text-3xl font-bold mb-4">Bridging Academia & Innovation</h2>
            <p className="text-muted-foreground text-lg mb-6">
              BioAlign represents a unique collaboration between experienced academic guidance and fresh student innovation. 
              Together, we're building tools that serve both the research community and the next generation of bioinformaticians.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border">
                <GraduationCap className="size-5 text-green-brand dark:text-red-brand" />
                <span className="text-sm font-medium">Academic Excellence</span>
              </div>
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border">
                <Sparkles className="size-5 text-purple-500" />
                <span className="text-sm font-medium">Student Innovation</span>
              </div>
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border">
                <Code2 className="size-5 text-green-hover dark:text-red-dark" />
                <span className="text-sm font-medium">Open Source</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Contact CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-green-brand via-rose-700 dark:from-red-brand dark:via-red-dark to-green-hover dark:to-red-dark rounded-2xl p-8 md:p-12 text-white text-center"
        >
          <Heart className="size-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Get In Touch!</h2>
          <p className="text-white/90 max-w-xl mx-auto mb-8">
            We're always open to discussing research collaborations, bioinformatics projects, or just having a chat about science and technology!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:toufikmahata20@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-green-brand dark:text-red-brand font-semibold rounded-xl hover:bg-white/90 transition-all no-underline"
            >
              <Mail className="size-5" />
              Contact Toufik
            </a>
            <a
              href="#about-nitesh"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('about-nitesh')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all no-underline border border-white/20"
            >
              <ExternalLink className="size-5" />
              Learn More About Dr. Sharma
            </a>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
