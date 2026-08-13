'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Database,
  Globe,
  Moon,
  Sun,
  Monitor,
  Save,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SettingsProps {
  onBack?: () => void;
}

export default function SettingsSection({ onBack }: SettingsProps) {
  const [saved, setSaved] = React.useState(false);
  const [theme, setTheme] = React.useState('system');
  
  // Form state
  const [profile, setProfile] = React.useState({
    name: '',
    email: '',
    institution: '',
    orcid: '',
  });
  
  const [notifications, setNotifications] = React.useState({
    email: true,
    analysisComplete: true,
    newFeatures: false,
    newsletter: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white py-16"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4 text-white/70 hover:text-white hover:bg-white/10"
            >
              ← Back to Dashboard
            </Button>
          )}
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Settings className="size-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
              <p className="text-white/70 mt-1">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Profile Settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <User className="size-5 text-biored" />
            <h2 className="text-xl font-semibold">Profile Settings</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Dr. Jane Smith" 
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="jane@university.edu" 
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <Input 
                id="institution" 
                placeholder="University / Organization" 
                value={profile.institution}
                onChange={(e) => setProfile({...profile, institution: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="orcid">ORCID ID (Optional)</Label>
              <Input 
                id="orcid" 
                placeholder="0000-0000-0000-0000" 
                value={profile.orcid}
                onChange={(e) => setProfile({...profile, orcid: e.target.value})}
              />
            </div>
          </div>
        </motion.section>

        {/* Appearance Settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Palette className="size-5 text-purple-500" />
            <h2 className="text-xl font-semibold">Appearance</h2>
          </div>
          
          <div className="space-y-4">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'system', icon: Monitor, label: 'System' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all cursor-pointer ${
                    theme === option.value 
                      ? 'border-biored bg-biored/5 text-biored' 
                      : 'hover:border-border'
                  }`}
                >
                  <option.icon className="size-5" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <Label>Language / Region</Label>
            <Select defaultValue="en">
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (US)</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="hi">हिन्दी</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.section>

        {/* Notification Settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Bell className="size-5 text-yellow-500" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
              { key: 'analysisComplete', label: 'Analysis Complete', desc: 'Get notified when analysis finishes' },
              { key: 'newFeatures', label: 'New Features', desc: 'Learn about new tools and features' },
              { key: 'newsletter', label: 'Newsletter', desc: 'Weekly bioinformatics digest' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={notifications[item.key as keyof typeof notifications]}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, [item.key]: checked})
                  }
                />
              </div>
            ))}
          </div>
        </motion.section>

        {/* Data & Privacy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="size-5 text-green-500" />
            <h2 className="text-xl font-semibold">Data & Privacy</h2>
          </div>
          
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start gap-2 cursor-pointer">
              <Database className="size-4" />
              Export My Data
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 cursor-pointer text-destructive hover:text-destructive">
              <RotateCcw className="size-4" />
              Reset All Data
            </Button>
          </div>
        </motion.section>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-end gap-4"
        >
          <Button variant="outline" onClick={onBack} className="cursor-pointer">
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-biored hover:bg-biored-dark text-white cursor-pointer min-w-[120px]"
          >
            {saved ? (
              <>
                <CheckCircle2 className="size-4 mr-1" />
                Saved!
              </>
            ) : (
              <>
                <Save className="size-4 mr-1" />
                Save Changes
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
