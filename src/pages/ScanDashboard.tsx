import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScanEngine } from '../lib/scanEngine';
import { useSettings } from '../lib/SettingsContext';
import { ScoreGauge } from '../components/ScoreGauge';
import { VulnCard } from '../components/VulnCard';
import { AnalysisProgressBar } from '../components/AnalysisProgressBar';
import { CoPilotDrawer } from '../components/CoPilotDrawer';
import { SandboxModal } from '../components/SandboxModal';
import { ComplianceGrid } from '../components/ComplianceGrid';
import { CiCdWebhookModal } from '../components/CiCdWebhookModal';
import { SecurityAnalytics } from '../components/SecurityAnalytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GitCommit, Clock, Search, X, Copy, Check, GitBranch, Download, TrendingUp, FileJson, Sparkles, Terminal, ShieldCheck, Award, BarChart3, TerminalSquare } from 'lucide-react';
import { Vulnerability, Scan } from '../types';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function PromptModal({ vuln, onClose }: { vuln: Vulnerability; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const prompt = `Act as a senior DevSecOps engineer. I have identified a ${vuln.severity} severity vulnerability (${vuln.cweId}) of type ${vuln.vulnerabilityClass} in my codebase.

**File:** ${vuln.filePath}
**Lines:** ${vuln.startLine}-${vuln.endLine}
**Description:** ${vuln.description}

**Vulnerable Code Snippet:**
\`\`\`
${vuln.codeSnippet}
\`\`\`

Please provide a surgical, minimal unified diff to remediate this issue. Do not rewrite the entire file or change unrelated logic. Output only the diff.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold text-white">Surgical AI Remediation Prompt</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto">
          <p className="text-gray-400 mb-4 text-sm">Copy this optimized prompt to use with Claude, ChatGPT, or Gemini locally.</p>
          <div className="relative bg-[#0d1117] rounded-xl border border-gray-800 overflow-hidden">
            <pre className="p-6 text-sm text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
              {prompt}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-brand-emerald" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GraphModal({ vuln, onClose }: { vuln: Vulnerability; onClose: () => void }) {
  const defaultNodeStyle = { backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', borderColor: 'var(--text-secondary)', borderRadius: '0.5rem', padding: '0.75rem', width: 200, textAlign: 'center' as const };
  const alertNodeStyle = { backgroundColor: 'var(--bg-primary)', color: 'var(--color-sev-critical)', borderColor: 'var(--color-sev-critical)', borderWidth: 2, borderRadius: '0.5rem', padding: '0.75rem', width: 200, textAlign: 'center' as const, fontWeight: 'bold' };
  
  const nodes = [
    { id: '1', position: { x: 250, y: 50 }, data: { label: 'Route: POST /api/login' }, style: defaultNodeStyle },
    { id: '2', position: { x: 100, y: 150 }, data: { label: 'Auth Middleware' }, style: defaultNodeStyle },
    { id: '3', position: { x: 400, y: 150 }, data: { label: 'Input Validator' }, style: defaultNodeStyle },
    { id: '4', position: { x: 250, y: 250 }, data: { label: vuln.filePath }, style: alertNodeStyle },
    { id: '5', position: { x: 250, y: 350 }, data: { label: 'Database Service' }, style: defaultNodeStyle },
  ];
  const edges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'var(--text-secondary)' } },
    { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: 'var(--text-secondary)' } },
    { id: 'e1-4', source: '1', target: '4', animated: true, style: { stroke: 'var(--color-sev-critical)', strokeWidth: 2 } },
    { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: 'var(--color-sev-critical)', strokeWidth: 2 } },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-primary)] border border-gray-700/50 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col h-[80vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Vulnerability Blast Radius</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Data flow graph for {vuln.filePath}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800/50 rounded-lg text-gray-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 bg-[var(--bg-surface)] rounded-b-2xl overflow-hidden relative">
           <ReactFlow nodes={nodes} edges={edges} fitView>
             <Background color="var(--text-secondary)" gap={16} />
             <Controls />
           </ReactFlow>
        </div>
      </div>
    </div>
  );
}

function getScanStatusBadge(scan: any) {
  if (scan.status === 'failed') {
    return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-brand-rose/20 text-brand-rose border border-brand-rose/30">Failed</span>;
  }
  if (scan.status !== 'completed') {
    return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" /> Analyzing</span>;
  }
  
  const { critical, high, medium, low } = scan.findingsSummary || {};
  if (critical > 0) {
    return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-sev-critical/20 text-sev-critical border border-sev-critical/30">Critical</span>;
  }
  if (high > 0) {
    return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-sev-high/20 text-sev-high border border-sev-high/30">High Risk</span>;
  }
  if (medium > 0) {
    return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-sev-medium/20 text-sev-medium border border-sev-medium/30">Medium Risk</span>;
  }
  if (low > 0) {
    return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-sev-low/20 text-sev-low border border-sev-low/30">Low Risk</span>;
  }
  
  return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Secure</span>;
}

export default function ScanDashboard() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const { scans, vulnerabilities, pollScan, generateFix } = useScanEngine();
  const { severityColors } = useSettings();
  
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [search, setSearch] = useState('');
  
  const [activeTab, setActiveTab] = useState<'findings' | 'compliance' | 'analytics'>('findings');
  const [isCoPilotOpen, setIsCoPilotOpen] = useState(false);
  const [isCiCdModalOpen, setIsCiCdModalOpen] = useState(false);
  const [sandboxVuln, setSandboxVuln] = useState<Vulnerability | null>(null);

  const [activePromptVuln, setActivePromptVuln] = useState<Vulnerability | null>(null);
  const [activeGraphVuln, setActiveGraphVuln] = useState<Vulnerability | null>(null);

  const scan = scanId ? scans[scanId] : null;
  const vulns = scanId ? (vulnerabilities[scanId] || []) : [];

  useEffect(() => {
    if (!scanId) return;
    
    // Initial fetch
    pollScan(scanId);

    // Setup polling interval
    const interval = setInterval(() => {
      if (!scans[scanId] || (scans[scanId].status !== 'completed' && scans[scanId].status !== 'failed')) {
        pollScan(scanId);
      } else {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [scanId, pollScan, scans]);

  const filteredVulns = useMemo(() => {
    return vulns.filter(v => {
      const matchSeverity = filterSeverity === 'all' || v.severity === filterSeverity;
      const matchSearch = v.description.toLowerCase().includes(search.toLowerCase()) || 
                          v.filePath.toLowerCase().includes(search.toLowerCase()) ||
                          v.vulnerabilityClass.toLowerCase().includes(search.toLowerCase());
      return matchSeverity && matchSearch;
    });
  }, [vulns, filterSeverity, search]);

  const chartData = useMemo(() => {
    if (!scan) return [];
    return (Object.values(scans) as Scan[])
      .filter(s => s.repoFullName === scan.repoFullName && s.status === 'completed')
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((s, index) => ({
        name: `Scan ${index + 1}`,
        date: new Date(s.createdAt).toLocaleDateString(),
        critical: s.findingsSummary.critical,
        high: s.findingsSummary.high,
        medium: s.findingsSummary.medium,
        low: s.findingsSummary.low,
      }));
  }, [scans, scan]);

  const handleExportMarkdown = () => {
    if (!scan || vulns.length === 0) return;

    let md = `# Vulnerability Scan Report\n\n`;
    md += `**Repository:** ${scan.repoFullName}\n`;
    md += `**Branch:** ${scan.ref}\n`;
    md += `**Date:** ${new Date(scan.createdAt).toLocaleString()}\n`;
    md += `**Security Score:** ${scan.securityScore}/100\n\n`;

    md += `## Summary\n\n`;
    md += `- **Critical:** ${scan.findingsSummary.critical}\n`;
    md += `- **High:** ${scan.findingsSummary.high}\n`;
    md += `- **Medium:** ${scan.findingsSummary.medium}\n`;
    md += `- **Low:** ${scan.findingsSummary.low}\n`;
    md += `- **Info:** ${scan.findingsSummary.info}\n\n`;

    md += `## Findings\n\n`;

    vulns.forEach((vuln, i) => {
      md += `### ${i + 1}. ${vuln.vulnerabilityClass} (${vuln.severity.toUpperCase()})\n\n`;
      md += `**CWE:** ${vuln.cweId}\n\n`;
      md += `**Location:** \`${vuln.filePath}\` (Lines ${vuln.startLine}-${vuln.endLine})\n\n`;
      md += `**Description:**\n${vuln.description}\n\n`;
      md += `**Vulnerable Code Snippet:**\n\`\`\`\n${vuln.codeSnippet}\n\`\`\`\n\n`;
      
      if (vuln.suggestedFix) {
        md += `**Suggested Fix:**\n\`\`\`diff\n${vuln.suggestedFix}\n\`\`\`\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-report-${scan.repoFullName.replace('/', '-')}-${scan.scanId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    if (!scan) return;

    const exportData = {
      scanId: scan.scanId,
      repository: scan.repoFullName,
      branch: scan.ref,
      status: scan.status,
      createdAt: new Date(scan.createdAt).toISOString(),
      securityScore: scan.securityScore,
      findingsSummary: scan.findingsSummary,
      vulnerabilities: vulns,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vulnerabilities-${scan.repoFullName.replace('/', '-')}-${scan.scanId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!scan) return <div className="p-12 text-center text-gray-500">Loading scan data...</div>;

  const progressPercent = Math.round((scan.progress.chunksProcessed / scan.progress.chunksTotal) * 100) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="glass-panel p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">{scan.repoFullName}</h1>
            <span className="px-2 py-1 bg-gray-800 rounded-md text-xs font-mono text-gray-300 flex items-center gap-1">
              <GitBranch className="w-3 h-3" /> {scan.ref}
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Started {formatDistanceToNow(scan.createdAt, { addSuffix: true })}</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1"><GitCommit className="w-4 h-4" /> Status:</span>
              {getScanStatusBadge(scan)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <button 
            onClick={() => setIsCoPilotOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-brand-cyan/20 to-brand-emerald/20 hover:from-brand-cyan/30 hover:to-brand-emerald/30 text-white border border-brand-cyan/40 rounded-xl text-sm font-semibold transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-brand-cyan animate-pulse" />
            <span>AI Co-Pilot</span>
          </button>

          <button 
            onClick={() => setIsCiCdModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            <Terminal className="w-4 h-4 text-brand-emerald" />
            <span>CI/CD & Webhooks</span>
          </button>

          {scan.status === 'completed' && (
             <div className="flex items-center gap-2">
               <button 
                 onClick={handleExportJson} 
                 className="flex items-center gap-2 px-3 py-2 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 hover:border-brand-cyan/50 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
               >
                 <FileJson className="w-3.5 h-3.5" />
                 <span>Export JSON</span>
               </button>
               <button 
                 onClick={handleExportMarkdown} 
                 className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-xl text-xs font-medium transition-all border border-gray-700 cursor-pointer"
               >
                 <Download className="w-3.5 h-3.5 text-gray-400" />
                 <span>Markdown</span>
               </button>
             </div>
          )}
          
          <ScoreGauge score={scan.securityScore} status={scan.status} />
        </div>
      </div>

      {/* Primary View Navigation Tabs */}
      <div className="flex border-b border-gray-800 mb-8 space-x-2">
        <button
          onClick={() => setActiveTab('findings')}
          className={cn(
            "px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
            activeTab === 'findings' ? "border-brand-cyan text-brand-cyan bg-brand-cyan/5 rounded-t-xl" : "border-transparent text-gray-400 hover:text-gray-200"
          )}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Findings & Code Diffs</span>
          <span className="text-xs font-mono px-2 py-0.5 bg-gray-800 text-gray-300 rounded-full font-bold">
            {vulns.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={cn(
            "px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
            activeTab === 'compliance' ? "border-brand-cyan text-brand-cyan bg-brand-cyan/5 rounded-t-xl" : "border-transparent text-gray-400 hover:text-gray-200"
          )}
        >
          <Award className="w-4 h-4 text-brand-emerald" />
          <span>OWASP & SOC2 Compliance</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={cn(
            "px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
            activeTab === 'analytics' ? "border-brand-cyan text-brand-cyan bg-brand-cyan/5 rounded-t-xl" : "border-transparent text-gray-400 hover:text-gray-200"
          )}
        >
          <BarChart3 className="w-4 h-4 text-purple-400" />
          <span>Security Trends & MTTR</span>
        </button>
      </div>

      {/* Real-time Analysis Progress Bar Component */}
      <AnalysisProgressBar scan={scan} className="mb-8" />

      {/* Tab 1: Findings & Diffs */}
      {activeTab === 'findings' && (
        <div className="space-y-8">
          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Critical', count: scan.findingsSummary.critical, color: 'text-sev-critical bg-sev-critical/10 border-sev-critical/20' },
              { label: 'High', count: scan.findingsSummary.high, color: 'text-sev-high bg-sev-high/10 border-sev-high/20' },
              { label: 'Medium', count: scan.findingsSummary.medium, color: 'text-sev-medium bg-sev-medium/10 border-sev-medium/20' },
              { label: 'Low', count: scan.findingsSummary.low, color: 'text-sev-low bg-sev-low/10 border-sev-low/20' },
              { label: 'Info', count: scan.findingsSummary.info, color: 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20' },
            ].map(metric => (
              <div key={metric.label} className="glass-panel p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800/50 transition-colors" onClick={() => setFilterSeverity(metric.label.toLowerCase())}>
                <span className="text-gray-400 text-sm font-medium mb-1">{metric.label}</span>
                <span className={cn("text-3xl font-bold px-3 py-1 rounded-lg border", metric.color)}>
                  {metric.count}
                </span>
              </div>
            ))}
          </div>

          {/* Historical Trend Chart */}
          {chartData.length > 1 && (
            <div className="glass-panel p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-brand-emerald" />
                <h2 className="text-lg font-bold text-white">Historical Vulnerability Trend</h2>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: '#374151', borderRadius: '0.5rem', color: 'var(--text-primary)' }}
                      itemStyle={{ fontSize: '0.875rem' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '0.875rem' }} />
                    <Line type="monotone" dataKey="critical" name="Critical" stroke={severityColors.critical} strokeWidth={2} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="high" name="High" stroke={severityColors.high} strokeWidth={2} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="medium" name="Medium" stroke={severityColors.medium} strokeWidth={2} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="low" name="Low" stroke={severityColors.low} strokeWidth={2} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <div className="glass-panel p-5 sticky top-24">
                <h3 className="font-semibold text-white mb-4">Filters</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Search Findings</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input 
                        type="text" 
                        placeholder="Search CWE, path..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-200 focus:outline-none focus:border-brand-emerald/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Severity</label>
                    <select 
                      value={filterSeverity}
                      onChange={(e) => setFilterSeverity(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-sm text-gray-200 focus:outline-none focus:border-brand-emerald/50 appearance-none"
                    >
                      <option value="all">All Severities</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-3/4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Vulnerability Feed</h2>
                <span className="text-sm text-gray-400">Showing {filteredVulns.length} findings</span>
              </div>

              <div className="space-y-4">
                {filteredVulns.length > 0 ? (
                  filteredVulns.map(vuln => (
                    <VulnCard 
                      key={vuln.vulnId} 
                      vuln={vuln} 
                      onShowPrompt={setActivePromptVuln} 
                      onShowGraph={setActiveGraphVuln} 
                      onOpenSandbox={(v) => setSandboxVuln(v)}
                    />
                  ))
                ) : (
                  <div className="glass-panel p-12 text-center text-gray-500 flex flex-col items-center gap-4">
                    {scan.status === 'failed' ? (
                      <>
                        <div className="text-brand-rose font-semibold">The scan failed to complete.</div>
                        <div className="text-sm bg-gray-800/50 p-4 rounded-lg border border-gray-700 max-w-xl text-left break-words text-gray-400">
                          {scan.failureReason || 'Please check if the repository exists and the branch is correct.'}
                        </div>
                      </>
                    ) : scan.status === 'completed' && vulns.length === 0 ? (
                      <span>Great job! No vulnerabilities found.</span>
                    ) : scan.status !== 'completed' ? (
                      <span>AI is analyzing code. Findings will appear here in real-time...</span>
                    ) : (
                      <span>No findings match your current filters.</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Compliance Grid */}
      {activeTab === 'compliance' && (
        <ComplianceGrid scan={scan} vulnerabilities={vulns} />
      )}

      {/* Tab 3: Security Analytics & MTTR */}
      {activeTab === 'analytics' && (
        <SecurityAnalytics scans={scans} />
      )}

      {/* Modals & Drawers */}
      <CoPilotDrawer
        isOpen={isCoPilotOpen}
        onClose={() => setIsCoPilotOpen(false)}
        scanId={scan.scanId}
        repoFullName={scan.repoFullName}
      />

      <SandboxModal
        isOpen={!!sandboxVuln}
        onClose={() => setSandboxVuln(null)}
        vuln={sandboxVuln}
        onApplyPatch={async (patch) => {
          if (sandboxVuln) {
            await generateFix(sandboxVuln.vulnId, sandboxVuln.scanId);
          }
        }}
      />

      <CiCdWebhookModal
        isOpen={isCiCdModalOpen}
        onClose={() => setIsCiCdModalOpen(false)}
        repoFullName={scan.repoFullName}
      />

      {activePromptVuln && <PromptModal vuln={activePromptVuln} onClose={() => setActivePromptVuln(null)} />}
      {activeGraphVuln && <GraphModal vuln={activeGraphVuln} onClose={() => setActiveGraphVuln(null)} />}
    </div>
  );
}
