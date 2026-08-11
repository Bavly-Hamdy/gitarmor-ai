import { useState } from 'react';
import { X, Copy, Check, Bell, Terminal, Send, ShieldCheck, Slack, MessageSquare, Mail, RefreshCw } from 'lucide-react';
import { NotificationChannel, Severity } from '../types';
import { cn } from '../lib/utils';

interface CiCdWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoFullName: string;
}

export function CiCdWebhookModal({ isOpen, onClose, repoFullName }: CiCdWebhookModalProps) {
  const [activeTab, setActiveTab] = useState<'cicd' | 'webhooks'>('cicd');
  const [copiedYaml, setCopiedYaml] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const [channels, setChannels] = useState<NotificationChannel[]>([
    { id: 'ch-1', type: 'slack', name: '#sec-alerts-prod', webhookUrl: 'https://hooks.slack.com/services/T00/B00/XXXX', enabled: true, minSeverity: 'high' },
    { id: 'ch-2', type: 'discord', name: 'DevSecOps Channel', webhookUrl: 'https://discord.com/api/webhooks/123/xyz', enabled: true, minSeverity: 'critical' },
    { id: 'ch-3', type: 'email', name: 'Security On-Call', webhookUrl: 'ciso-alerts@company.com', enabled: false, minSeverity: 'critical' }
  ]);

  if (!isOpen) return null;

  const githubWorkflowYaml = `name: GitArmor AI Security Gate

on:
  push:
    branches: [ main, master, develop ]
  pull_request:
    branches: [ main, master ]

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Codebase
        uses: actions/checkout@v4

      - name: Run GitArmor Security Audit
        uses: gitarmor/scan-action@v2
        with:
          repository: '${repoFullName}'
          api_key: \${{ secrets.GITARMOR_API_KEY }}
          fail_on_severity: 'high'
          block_pr: true

      - name: Upload Security SARIF Findings
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: 'gitarmor-results.sarif'
`;

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(githubWorkflowYaml);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2000);
  };

  const handleTestWebhook = async (channel: NotificationChannel) => {
    setIsSendingTest(true);
    setTestStatus(null);
    try {
      const res = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelType: channel.type,
          webhookUrl: channel.webhookUrl,
          minSeverity: channel.minSeverity
        })
      });
      const data = await res.json();
      setTestStatus(data.message || `Test alert sent to ${channel.name}!`);
    } catch (e) {
      setTestStatus('Failed to send test alert');
    } finally {
      setIsSendingTest(false);
    }
  };

  const toggleChannel = (id: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-cyan/15 rounded-xl border border-brand-cyan/30 text-brand-cyan">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">CI/CD & Real-Time Alert Integrations</h3>
              <p className="text-xs text-gray-400">Automate security gates & real-time webhook notifications</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-800 bg-gray-950/40 px-4">
          <button
            onClick={() => setActiveTab('cicd')}
            className={cn(
              "px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
              activeTab === 'cicd' ? "border-brand-cyan text-brand-cyan" : "border-transparent text-gray-400 hover:text-gray-200"
            )}
          >
            <ShieldCheck className="w-4 h-4" />
            GitHub Actions CI/CD Gate
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={cn(
              "px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
              activeTab === 'webhooks' ? "border-brand-cyan text-brand-cyan" : "border-transparent text-gray-400 hover:text-gray-200"
            )}
          >
            <Bell className="w-4 h-4" />
            Real-Time Webhooks (Slack/Discord/Teams)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'cicd' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">GitHub Actions Workflow Setup</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Save this YAML configuration to <code className="text-brand-cyan font-mono text-[11px]">.github/workflows/gitarmor-scan.yml</code> in your repository.</p>
                </div>
                <button
                  onClick={handleCopyYaml}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  {copiedYaml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedYaml ? 'Copied YAML' : 'Copy Workflow'}</span>
                </button>
              </div>

              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
                <pre>{githubWorkflowYaml}</pre>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {testStatus && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
                  <span>{testStatus}</span>
                  <button onClick={() => setTestStatus(null)} className="text-gray-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}

              <div className="space-y-3">
                {channels.map((ch) => (
                  <div key={ch.id} className="p-4 bg-gray-950 rounded-xl border border-gray-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gray-900 rounded-xl border border-gray-800 text-brand-cyan">
                        {ch.type === 'slack' && <Slack className="w-5 h-5 text-purple-400" />}
                        {ch.type === 'discord' && <MessageSquare className="w-5 h-5 text-indigo-400" />}
                        {ch.type === 'email' && <Mail className="w-5 h-5 text-amber-400" />}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white flex items-center gap-2">
                          {ch.name}
                          <span className="text-[10px] uppercase font-mono px-2 py-0.2 bg-gray-800 text-gray-400 rounded">
                            Min: {ch.minSeverity}
                          </span>
                        </h5>
                        <p className="text-[11px] text-gray-400 font-mono truncate max-w-xs">{ch.webhookUrl}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleTestWebhook(ch)}
                        disabled={isSendingTest}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-lg border border-gray-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isSendingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-brand-cyan" />}
                        <span>Test Alert</span>
                      </button>

                      <button
                        onClick={() => toggleChannel(ch.id)}
                        className={cn(
                          "w-10 h-6 rounded-full transition-colors relative cursor-pointer",
                          ch.enabled ? "bg-brand-emerald" : "bg-gray-800"
                        )}
                      >
                        <span className={cn(
                          "w-4 h-4 rounded-full bg-white absolute top-1 transition-all",
                          ch.enabled ? "right-1" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
