"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAIChat, type Message } from "@/hooks/use-ai-chat";
import {
  MessageSquare,
  X,
  Send,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Bot,
  User,
  ChevronRight,
  Dna,
  FlaskConical,
  Bug,
  BookOpen,
  ClipboardList,
  Code2,
  Minimize2,
  AlertCircle,
} from "lucide-react";

// Suggested prompts for quick actions
const suggestedPrompts = [
  "Explain my BLAST results",
  "How do I analyze RNA-seq data?",
  "Design primers for this sequence",
  "What is the best alignment tool?",
  "Help me interpret this VCF file",
];

// AI Capabilities
const capabilities = [
  {
    icon: Dna,
    title: "Analysis Explanation",
    description: "Interpret complex results",
    color: "text-emerald-500",
  },
  {
    icon: FlaskConical,
    title: "Workflow Guidance",
    description: "Suggest analysis pipelines",
    color: "text-blue-500",
  },
  {
    icon: Bug,
    title: "Error Diagnosis",
    description: "Help debug issues",
    color: "text-orange-500",
  },
  {
    icon: BookOpen,
    title: "Literature Search",
    description: "Find relevant papers",
    color: "text-purple-500",
  },
  {
    icon: ClipboardList,
    title: "Protocol Recommendations",
    description: "Suggest methods",
    color: "text-pink-500",
  },
  {
    icon: Code2,
    title: "Code Generation",
    description: "Write Python/R scripts",
    color: "text-cyan-500",
  },
];

// Typing indicator animation
function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-2">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-[#C1121F] to-[#780000] text-white text-xs">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="rounded-2xl rounded-tl-md bg-muted px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 animate-bounce rounded-full bg-[#C1121F]"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="inline-block h-2 w-2 animate-bounce rounded-full bg-[#C1121F]"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="inline-block h-2 w-2 animate-bounce rounded-full bg-[#C1121F]"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

