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
  Minimize2,
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
          <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-[#C1121F]" style={{ animationDelay: "0ms" }} />
          <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-[#C1121F]" style={{ animationDelay: "150ms" }} />
          <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-[#C1121F]" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

// Message bubble component
function MessageBubble({ message, onCopy }: { message: Message; onCopy: (content: string) => Promise<boolean> }) {
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
    <div className={`flex items-start gap-3 px-4 py-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className={isUser ? "bg-primary text-primary-foreground text-xs" : "bg-gradient-to-br from-[#C1121F] to-[#780000] text-white text-xs"}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={`group relative max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-4 py-3 ${isUser ? "bg-[#C1121F] text-white rounded-tr-md" : "bg-muted rounded-tl-md"}`}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-code:text-[#C1121F] prose-pre:bg-background prose-pre:border prose-table:text-xs">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        <div className={`flex items-center gap-2 mt-1 ${isUser ? "justify-end" : "justify-start"}`}>
          <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleCopy}>
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
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
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", duration: 0.5 }} className="mb-5 sm:mb-6">
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
          Your AI-powered bioinformatics assistant. Ask me anything about sequence analysis, genomics workflows, or data interpretation.
        </p>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-full max-w-lg space-y-2.5 sm:space-y-3 px-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-left">Try asking about...</p>
        <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
          {suggestedPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onPromptClick(prompt)}
              className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border bg-card hover:bg-accent/50 transition-all duration-200 group text-left cursor-pointer active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4 text-[#C1121F] flex-shrink-0" />
              <span className="text-xs sm:text-sm flex-1">{prompt}</span>
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-auto text-muted-foreground group-hover:text-[#C1121F] transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Main AI Assistant component - Simplified and robust
export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("bioassist_chat_history");
      if (stored) {
        const parsed = JSON.parse(stored) as Message[];
        setMessages(parsed.map((msg: Message) => ({ ...msg, timestamp: new Date(msg.timestamp) })));
      }
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem("bioassist_chat_history", JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save chat history:", e);
    }
  }, [messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen]);

  // Generate a unique ID
  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Send message function with direct API call
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message immediately
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInputValue("");

    try {
      console.log("[BioAssist] Sending message to API...");
      
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content.trim(),
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      console.log("[BioAssist] API response status:", response.status);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiContent = data.response || data.content || data.message || "";

      if (!aiContent.trim()) {
        throw new Error("Empty response from AI");
      }

      // Add AI response
      const aiMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: aiContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      console.log("[BioAssist] Response received successfully");

    } catch (error) {
      console.error("[BioAssist] Error:", error);
      
      // Fallback response if API fails
      const fallbackResponse = getFallbackResponse(content.trim());
      
      const fallbackMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: fallbackResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, fallbackMessage]);
      console.log("[BioAssist] Using fallback response");
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback responses for common queries
  const getFallbackResponse = (query: string): string => {
    const q = query.toLowerCase();
    
    if (q.includes("blast") || q.includes("alignment result")) {
      return `## BLAST Results Interpretation 🧬

Your **BLAST** results can be interpreted by examining these key metrics:

| Metric | Description | Good Threshold |
|--------|-------------|----------------|
| **E-value** | Expected hits by chance | < 0.001 |
| **Identity** | % identical residues | > 30% |
| **Bit Score** | Alignment quality | Higher is better |

### Key Points:
- **HSPs**: High-scoring segment pairs show local alignments
- **Color coding**: Red = perfect match, Green = similar
- **Gaps**: Represent insertions/deletions

Would you like help with phylogenetic analysis?`;
    }

    if (q.includes("rna-seq") || q.includes("rnaseq") || q.includes("expression")) {
      return `## RNA-seq Analysis Pipeline 📊

Standard workflow for RNA sequencing data:

\`\`\`
QC → Trimming → Alignment → Quantification → DE Analysis → Visualization
\`\`\`

### Recommended Tools:
| Step | Tool | Purpose |
|------|------|---------|
| QC | FastQC | Quality control |
| Alignment | STAR | Splice-aware aligner |
| Quantification | featureCounts | Read counting |
| DE Analysis | DESeq2 | Differential expression |

Need help with a specific step?`;
    }

    if (q.includes("primer") || q.includes("pcr")) {
      return `## Primer Design Guide 🧪

### Optimal Parameters:
| Parameter | Range | Importance |
|-----------|-------|------------|
| Length | 18-25 bp | Specificity |
| Tm | 55-65°C | Efficient PCR |
| GC% | 40-60% | Stability |

### Checklist:
- ✅ Avoid runs of >4 identical nucleotides
- ✅ No self-complementarity
- ✅ End with G/C (GC clamp)
- ✅ Amplicon size appropriate

Want help designing primers for a specific sequence?`;
    }

    if (q.includes("vcf") || q.includes("variant") || q.includes("snp")) {
      return `## VCF File Guide 🔬

### Key Columns:
| Column | Meaning |
|--------|---------|
| CHROM | Chromosome |
| POS | Position (1-based) |
| REF | Reference allele |
| ALT | Alternate allele |
| QUAL | Quality score |

### Common INFO fields:
- **DP**: Read depth
- **AF**: Allele frequency
- **Gene**: Affected gene

Have a specific VCF file to analyze?`;
    }

    // Default response
    return `## Hello! I'm BioAssist 🧬

I'm your AI bioinformatics assistant. I can help you with:

- **Analysis Explanation**: BLAST, VCF, alignment results
- **Workflow Guidance**: RNA-seq, variant calling pipelines
- **Error Diagnosis**: Debugging bioinformatics issues
- **Code Generation**: Python/R scripts

You asked about: *"${query}"*

Could you provide more details? For example:
- What type of data do you have?
- What analysis are you trying to perform?
- Are you seeing any errors?`;
  };

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue);
    setInputValue("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem("bioassist_chat_history");
  };

  const copyMessage = async (content: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch {
      return false;
    }
  };

  // Animation variants
  const panelVariants = {
    closed: { x: "100%", opacity: 0, transition: { duration: 0.3 } },
    open: { x: 0, opacity: 1, transition: { duration: 0.35 } },
  };

  const floatingButtonVariants = {
    open: { scale: 0, rotate: 90, opacity: 0 },
    closed: { scale: 1, rotate: 0, opacity: 1 },
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            variants={floatingButtonVariants}
            initial="closed"
            animate="closed"
            exit="open"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-[#C1121F] to-[#780000]
                       shadow-lg shadow-[#C1121F]/30 flex items-center justify-center text-white
                       hover:shadow-xl hover:shadow-[#C1121F]/40 transition-shadow cursor-pointer"
            aria-label="Open AI Assistant"
          >
            <MessageSquare className="h-6 w-6" />
            <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-background animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
                         flex flex-col shadow-2xl md:rounded-l-2xl overflow-hidden bg-background/95 backdrop-blur-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-card/50 flex-shrink-0">
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
                      <span className="text-xs text-muted-foreground">Online</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {messages.length > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={clearMessages}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Clear chat</TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setIsOpen(false)}>
                        <Minimize2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Minimize</TooltipContent>
                  </Tooltip>
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden cursor-pointer" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages area */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overscroll-contain">
                <div className="min-h-full flex flex-col">
                  {messages.length === 0 ? (
                    <WelcomeScreen onPromptClick={(prompt) => sendMessage(prompt)} />
                  ) : (
                    <div className="py-4 space-y-1 flex flex-col">
                      {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} onCopy={copyMessage} />
                      ))}
                      {isLoading && <TypingIndicator />}
                      <div ref={messagesEndRef as React.RefObject<HTMLDivElement>} />
                    </div>
                  )}
                </div>
              </div>

              {/* Input area */}
              <div className="relative border-t bg-card/70 p-3 sm:p-4 flex-shrink-0">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = Math.min(target.scrollHeight, 128) + "px";
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything about bioinformatics..."
                    rows={1}
                    className="w-full resize-none rounded-xl border bg-background px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm
                               placeholder:text-muted-foreground focus-visible:outline-none 
                               focus-visible:ring-2 focus-visible:ring-[#C1121F]/50 focus-visible:border-transparent
                               max-h-32 min-h-[40px] sm:min-h-[44px] transition-all"
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className="h-10 w-10 sm:h-[44px] sm:w-[44px] rounded-xl bg-gradient-to-r from-[#C1121F] to-[#A00E19]
                               hover:from-[#A00E19] hover:to-[#C1121F] shadow-md disabled:opacity-50 cursor-pointer flex-shrink-0"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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
