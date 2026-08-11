import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, User, Copy, Check, ShieldAlert, Code2, RefreshCw } from 'lucide-react';
import { Vulnerability, CoPilotMessage } from '../types';
import { cn } from '../lib/utils';

interface CoPilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVuln?: Vulnerability | null;
  scanId?: string;
  repoFullName: string;
}

export function CoPilotDrawer({ isOpen, onClose, selectedVuln, scanId, repoFullName }: CoPilotDrawerProps) {
  const [messages, setMessages] = useState<CoPilotMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello! I'm your **GitArmor AI Security Co-Pilot**. How can I assist you with securing \`${repoFullName}\` today?`,
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedVuln) {
      setMessages((prev) => [
        ...prev,
        {
          id: `vuln-context-${Date.now()}`,
          sender: 'assistant',
          text: `🔍 **Context Switch**: I see you're inspecting **${selectedVuln.vulnerabilityClass.toUpperCase()}** in \`${selectedVuln.filePath}\` (Lines ${selectedVuln.startLine}-${selectedVuln.endLine}, CWE: ${selectedVuln.cweId || 'CWE-20'}). Ask me how to remediate or test this finding!`,
          timestamp: Date.now(),
        }
      ]);
    }
  }, [selectedVuln]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: CoPilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          vulnContext: selectedVuln,
          repoContext: repoFullName,
          history: messages.slice(-6),
        }),
      });

      if (!res.ok) throw new Error('Failed to get Co-Pilot response');
      const data = await res.json();

      const aiMsg: CoPilotMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.text || 'I analyzed your prompt. Always use parameterized statements and validate inputs.',
        timestamp: data.timestamp || Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: "⚠️ **Note**: Co-Pilot service fallback. Recommended remediation is to apply parameterized SQL queries, strict type checks, and content security policy headers.",
          timestamp: Date.now(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    "How do I fix this vulnerability safely?",
    "Generate a unit test verifying this security fix",
    "Explain OWASP impact & CWE risk score",
    "Show input sanitization example code"
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-gray-900 border-l border-gray-800 shadow-2xl z-50 flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/80 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-brand-cyan/20 to-brand-emerald/20 border border-brand-cyan/30">
            <Sparkles className="w-5 h-5 text-brand-cyan animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              GitArmor AI Co-Pilot
              <span className="text-[10px] bg-brand-cyan/15 text-brand-cyan px-2 py-0.5 rounded-full border border-brand-cyan/30 font-mono font-semibold">
                Gemini 2.5
              </span>
            </h3>
            <p className="text-xs text-gray-400">Context: {selectedVuln ? selectedVuln.filePath : repoFullName}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Selected Vuln Banner */}
      {selectedVuln && (
        <div className="px-4 py-2 bg-gray-950/70 border-b border-gray-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-300 truncate">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-mono text-amber-300 font-semibold">{selectedVuln.vulnerabilityClass.toUpperCase()}</span>
            <span className="text-gray-500">•</span>
            <span className="truncate">{selectedVuln.filePath}:{selectedVuln.startLine}</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 text-sm",
              msg.sender === 'user' ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold",
              msg.sender === 'user' ? "bg-brand-emerald text-gray-950" : "bg-gray-800 text-brand-cyan border border-gray-700"
            )}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={cn(
              "rounded-xl p-3.5 max-w-[85%] leading-relaxed text-xs sm:text-sm",
              msg.sender === 'user' 
                ? "bg-brand-emerald/15 text-gray-100 border border-brand-emerald/30" 
                : "bg-gray-800/80 text-gray-200 border border-gray-700/80"
            )}>
              <div className="whitespace-pre-wrap font-sans space-y-2">
                {msg.text.split('\n').map((line, idx) => {
                  if (line.startsWith('```')) return null;
                  return <p key={idx}>{line}</p>;
                })}
              </div>

              {msg.sender === 'assistant' && (
                <div className="mt-2 pt-2 border-t border-gray-700/50 flex justify-end">
                  <button
                    onClick={() => copyToClipboard(msg.text, msg.id)}
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 text-sm">
            <div className="w-7 h-7 rounded-lg bg-gray-800 text-brand-cyan border border-gray-700 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="p-3 bg-gray-800/60 rounded-xl text-gray-400 text-xs flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-cyan" />
              <span>Analyzing code context with Gemini 2.5...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      <div className="p-3 border-t border-gray-800/80 bg-gray-950/40">
        <p className="text-[11px] font-semibold text-gray-400 mb-2 flex items-center gap-1">
          <Code2 className="w-3 h-3 text-brand-cyan" /> Quick AI Prompts
        </p>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              disabled={loading}
              className="text-[11px] px-2.5 py-1 bg-gray-800 hover:bg-gray-700 hover:text-brand-cyan text-gray-300 rounded-lg border border-gray-700/60 transition-all text-left truncate max-w-full cursor-pointer disabled:opacity-50"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-gray-800 bg-gray-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedVuln ? `Ask about ${selectedVuln.filePath}...` : "Ask AI Co-Pilot anything about security..."}
            className="flex-1 bg-gray-950 border border-gray-800 focus:border-brand-cyan text-white text-xs rounded-xl px-3.5 py-2.5 outline-none transition-all placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-brand-cyan hover:bg-cyan-400 text-gray-950 rounded-xl font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
