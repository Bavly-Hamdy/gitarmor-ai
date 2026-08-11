import React, { useState } from 'react';
import { X, Users, Shield, Check, Sparkles, Building2, UserPlus, CreditCard, Star } from 'lucide-react';
import { Workspace, TeamMember } from '../types';
import { cn } from '../lib/utils';

interface SaaSWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWorkspace: Workspace;
  onSelectWorkspace: (ws: Workspace) => void;
}

export function SaaSWorkspaceModal({ isOpen, onClose, currentWorkspace, onSelectWorkspace }: SaaSWorkspaceModalProps) {
  const [activeTab, setActiveTab] = useState<'workspaces' | 'members' | 'billing'>('workspaces');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('developer');
  const [invitedSuccess, setInvitedSuccess] = useState(false);

  const [workspaces] = useState<Workspace[]>([
    { id: 'ws-1', name: 'Acme Corp Security', slug: 'acme-security', plan: 'enterprise', role: 'admin', membersCount: 12, reposCount: 48 },
    { id: 'ws-2', name: 'FinTech Core DevSecOps', slug: 'fintech-core', plan: 'pro', role: 'security_lead', membersCount: 5, reposCount: 14 },
    { id: 'ws-3', name: 'Personal Lab', slug: 'personal-lab', plan: 'free', role: 'admin', membersCount: 1, reposCount: 3 },
  ]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 'tm-1', name: 'Hamdy Shaker', email: 'hamdy@acme.com', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', role: 'admin', status: 'active' },
    { id: 'tm-2', name: 'Alex Rivera', email: 'alex@acme.com', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', role: 'security_lead', status: 'active' },
    { id: 'tm-3', name: 'Sara Chen', email: 'sara@acme.com', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', role: 'developer', status: 'active' },
  ]);

  if (!isOpen) return null;

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      role: inviteRole,
      status: 'invited'
    };

    setTeamMembers(prev => [...prev, newMember]);
    setInviteEmail('');
    setInvitedSuccess(true);
    setTimeout(() => setInvitedSuccess(false), 2500);
  };

  const plans = [
    {
      name: 'Developer Free',
      price: '$0',
      period: 'forever',
      features: ['Up to 3 Public Repositories', 'Standard Vulnerability Scanning', 'Basic Markdown Reports', 'Community Support'],
      current: currentWorkspace.plan === 'free',
      buttonText: 'Current Plan'
    },
    {
      name: 'Pro DevSecOps',
      price: '$49',
      period: 'per workspace / month',
      popular: true,
      features: ['Unlimited Private Repos', 'Gemini 2.5 AI Auto-Fix PRs', 'Live In-Browser Code Sandbox', 'Real-Time Slack/Discord Webhooks', '10 Team Seats'],
      current: currentWorkspace.plan === 'pro',
      buttonText: 'Upgrade to Pro'
    },
    {
      name: 'Enterprise SaaS',
      price: '$199',
      period: 'per workspace / month',
      features: ['Dedicated AI Security Model Cluster', 'OWASP & SOC2 Compliance Export', 'CycloneDX SBOM Exporter', 'GitHub Action CI/CD Gate', '24/7 Dedicated CISO Support'],
      current: currentWorkspace.plan === 'enterprise',
      buttonText: 'Switch to Enterprise'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-cyan/15 rounded-xl border border-brand-cyan/30 text-brand-cyan">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {currentWorkspace.name}
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 rounded-full font-bold">
                  {currentWorkspace.plan}
                </span>
              </h3>
              <p className="text-xs text-gray-400">Multi-Tenant SaaS Workspace & RBAC Team Management</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-800 bg-gray-950/40 px-4">
          <button
            onClick={() => setActiveTab('workspaces')}
            className={cn(
              "px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
              activeTab === 'workspaces' ? "border-brand-cyan text-brand-cyan" : "border-transparent text-gray-400 hover:text-gray-200"
            )}
          >
            <Building2 className="w-4 h-4" />
            Switch Workspace
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={cn(
              "px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
              activeTab === 'members' ? "border-brand-cyan text-brand-cyan" : "border-transparent text-gray-400 hover:text-gray-200"
            )}
          >
            <Users className="w-4 h-4" />
            Team & RBAC Roles ({teamMembers.length})
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={cn(
              "px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
              activeTab === 'billing' ? "border-brand-cyan text-brand-cyan" : "border-transparent text-gray-400 hover:text-gray-200"
            )}
          >
            <CreditCard className="w-4 h-4" />
            SaaS Subscription Plans
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'workspaces' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workspaces.map((ws) => {
                const isSelected = ws.id === currentWorkspace.id;
                return (
                  <div
                    key={ws.id}
                    onClick={() => onSelectWorkspace(ws)}
                    className={cn(
                      "p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4",
                      isSelected
                        ? "bg-brand-cyan/10 border-brand-cyan shadow-lg shadow-brand-cyan/5"
                        : "bg-gray-950/60 border-gray-800 hover:border-gray-700"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-gray-800 text-gray-300 rounded font-bold">
                          {ws.plan}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-brand-cyan" />}
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">{ws.name}</h4>
                      <p className="text-xs text-gray-400 font-mono">@{ws.slug}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-800">
                      <span>{ws.membersCount} Members</span>
                      <span>{ws.reposCount} Repos</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-6">
              {/* Invite Form */}
              <form onSubmit={handleInvite} className="p-4 bg-gray-950 rounded-xl border border-gray-800 flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Colleague's email address..."
                  className="flex-1 bg-gray-900 border border-gray-800 focus:border-brand-cyan text-white text-xs rounded-xl px-3.5 py-2.5 outline-none w-full"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="bg-gray-900 border border-gray-800 text-white text-xs rounded-xl px-3 py-2.5 outline-none font-mono"
                >
                  <option value="developer">Developer</option>
                  <option value="security_lead">Security Lead</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-cyan hover:bg-cyan-400 text-gray-950 font-semibold rounded-xl text-xs transition-all shrink-0 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Invite Teammate</span>
                </button>
              </form>

              {invitedSuccess && (
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Invitation email sent successfully!
                </p>
              )}

              {/* Members List */}
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="p-3 bg-gray-950 rounded-xl border border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <h5 className="text-xs font-bold text-white flex items-center gap-2">
                          {member.name}
                          {member.status === 'invited' && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-mono">
                              Invited
                            </span>
                          )}
                        </h5>
                        <p className="text-[11px] text-gray-400 font-mono">{member.email}</p>
                      </div>
                    </div>

                    <span className="text-xs font-mono px-2.5 py-1 bg-gray-900 border border-gray-800 text-brand-cyan rounded-lg font-semibold uppercase">
                      {member.role.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-5 rounded-2xl border flex flex-col justify-between space-y-4 relative",
                    p.popular ? "bg-gradient-to-b from-brand-cyan/15 to-gray-950 border-brand-cyan" : "bg-gray-950 border-gray-800"
                  )}
                >
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] bg-brand-cyan text-gray-950 font-extrabold px-3 py-0.5 rounded-full uppercase flex items-center gap-1">
                      <Star className="w-3 h-3 fill-gray-950" /> Most Popular
                    </span>
                  )}

                  <div>
                    <h4 className="text-base font-bold text-white mb-1">{p.name}</h4>
                    <div className="flex items-baseline gap-1 my-3">
                      <span className="text-3xl font-extrabold text-white font-mono">{p.price}</span>
                      <span className="text-xs text-gray-400">{p.period}</span>
                    </div>

                    <ul className="space-y-2 text-xs text-gray-300">
                      {p.features.map((f, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-brand-emerald shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    disabled={p.current}
                    className={cn(
                      "w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                      p.current
                        ? "bg-gray-800 text-gray-400 border border-gray-700 cursor-not-allowed"
                        : p.popular
                        ? "bg-brand-cyan hover:bg-cyan-400 text-gray-950 shadow-md"
                        : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                    )}
                  >
                    {p.buttonText}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
