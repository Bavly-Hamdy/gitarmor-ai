/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ScanProvider, useScanEngine } from './lib/scanEngine';
import { SettingsProvider, useSettings } from './lib/SettingsContext';
import { ShieldCheck, Github, Settings, X, Moon, Sun, Play, Loader2, Building2 } from 'lucide-react';
import Hero from './pages/Hero';
import NewScan from './pages/NewScan';
import ScanDashboard from './pages/ScanDashboard';
import { SaaSWorkspaceModal } from './components/SaaSWorkspaceModal';
import { Workspace } from './types';
import { useState } from 'react';

function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { theme, setTheme, severityColors, setSeverityColors } = useSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-primary)] border border-gray-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Dashboard Settings
          </h2>
          <button onClick={onClose} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Theme Toggle */}
          <div>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Appearance</h3>
            <div className="flex items-center gap-2 p-1 bg-[var(--bg-surface)] rounded-lg border border-gray-700/50">
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'}`}
              >
                <Moon className="w-4 h-4" /> Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${theme === 'light' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'}`}
              >
                <Sun className="w-4 h-4" /> Light
              </button>
            </div>
          </div>

          {/* Color Customization */}
          <div>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Severity Highlight Colors</h3>
            <div className="space-y-3">
              {(Object.keys(severityColors) as Array<keyof typeof severityColors>).map((level) => (
                <div key={level} className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-lg border border-gray-700/50">
                  <span className="text-sm font-medium text-[var(--text-primary)] capitalize">{level}</span>
                  <input
                    type="color"
                    value={severityColors[level]}
                    onChange={(e) => setSeverityColors({ ...severityColors, [level]: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>({
    id: 'ws-1',
    name: 'Acme Corp Security',
    slug: 'acme-security',
    plan: 'enterprise',
    role: 'admin',
    membersCount: 12,
    reposCount: 48
  });

  const navigate = useNavigate();
  const { startScan, pollScan } = useScanEngine();

  const handleNavDemo = async () => {
    try {
      setIsDemoLoading(true);
      const scanId = await startScan('expressjs/express', 'master');
      pollScan(scanId);
      navigate(`/scans/${scanId}`);
    } catch (e) {
      console.error('Demo launch error:', e);
      navigate('/scans/new');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <>
      <nav className="border-b border-gray-800 bg-brand-bg/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-brand-emerald/10 rounded-lg group-hover:bg-brand-emerald/20 transition-colors">
                <ShieldCheck className="w-6 h-6 text-brand-emerald" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                GitArmor <span className="text-brand-emerald">AI</span>
              </span>
            </Link>

            {/* Workspace Selector */}
            <button
              onClick={() => setIsWorkspaceOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-xs text-gray-200 transition-all cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-brand-cyan" />
              <span className="font-semibold">{currentWorkspace.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-brand-cyan/20 text-brand-cyan rounded uppercase">
                {currentWorkspace.plan}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleNavDemo}
              disabled={isDemoLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 text-xs font-semibold transition-all cursor-pointer disabled:opacity-60"
            >
              {isDemoLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-brand-cyan/30" />
              )}
              <span>Live Demo</span>
            </button>
            <Link to="/scans/new" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              New Audit
            </Link>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden">
              <Github className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </nav>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <SaaSWorkspaceModal
        isOpen={isWorkspaceOpen}
        onClose={() => setIsWorkspaceOpen(false)}
        currentWorkspace={currentWorkspace}
        onSelectWorkspace={(ws) => {
          setCurrentWorkspace(ws);
          setIsWorkspaceOpen(false);
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <ScanProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-brand-bg text-[var(--text-primary)] font-sans transition-colors duration-200">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Hero />} />
                <Route path="/scans/new" element={<NewScan />} />
                <Route path="/scans/:scanId" element={<ScanDashboard />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </ScanProvider>
    </SettingsProvider>
  );
}
