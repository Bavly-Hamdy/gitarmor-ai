import React, { useState, useEffect } from 'react';
import { Scan } from '../types';
import { Cpu, GitBranch, FileCode, ShieldCheck, AlertCircle, Loader2, CheckCircle2, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { cn } from '../lib/utils';

interface AnalysisProgressBarProps {
  scan: Scan;
  className?: string;
}

const STAGES = [
  { id: 'cloning', label: '1. Repo Checkout', icon: GitBranch, desc: 'Fetch Git tree & resolve ref' },
  { id: 'parsing', label: '2. AST & File Chunking', icon: FileCode, desc: 'Parse code files & structure' },
  { id: 'analyzing', label: '3. Gemini AI Audit', icon: Cpu, desc: 'Deep vulnerability reasoning' },
  { id: 'completed', label: '4. Report Synthesis', icon: ShieldCheck, desc: 'Security score & findings' },
];

export function AnalysisProgressBar({ scan, className }: AnalysisProgressBarProps) {
  const [showLogs, setShowLogs] = useState(false);
  const [tickerMessageIndex, setTickerMessageIndex] = useState(0);

  const isFailed = scan.status === 'failed';
  const isCompleted = scan.status === 'completed';

  // Calculate granular percentage
  let progressPercentage = 0;
  if (isCompleted) {
    progressPercentage = 100;
  } else if (isFailed) {
    progressPercentage = 100;
  } else {
    const total = scan.progress?.chunksTotal || 10;
    const processed = scan.progress?.chunksProcessed || 0;

    if (scan.status === 'cloning') {
      progressPercentage = Math.min(25, Math.max(10, Math.round((processed / total) * 25)));
    } else if (scan.status === 'parsing') {
      progressPercentage = Math.min(65, Math.max(30, 25 + Math.round((processed / total) * 40)));
    } else if (scan.status === 'analyzing') {
      progressPercentage = Math.min(95, Math.max(70, 65 + Math.round((processed / total) * 30)));
    } else {
      progressPercentage = 5;
    }
  }

  // Simulated live security audit micro-checks ticker
  const microTickerMessages = [
    'Scanning route handlers for unhandled SQL injection parameters...',
    'Inspecting JWT secret handling & cookie security flags...',
    'Analyzing Cross-Site Scripting (XSS) input sanitization points...',
    'Checking SSRF protection in HTTP client invocations...',
    'Auditing file system path traversal risks in file upload routes...',
    'Verifying OWASP Top 10 compliance & CWE cross-references...',
  ];

  useEffect(() => {
    if (!isCompleted && !isFailed) {
      const interval = setInterval(() => {
        setTickerMessageIndex(prev => (prev + 1) % microTickerMessages.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isCompleted, isFailed]);

  // Determine active stage index
  const getStageStatus = (stageId: string, index: number) => {
    const stageOrder = ['queued', 'cloning', 'parsing', 'analyzing', 'completed'];
    const currentOrderIndex = stageOrder.indexOf(scan.status);

    if (isFailed) {
      if (currentOrderIndex === index) return 'failed';
      if (currentOrderIndex > index) return 'done';
      return 'pending';
    }

    if (isCompleted) return 'done';
    if (currentOrderIndex > index) return 'done';
    if (currentOrderIndex === index) return 'active';
    return 'pending';
  };

  return (
    <div className={cn("glass-panel p-5 border border-brand-cyan/20 bg-gray-900/80 shadow-xl rounded-xl relative overflow-hidden transition-all", className)}>
      {/* Background glowing glow accent */}
      {!isCompleted && !isFailed && (
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2.5 rounded-lg border flex items-center justify-center",
            isFailed
              ? "bg-brand-rose/20 text-brand-rose border-brand-rose/30"
              : isCompleted
              ? "bg-brand-emerald/20 text-brand-emerald border-brand-emerald/30"
              : "bg-brand-cyan/20 text-brand-cyan border-brand-cyan/30 animate-pulse"
          )}>
            {isFailed ? (
              <AlertCircle className="w-5 h-5" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                {isFailed
                  ? 'Analysis Interrupted'
                  : isCompleted
                  ? 'Vulnerability Analysis Complete'
                  : 'Real-Time Vulnerability Analysis in Progress'}
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-800 text-brand-cyan border border-brand-cyan/30 font-bold">
                {progressPercentage}%
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
              <span>{scan.repoFullName}</span>
              <span className="text-gray-600">•</span>
              <span className="font-mono text-gray-300">branch: {scan.ref}</span>
            </p>
          </div>
        </div>

        {/* Live Status Pill & Toggle Logs Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-brand-cyan" />
            <span>{showLogs ? 'Hide Console' : 'View Scan Console'}</span>
            {showLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Glowing Progress Bar */}
      <div className="space-y-1.5 mb-5">
        <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
          <span className="flex items-center gap-1.5 truncate max-w-[70%]">
            {!isCompleted && !isFailed && <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping inline-block shrink-0" />}
            <span className="text-gray-200 font-medium truncate">
              {scan.activeStepLabel || scan.currentFile || 'Initializing AI model runtime...'}
            </span>
          </span>
          <span className="text-brand-cyan font-bold shrink-0">
            {scan.progress?.chunksProcessed || 0} / {scan.progress?.chunksTotal || 1} Chunks
          </span>
        </div>

        <div className="relative w-full h-3 bg-gray-800/90 rounded-full overflow-hidden border border-gray-700/80 p-0.5 shadow-inner">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden",
              isFailed
                ? "bg-brand-rose"
                : isCompleted
                ? "bg-brand-emerald"
                : "bg-gradient-to-r from-brand-cyan via-blue-500 to-brand-emerald"
            )}
            style={{ width: `${progressPercentage}%` }}
          >
            {/* Animated shimmer light effect over progress bar */}
            {!isCompleted && !isFailed && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            )}
          </div>
        </div>
      </div>

      {/* 4-Stage Step Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-t border-gray-800/80 pt-4">
        {STAGES.map((stage, idx) => {
          const status = getStageStatus(stage.id, idx);
          const Icon = stage.icon;

          return (
            <div
              key={stage.id}
              className={cn(
                "p-2.5 rounded-lg border text-left transition-all",
                status === 'done'
                  ? "bg-gray-800/40 border-brand-emerald/30 text-gray-200"
                  : status === 'active'
                  ? "bg-brand-cyan/10 border-brand-cyan/50 text-white shadow-sm ring-1 ring-brand-cyan/30"
                  : status === 'failed'
                  ? "bg-brand-rose/10 border-brand-rose/30 text-brand-rose"
                  : "bg-gray-800/20 border-gray-800/60 text-gray-500"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Icon className={cn(
                    "w-3.5 h-3.5",
                    status === 'done' ? "text-brand-emerald" : status === 'active' ? "text-brand-cyan animate-pulse" : "text-gray-500"
                  )} />
                  {stage.label}
                </span>

                {status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald" />}
                {status === 'active' && <Loader2 className="w-3.5 h-3.5 text-brand-cyan animate-spin" />}
              </div>

              <p className="text-[11px] text-gray-400 line-clamp-1">
                {status === 'active' && scan.currentFile ? `File: ${scan.currentFile}` : stage.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Live Activity Console / Log Ticker */}
      {(showLogs || (!isCompleted && !isFailed)) && (
        <div className="mt-4 pt-3 border-t border-gray-800/60 bg-gray-950/80 rounded-lg p-3 font-mono text-xs text-gray-300 border border-gray-800">
          <div className="flex items-center justify-between text-gray-500 mb-1.5 text-[11px] border-b border-gray-800 pb-1">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-brand-cyan" /> Real-Time Audit Log
            </span>
            <span className="text-brand-cyan">Gemini 2.5 Flash Engine</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-start gap-2 text-gray-300">
              <span className="text-brand-cyan font-bold">›</span>
              <span className="text-gray-400 font-semibold">{scan.activeStepLabel || 'Initializing...'}</span>
            </div>

            {scan.currentFile && (
              <div className="flex items-start gap-2 text-gray-400 pl-3">
                <span className="text-gray-600">└</span>
                <span>Inspecting AST & data flow: <code className="text-brand-amber">{scan.currentFile}</code></span>
              </div>
            )}

            {!isCompleted && !isFailed && (
              <div className="flex items-start gap-2 text-brand-cyan/80 pt-0.5 animate-pulse">
                <span>⚡</span>
                <span className="italic">{microTickerMessages[tickerMessageIndex]}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
