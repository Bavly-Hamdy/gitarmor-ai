import { Vulnerability } from '../types';
import { AlertTriangle, Copy, Zap, CheckCircle, Tag, GitPullRequest } from 'lucide-react';
import { useScanEngine } from '../lib/scanEngine';
import { cn } from '../lib/utils';
import React, { useState } from 'react';
import { DiffViewer } from './DiffViewer';

interface VulnCardProps {
  key?: React.Key;
  vuln: Vulnerability;
  onShowPrompt: (vuln: Vulnerability) => void;
  onShowGraph: (vuln: Vulnerability) => void;
  onOpenSandbox?: (vuln: Vulnerability) => void;
}

export function VulnCard({ vuln, onShowPrompt, onShowGraph, onOpenSandbox }: VulnCardProps) {
  const { generateFix } = useScanEngine();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-sev-critical bg-sev-critical/10 border-sev-critical/20';
      case 'high': return 'text-sev-high bg-sev-high/10 border-sev-high/20';
      case 'medium': return 'text-sev-medium bg-sev-medium/10 border-sev-medium/20';
      case 'low': return 'text-sev-low bg-sev-low/10 border-sev-low/20';
      case 'info': return 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  const handleGenerateFix = async () => {
    setIsGenerating(true);
    try {
      await generateFix(vuln.vulnId, vuln.scanId);
      setIsExpanded(true);
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  };

  return (
    <div className="glass-panel p-5 transition-all mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={cn("px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border", getSeverityColor(vuln.severity))}>
              {vuln.severity}
            </span>
            <span className="text-gray-400 text-xs font-mono bg-gray-800 px-2 py-0.5 rounded">
              {vuln.cweId}
            </span>
            {vuln.status === 'pr_open' && (
              <span className="flex items-center gap-1 text-brand-emerald text-xs font-semibold px-2 py-0.5 bg-brand-emerald/10 border border-brand-emerald/20 rounded-md">
                <GitPullRequest className="w-3 h-3" />
                PR Open
              </span>
            )}
          </div>
          <h4 className="text-lg font-semibold text-gray-200 mb-2">{vuln.vulnerabilityClass.replace('_', ' ').toUpperCase()}</h4>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">{vuln.description}</p>
          
          <div className="bg-[#0d1117] border border-gray-800 rounded-lg overflow-hidden mb-4">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-800 text-xs font-mono text-gray-400">
              <span>{vuln.filePath}:{vuln.startLine}-{vuln.endLine}</span>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300">
              <code>{vuln.codeSnippet}</code>
            </pre>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2 pt-4 border-t border-gray-800/50">
        {!vuln.proposedPatch ? (
          <button
            onClick={handleGenerateFix}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/20 border border-brand-cyan/20 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate AI Fix'}
          </button>
        ) : (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg text-sm font-semibold transition-colors"
          >
            {isExpanded ? 'Hide Patch' : 'View AI Patch'}
          </button>
        )}
        
        <button 
          onClick={() => onShowPrompt(vuln)}
          className="flex items-center gap-2 px-3.5 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <Copy className="w-4 h-4" />
          Prompt
        </button>

        {onOpenSandbox && (
          <button
            onClick={() => onOpenSandbox(vuln)}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            Sandbox Editor
          </button>
        )}

        <button 
          onClick={() => onShowGraph(vuln)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors ml-auto"
        >
          <Tag className="w-4 h-4" />
          View Data Flow Graph
        </button>
      </div>

      {isExpanded && vuln.proposedPatch && (
        <DiffViewer vuln={vuln} />
      )}
    </div>
  );
}