// Message bubble component
function MessageBubble({
  message,
  onCopy,
}: {
  message: Message;
  onCopy: (content: string) => Promise<boolean>;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    const success = await onCopy(message.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-2 ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback
          className={
            isUser
              ? "bg-primary text-primary-foreground text-xs"
              : "bg-gradient-to-br from-[#C1121F] to-[#780000] text-white text-xs"
          }
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={`group relative max-w-[80%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-[#C1121F] text-white rounded-tr-md"
              : "bg-muted rounded-tl-md"
          }`}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-code:text-[#C1121F] dark:prose-code:text-red-400 prose-pre:bg-background prose-pre:border prose-table:text-xs">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp and copy button */}
        <div
          className={`flex items-center gap-2 mt-1 ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Copy message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

// Welcome screen component
function WelcomeScreen({ onPromptClick }: { onPromptClick: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      {/* Avatar and greeting */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="mb-6"
      >
        <Avatar className="h-16 w-16 mx-auto mb-4 ring-4 ring-[#C1121F]/20">
          <AvatarFallback className="bg-gradient-to-br from-[#C1121F] to-[#780000] text-white text-xl">
            <Dna className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold mb-2">Hello! I&apos;m BioAssist</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Your AI-powered bioinformatics assistant. Ask me anything about sequence analysis,
          genomics workflows, or data interpretation.
        </p>
      </motion.div>

      {/* Suggested prompts */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-lg space-y-3"
      >
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Try asking about...
        </p>
        <div className="grid grid-cols-1 gap-2">
          {suggestedPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onPromptClick(prompt)}
              className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent/50 
                         transition-all duration-200 group text-left cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-[#C1121F] flex-shrink-0" />
              <span className="text-sm">{prompt}</span>
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-[#C1121F] transition-colors" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Capabilities grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-lg mt-6 pt-6 border-t"
      >
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          What I can help with
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {capabilities.map((capability, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-muted/50"
            >
              <capability.icon className={`h-5 w-5 ${capability.color}`} />
              <span className="text-xs font-medium text-center leading-tight">
                {capability.title}
              </span>
              <span className="text-[10px] text-muted-foreground text-center">
                {capability.description}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Error state component
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        Unable to connect to the AI service. Please check your connection and try again.
      </p>
      <Button
        onClick={onRetry}
        className="bg-[#C1121F] hover:bg-[#A00E19] text-white cursor-pointer"
      >
        Try Again
      </Button>
    </div>
  );
}

// Main AI Assistant component
export default function AIAssistant() {
  const {
    messages,
    isLoading,
    isOpen,
    messagesEndRef,
    sendMessage,
    clearMessages,
    copyMessage,
    toggleOpen,
    setIsOpen,
  } = useAIChat();

  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setHasError(false);
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setHasError(false);
    sendMessage(prompt);
  };

  const handleRetry = () => {
    setHasError(false);
    // The sendMessage function will retry the API call
  };

  // Animation variants
  const panelVariants = {
    closed: {
      x: "100%",
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    open: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
    },
  };

  const floatingButtonVariants = {
    open: { scale: 0, rotate: 90, opacity: 0 },
    closed: { scale: 1, rotate: 0, opacity: 1 },
  };

  return (
    <>
      {/* Floating button - bottom right */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            variants={floatingButtonVariants}
            initial="closed"
            animate="closed"
            exit="open"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleOpen}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-[#C1121F] to-[#780000] 
                       shadow-lg shadow-[#C1121F]/30 flex items-center justify-center text-white
                       hover:shadow-xl hover:shadow-[#C1121F]/40 transition-shadow cursor-pointer"
            aria-label="Open AI Assistant"
          >
            <MessageSquare className="h-6 w-6" />
            
            {/* Pulse indicator */}
            <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-background animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel - slides in from right */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Main panel */}
            <motion.div
              variants={panelVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed right-0 top-0 z-50 h-full w-full md:w-[420px] lg:w-[450px]
                         flex flex-col shadow-2xl md:rounded-l-2xl overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              {/* Dark mode support via CSS variables */}
              <style>{`
                .dark .ai-assistant-panel {
                  background: rgba(15, 23, 42, 0.98) !important;
                }
              `}</style>
              <div className="ai-assistant-panel absolute inset-0 bg-inherit" />

              {/* Header */}
              <div className="relative flex items-center justify-between px-4 py-3 border-b bg-white/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-[#C1121F]/20">
                    <AvatarFallback className="bg-gradient-to-br from-[#C1121F] to-[#780000] text-white">
                      <Dna className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-sm">BioAssist</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-muted-foreground">Online</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Clear chat button */}
                  {messages.length > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer"
                          onClick={clearMessages}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Clear chat</TooltipContent>
                    </Tooltip>
                  )}

                  {/* Minimize button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                        onClick={() => setIsOpen(false)}
                      >
                        <Minimize2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Minimize</TooltipContent>
                  </Tooltip>

                  {/* Close button (mobile only) */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 md:hidden cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages area */}
              <ScrollArea className="flex-1 relative" ref={scrollRef}>
                <div className="min-h-full">
                  {hasError && messages.length === 0 ? (
                    <ErrorState onRetry={handleRetry} />
                  ) : messages.length === 0 ? (
                    <WelcomeScreen onPromptClick={handlePromptClick} />
                  ) : (
                    <div className="py-4 space-y-1">
                      {messages.map((message) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          onCopy={copyMessage}
                        />
                      ))}

                      {/* Typing indicator */}
                      {isLoading && <TypingIndicator />}

                      {/* Scroll anchor */}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input area */}
              <div className="relative border-t bg-white/70 dark:bg-slate-900/70 p-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask me anything about bioinformatics..."
                      rows={1}
                      className="w-full resize-none rounded-xl border bg-background px-4 py-3 pr-12 text-sm
                                 placeholder:text-muted-foreground focus-visible:outline-none 
                                 focus-visible:ring-2 focus-visible:ring-[#C1121F]/50 focus-visible:border-transparent
                                 max-h-32 min-h-[44px] transition-all"
                      style={{
                        height: "auto",
                        minHeight: "44px",
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = Math.min(target.scrollHeight, 128) + "px";
                      }}
                    />
                  </div>

                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className="h-[44px] w-[44px] rounded-xl bg-gradient-to-r from-[#C1121F] to-[#A00E19]
                               hover:from-[#A00E19] hover:to-[#C1121F] shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  Press Enter to send, Shift+Enter for new line • BioAssist can make mistakes, verify important information
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
