"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
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
  Loader2,
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
    <div className="flex items-start gap-3 px-4 py-3">
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
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-code:text-[#C1121F] dark:prose-code:text-red-400 prose-pre:bg-background prose-pre:border prose-table:text-xs prose-li:my-0.5">
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
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
    <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 text-center overflow-y-auto">
      {/* Avatar and greeting */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="mb-5 sm:mb-6"
      >
        <div className="relative inline-block">
          <Avatar className="h-14 w-14 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 ring-4 ring-[#C1121F]/20">
            <AvatarFallback className="bg-gradient-to-br from-[#C1121F] to-[#780000] text-white text-lg sm:text-xl">
              <Dna className="h-6 w-6 sm:h-8 sm:w-8" />
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-background animate-pulse" />
        </div>
        <h2 className="text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2">Hello! I&apos;m BioAssist</h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md px-2">
          Your AI-powered bioinformatics assistant. Ask me anything about sequence analysis,
          genomics workflows, or data interpretation.
        </p>
      </motion.div>

      {/* Suggested prompts */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-lg space-y-2.5 sm:space-y-3 px-2"
      >
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-left">
          Try asking about...
        </p>
        <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
          {suggestedPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onPromptClick(prompt)}
              className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border bg-card hover:bg-accent/50 
                         transition-all duration-200 group text-left cursor-pointer 
                         active:scale-[0.98] touch-manipulation"
            >
              <Sparkles className="h-4 w-4 text-[#C1121F] flex-shrink-0" />
              <span className="text-xs sm:text-sm flex-1">{prompt}</span>
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-auto text-muted-foreground group-hover:text-[#C1121F] transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Capabilities grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-lg mt-4 sm:mt-6 pt-4 sm:pt-6 border-t px-2"
      >
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5 sm:mb-3 text-left">
          What I can help with
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
          {capabilities.map((capability, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-1 sm:gap-1.5 p-2 sm:p-3 rounded-lg bg-muted/50"
            >
              <capability.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${capability.color}`} />
              <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">
                {capability.title}
              </span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground text-center hidden sm:block">
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
function ErrorState({ onRetry, isRetrying }: { onRetry: () => void; isRetrying: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
        {isRetrying ? (
          <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
        ) : (
          <AlertCircle className="h-8 w-8 text-red-500" />
        )}
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {isRetrying ? "Reconnecting..." : "Something went wrong"}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {isRetrying 
          ? "Attempting to reconnect to the AI service..."
          : "Unable to connect to the AI service. Please check your connection and try again."
        }
      </p>
      {!isRetrying && (
        <Button
          onClick={onRetry}
          className="bg-[#C1121F] hover:bg-[#A00E19] text-white cursor-pointer"
        >
          Try Again
        </Button>
      )}
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    setHasError(false);
    sendMessage(inputValue);
    setInputValue("");
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = async (prompt: string) => {
    setHasError(false);
    sendMessage(prompt);
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setHasError(false);
    
    // Simulate a brief delay then just clear error state
    // The actual retry will happen when user sends a new message
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRetrying(false);
    setHasError(false);
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
              className="fixed right-0 top-0 z-50 h-full w-full sm:w-[400px] md:w-[420px] lg:w-[450px]
                         flex flex-col shadow-2xl md:rounded-l-2xl overflow-hidden
                         bg-background/95 backdrop-blur-xl"
            >
              {/* Header */}
              <div className="relative flex items-center justify-between px-4 py-3 border-b bg-card/50 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 ring-2 ring-[#C1121F]/20 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-[#C1121F] to-[#780000] text-white">
                      <Dna className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">BioAssist</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-muted-foreground">Online • Ready to help</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 flex-shrink-0">
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

              {/* Messages area - with proper scrolling */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto overscroll-contain"
                style={{
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <div className="min-h-full flex flex-col">
                  {hasError && messages.length === 0 ? (
                    <ErrorState onRetry={handleRetry} isRetrying={isRetrying} />
                  ) : messages.length === 0 ? (
                    <WelcomeScreen onPromptClick={handlePromptClick} />
                  ) : (
                    <div className="py-4 space-y-1 flex flex-col">
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
              </div>

              {/* Input area */}
              <div className="relative border-t bg-card/70 p-3 sm:p-4 flex-shrink-0">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask me anything about bioinformatics..."
                      rows={1}
                      className="w-full resize-none rounded-xl border bg-background px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm
                                 placeholder:text-muted-foreground focus-visible:outline-none 
                                 focus-visible:ring-2 focus-visible:ring-[#C1121F]/50 focus-visible:border-transparent
                                 max-h-32 min-h-[40px] sm:min-h-[44px] transition-all"
                      style={{
                        height: "auto",
                        minHeight: "40px",
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
                    className="h-10 w-10 sm:h-[44px] sm:w-[44px] rounded-xl bg-gradient-to-r from-[#C1121F] to-[#A00E19]
                               hover:from-[#A00E19] hover:to-[#C1121F] shadow-md disabled:opacity-50 cursor-pointer flex-shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <p className="text-[10px] text-muted-foreground mt-1.5 sm:mt-2 text-center">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
