'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Coffee, 
  Heart, 
  Star, 
  Github, 
  Twitter, 
  Linkedin,
  ExternalLink,
  Sparkles,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Coffee options
const coffeeOptions = [
  {
    id: 'coffee',
    name: 'A Coffee',
    price: '$3',
    emoji: '☕',
    description: 'A warm cup of coffee to fuel my coding sessions',
    popular: true,
  },
  {
    id: 'latte',
    name: 'A Latte',
    price: '$5',
    emoji: '🥤',
    description: 'Fancy latte for those late-night debugging marathons',
  },
  {
    id: 'pizza',
    name: 'A Pizza Slice',
    price: '$8',
    emoji: '🍕',
    description: 'Pizza keeps me going during long development sprints',
  },
  {
    id: 'meal',
    name: 'Full Meal',
    price: '$15',
    emoji: '🍱',
    description: 'A proper meal while I build new features for you',
  },
  {
    id: 'server',
    name: 'Server Costs',
    price: '$25',
    emoji: '🖥️',
    description: 'Help cover server and infrastructure costs',
  },
];

interface SupportProps {
  onBack?: () => void;
}

export default function SupportPage({ onBack }: SupportProps) {
  const [selectedCoffee, setSelectedCoffee] = React.useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white py-16 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">☕</div>
          <div className="absolute bottom-10 right-10 text-9xl">❤️</div>
          <div className="absolute top-1/2 left-1/3 text-6xl">✨</div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4 text-white/80 hover:text-white hover:bg-white/20"
            >
              ← Back
            </Button>
          )}
          
          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-7xl mb-4"
            >
              ☕
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Buy Me a Coffee!</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              If BioAlign helps your research, consider supporting its development. 
              Every cup of coffee fuels new features and improvements! ☕
            </p>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Why Support Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold mb-6">Where Your Support Goes</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🖥️', title: 'Server Costs', desc: 'Keeping servers running 24/7' },
              { icon: '🔬', title: 'New Tools', desc: 'Adding more bioinformatics tools' },
              { icon: '🐛', title: 'Bug Fixes', desc: 'Quick fixes and improvements' },
            ].map((item, idx) => (
              <div key={idx} className="bg-card border rounded-xl p-6 hover:border-biored/30 transition-colors">
                <span className="text-4xl mb-3 block">{item.icon}</span>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Coffee Options */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Support Level</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coffeeOptions.map((coffee) => (
              <motion.button
                key={coffee.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCoffee(coffee.id)}
                className={`relative p-6 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  selectedCoffee === coffee.id 
                    ? 'border-biored bg-biored/5 shadow-lg shadow-biored/20' 
                    : 'border-border hover:border-biored/30 hover:shadow-md'
                }`}
              >
                {coffee.popular && (
                  <span className="absolute -top-2 right-4 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <Star className="size-3" /> Popular
                  </span>
                )}
                
                <span className="text-4xl mb-3 block">{coffee.emoji}</span>
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="font-semibold text-lg">{coffee.name}</h3>
                  <span className="text-xl font-bold text-biored">{coffee.price}</span>
                </div>
                <p className="text-sm text-muted-foreground">{coffee.description}</p>
                
                {selectedCoffee === coffee.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-4"
                  >
                    <Button className="w-full bg-biored hover:bg-biored-dark cursor-pointer">
                      <Heart className="size-4 mr-1" />
                      Support Now
                    </Button>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Alternative Support Methods */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
            <Sparkles className="size-6 text-yellow-400" />
            Other Ways to Support
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <a
              href="https://github.com/toufikmahata"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all no-underline group"
            >
              <Github className="size-6" />
              <div>
                <p className="font-medium group-hover:text-biored transition-colors">Star on GitHub</p>
                <p className="text-xs text-white/60">Show your appreciation</p>
              </div>
              <ExternalLink className="size-4 ml-auto opacity-50 group-hover:opacity-100" />
            </a>
            
            <a
              href="https://twitter.com/toufikmahata"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all no-underline group"
            >
              <Twitter className="size-6" />
              <div>
                <p className="font-medium group-hover:text-biored transition-colors">Follow on Twitter</p>
                <p className="text-xs text-white/60">Stay updated</p>
              </div>
              <ExternalLink className="size-4 ml-auto opacity-50 group-hover:opacity-100" />
            </a>
            
            <a
              href="https://linkedin.com/in/toufikmahata"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all no-underline group"
            >
              <Linkedin className="size-6" />
              <div>
                <p className="font-medium group-hover:text-biored transition-colors">Connect on LinkedIn</p>
                <p className="text-xs text-white/60">Professional network</p>
              </div>
              <ExternalLink className="size-4 ml-auto opacity-50 group-hover:opacity-100" />
            </a>
          </div>
        </motion.section>

        {/* Thank You Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-8"
        >
          <Gift className="size-12 text-biored mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Thank You! 🙏</h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Whether you buy a coffee, star the repo, or just use the platform—your support means everything. 
            Together, we're making bioinformatics accessible to everyone!
          </p>
          <p className="text-lg mt-4 font-medium text-biored">
            — Toufik Mahata ❤️
          </p>
        </motion.div>
      </div>
    </div>
  );
}
