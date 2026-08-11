import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, GitBranch, Github, Lock, Globe, ChevronRight, Play, Clock, ShieldCheck, XCircle, RotateCw } from 'lucide-react';
import { useScanEngine } from '../lib/scanEngine';
import { AnalysisProgressBar } from '../components/AnalysisProgressBar';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Scan } from '../types';

const MOCK_REPOS = [
  { id: 1, name: 'expressjs/express', isPrivate: false, language: 'JavaScript', defaultBranch: 'master', updatedAt: '2 hours ago' },
  { id: 2, name: 'facebook/react', isPrivate: false, language: 'TypeScript', defaultBranch: 'main', updatedAt: '5 hours ago' },
  { id: 3, name: 'pallets/flask', isPrivate: false, language: 'Python', defaultBranch: 'main', updatedAt: '2 days ago' },
  { id: 4, name: 'vercel/next.js', isPrivate: false, language: 'TypeScript', defaultBranch: 'canary', updatedAt: '1 week ago' },
  { id: 5, name: 'google/genai-js', isPrivate: false, language: 'TypeScript', defaultBranch: 'main', updatedAt: '1 month ago' },
];

function getScanStatusBadge(scan: any) {
  if (scan.status === 'failed') {
    return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-brand-rose/20 text-brand-rose border border-brand-rose/30">Failed</span>;
  }
  if (scan.status !== 'completed') {
    return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" /> Analyzing</span>;
  }
  
  const { critical, high, medium, low } = scan.findingsSummary || {};
  if (critical > 0) {
    return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-sev-critical/20 text-sev-critical border border-sev-critical/30">Critical</span>;
  }
  if (high > 0) {
    return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-sev-high/20 text-sev-high border border-sev-high/30">High Risk</span>;
  }
  if (medium > 0) {
    return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-sev-medium/20 text-sev-medium border border-sev-medium/30">Medium</span>;
  }
  if (low > 0) {
    return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-sev-low/20 text-sev-low border border-sev-low/30">Low Risk</span>;
  }
  
  return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secure</span>;
}

