import { Editor } from '@monaco-editor/react';
import { ShieldCheck, GitMerge } from 'lucide-react';
import { useState } from 'react';
import { useScanEngine } from '../lib/scanEngine';
import { Vulnerability } from '../types';

interface DiffViewerProps {
  vuln: Vulnerability;
}

export function DiffViewer({ vuln }: DiffViewerProps) {
  const { createPullRequest } = useScanEngine();
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await createPullRequest(vuln.vulnId, vuln.scanId);
    } catch (e) {
      console.error(e);
    }
    setIsApplying(false);
  };

  if (!vuln.proposedPatch) return null;

  return (
    <div className="mt-4 border border-gray-700/50 rounded-lg overflow-hidden bg-gray-900/50">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/80 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-emerald" />
          <span className="text-sm font-medium text-gray-300">AI Proposed Patch</span>
        </div>
        <button
          onClick={handleApply}
          disabled={isApplying || vuln.status === 'pr_open'}
          className="flex items-center gap-2 px-3 py-1.5 bg-brand-emerald/10 text-brand-emerald hover:bg-brand-emerald/20 border border-brand-emerald/20 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GitMerge className="w-3.5 h-3.5" />
          {vuln.status === 'pr_open' ? 'PR Open' : isApplying ? 'Creating PR...' : '1-Click Apply via PR'}
        </button>
      </div>
      <div className="h-[250px] relative">
        <Editor
          height="100%"
          language="diff"
          theme="vs-dark"
          value={vuln.proposedPatch}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
            renderLineHighlight: "none",
            hideCursorInOverviewRuler: true
          }}
        />
      </div>
    </div>
  );
}