export default function NewScan() {
  const navigate = useNavigate();
  const { startScan, scans, refreshAllScans } = useScanEngine();
  const [search, setSearch] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<typeof MOCK_REPOS[0] | null>(null);
  const [branch, setBranch] = useState('main');
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');

  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshAllScans();
    setCountdown(30);
    setIsRefreshing(false);
  }, [refreshAllScans]);

  useEffect(() => {
    if (!isAutoRefresh) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleManualRefresh();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoRefresh, handleManualRefresh]);

  const filteredRepos = useMemo(() => {
    return MOCK_REPOS.filter(repo => repo.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const recentScans = useMemo(() => {
    let filtered = Object.values(scans) as Scan[];
    
    if (historySearch) {
      filtered = filtered.filter(scan => scan.repoFullName.toLowerCase().includes(historySearch.toLowerCase()));
    }
    
    if (historyFilter !== 'all') {
      filtered = filtered.filter(scan => {
        if (scan.status !== 'completed') return false;
        const { critical, high, medium, low } = scan.findingsSummary || { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
        if (historyFilter === 'critical') return critical > 0;
        if (historyFilter === 'high') return high > 0;
        if (historyFilter === 'medium') return medium > 0;
        if (historyFilter === 'low') return low > 0;
        if (historyFilter === 'secure') return critical === 0 && high === 0 && medium === 0 && low === 0;
        return true;
      });
    }

    return filtered
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);
  }, [scans, historySearch, historyFilter]);

  const handleStartScan = async () => {
    if (!selectedRepo) return;
    try {
      const scanId = await startScan(selectedRepo.name, branch);
      navigate(`/scans/${scanId}`);
    } catch (err) {
      console.error('Failed to start scan', err);
    }
  };

  const activeScan = (Object.values(scans) as Scan[]).find(s => ['cloning', 'parsing', 'analyzing', 'queued'].includes(s.status));

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {activeScan && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-brand-cyan uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping" /> Active Scan in Progress
            </span>
            <Link to={`/scans/${activeScan.scanId}`} className="text-xs text-brand-emerald hover:underline font-medium">
              Open Scan Dashboard →
            </Link>
          </div>
          <AnalysisProgressBar scan={activeScan} />
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Select Repository</h1>
        <p className="text-gray-400">Choose a repository to begin the automated AI security audit.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search repositories..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-emerald/50 focus:ring-1 focus:ring-brand-emerald/50 transition-all"
            />
          </div>

          <div className="glass-panel overflow-hidden">
            <ul className="divide-y divide-gray-800/50 max-h-[500px] overflow-y-auto">
              {filteredRepos.map(repo => (
                <li key={repo.id}>
                  <button 
                    onClick={() => { setSelectedRepo(repo); setBranch(repo.defaultBranch); }}
                    className={cn(
                      "w-full flex items-center justify-between p-4 hover:bg-gray-800/40 transition-colors text-left",
                      selectedRepo?.id === repo.id && "bg-gray-800/60 border-l-2 border-brand-emerald"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-800 rounded-lg">
                        <Github className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-200">{repo.name}</span>
                          {repo.isPrivate ? (
                            <Lock className="w-3 h-3 text-gray-500" />
                          ) : (
                            <Globe className="w-3 h-3 text-gray-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <span className={cn("w-2 h-2 rounded-full", repo.language === 'TypeScript' ? 'bg-blue-400' : repo.language === 'Python' ? 'bg-yellow-400' : repo.language === 'Go' ? 'bg-cyan-400' : 'bg-gray-400')} />
                            {repo.language}
                          </span>
                          <span>•</span>
                          <span>Updated {repo.updatedAt}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={cn("w-5 h-5 text-gray-600 transition-transform", selectedRepo?.id === repo.id && "text-brand-emerald translate-x-1")} />
                  </button>
                </li>
              ))}
              {filteredRepos.length === 0 && !search && (
                <div className="p-8 text-center text-gray-500">
                  No repositories found matching "{search}"
                </div>
              )}
              {search && !MOCK_REPOS.find(r => r.name.toLowerCase() === search.toLowerCase()) && (
                <li>
                  <button 
                    onClick={() => { 
                      setSelectedRepo({ id: 999, name: search, isPrivate: false, language: 'Unknown', defaultBranch: 'main', updatedAt: 'Just now' }); 
                      setBranch('main'); 
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-4 hover:bg-gray-800/40 transition-colors text-left",
                      selectedRepo?.name === search && "bg-gray-800/60 border-l-2 border-brand-emerald"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-800 rounded-lg">
                        <Github className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-200">Scan custom repository: {search}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Make sure the repo is public.
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={cn("w-5 h-5 text-gray-600 transition-transform", selectedRepo?.name === search && "text-brand-emerald translate-x-1")} />
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-white mb-6">Audit Configuration</h2>
            
            {selectedRepo ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Target Branch</label>
                  <div className="relative">
                    <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select 
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-9 pr-4 text-gray-200 appearance-none focus:outline-none focus:border-brand-emerald/50"
                    >
                      <option value="main">main</option>
                      <option value="master">master</option>
                      <option value="develop">develop</option>
                      <option value="staging">staging</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Analysis Engine</span>
                    <span className="text-brand-cyan font-mono text-xs">Gemini 2.5 Flash</span>
                  </div>
                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-gray-400">Ruleset</span>
                    <span className="text-gray-300">OWASP Top 10 + Secrets</span>
                  </div>
                  <button 
                    onClick={handleStartScan}
                    className="w-full flex items-center justify-center gap-2 bg-brand-emerald text-gray-900 font-semibold py-3 px-4 rounded-xl hover:bg-emerald-400 transition-all glow-cyan"
                  >
                    <Play className="w-4 h-4" />
                    Start AI Security Audit
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                Select a repository from the list to configure your audit.
              </div>
            )}
          </div>

          {Object.keys(scans).length > 0 && (
            <div className="glass-panel p-6 flex flex-col h-[500px]">
              <div className="flex items-center justify-between mb-4 shrink-0 gap-2 flex-wrap">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-emerald" />
                  Recent Audits
                </h2>

                <div className="flex items-center gap-2">
                  {/* Auto-refresh Toggle Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAutoRefresh(!isAutoRefresh);
                      if (!isAutoRefresh) setCountdown(30);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer",
                      isAutoRefresh
                        ? "bg-brand-emerald/15 text-brand-emerald border-brand-emerald/40 hover:bg-brand-emerald/25"
                        : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-gray-300"
                    )}
                    title={isAutoRefresh ? "Auto-refresh is ON (polls every 30 seconds)" : "Click to enable 30s auto-refresh"}
                  >
                    <span className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      isAutoRefresh ? "bg-brand-emerald animate-pulse" : "bg-gray-500"
                    )} />
                    <span>Auto-refresh: {isAutoRefresh ? 'ON' : 'OFF'}</span>
                    {isAutoRefresh && (
                      <span className="font-mono text-[10px] px-1 py-0.2 bg-brand-emerald/20 rounded text-brand-emerald font-bold shrink-0">
                        {countdown}s
                      </span>
                    )}
                  </button>

                  {/* Manual Refresh Button */}
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="p-1.5 text-gray-400 hover:text-white bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    title="Refresh now"
                  >
                    <RotateCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-brand-cyan")} />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 mb-4 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search history..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2 pl-9 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-emerald/50"
                  />
                </div>
                <select
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 appearance-none focus:outline-none focus:border-brand-emerald/50"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High Risk</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low Risk</option>
                  <option value="secure">Secure</option>
                </select>
              </div>

              <div className="overflow-y-auto flex-1 min-h-0 pr-1">
                {recentScans.length > 0 ? (
                  <ul className="space-y-3">
                    {recentScans.map(scan => (
                      <li key={scan.scanId}>
                        <Link to={`/scans/${scan.scanId}`} className="block p-3 bg-gray-800/40 hover:bg-gray-800/80 rounded-lg border border-gray-700/50 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-gray-200 truncate pr-2">{scan.repoFullName}</span>
                            {getScanStatusBadge(scan)}
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <GitBranch className="w-3 h-3" />
                              {scan.ref}
                            </span>
                            <span>{formatDistanceToNow(scan.createdAt, { addSuffix: true })}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    No matching audits found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
