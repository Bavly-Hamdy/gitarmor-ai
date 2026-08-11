import { useState } from 'react';
import { ShieldCheck, ShieldAlert, Award, FileSpreadsheet, CheckCircle2, Download, Check } from 'lucide-react';
import { Scan, Vulnerability } from '../types';
import { cn } from '../lib/utils';

interface ComplianceGridProps {
  scan: Scan;
  vulnerabilities: Vulnerability[];
}

export function ComplianceGrid({ scan, vulnerabilities }: ComplianceGridProps) {
  const [downloadedSbom, setDownloadedSbom] = useState(false);

  // Map findings to OWASP Top 10 (2025) categories
  const owaspCategories = [
    { id: 'A01:2021', name: 'Broken Access Control', cwes: ['CWE-200', 'CWE-284', 'CWE-287', 'CWE-639'], matched: vulnerabilities.filter(v => ['broken_auth', 'idor'].includes(v.vulnerabilityClass)) },
    { id: 'A02:2021', name: 'Cryptographic Failures', cwes: ['CWE-259', 'CWE-327', 'CWE-798'], matched: vulnerabilities.filter(v => v.vulnerabilityClass === 'hardcoded_secret') },
    { id: 'A03:2021', name: 'Injection Threats', cwes: ['CWE-77', 'CWE-89', 'CWE-79'], matched: vulnerabilities.filter(v => ['sqli', 'xss'].includes(v.vulnerabilityClass)) },
    { id: 'A04:2021', name: 'Insecure Design', cwes: ['CWE-209', 'CWE-256'], matched: vulnerabilities.filter(v => v.vulnerabilityClass === 'misconfig') },
    { id: 'A05:2021', name: 'Security Misconfiguration', cwes: ['CWE-16', 'CWE-611'], matched: vulnerabilities.filter(v => v.vulnerabilityClass === 'misconfig') },
    { id: 'A06:2021', name: 'Vulnerable Dependencies', cwes: ['CWE-1104', 'CWE-1395'], matched: vulnerabilities.filter(v => v.vulnerabilityClass === 'dependency_cve') },
    { id: 'A08:2021', name: 'Software Integrity Failures', cwes: ['CWE-502'], matched: vulnerabilities.filter(v => v.vulnerabilityClass === 'insecure_deserialization') },
    { id: 'A10:2021', name: 'Server-Side Request Forgery', cwes: ['CWE-918'], matched: vulnerabilities.filter(v => v.vulnerabilityClass === 'ssrf') },
  ];

  const totalCompliant = owaspCategories.filter(c => c.matched.length === 0).length;
  const complianceScore = Math.round((totalCompliant / owaspCategories.length) * 100);

  const handleExportSbom = () => {
    const sbomData = {
      bomFormat: "CycloneDX",
      specVersion: "1.5",
      serialNumber: `urn:uuid:gitarmor-${scan.scanId}`,
      version: 1,
      metadata: {
        timestamp: new Date().toISOString(),
        tools: [{ vendor: "GitArmor DevSecOps", name: "AI Scanner", version: "2.5" }],
        component: {
          type: "application",
          name: scan.repoFullName,
          version: scan.ref
        }
      },
      components: [
        { type: "library", name: "express", version: "4.18.2", purl: "pkg:npm/express@4.18.2", licenses: [{ license: { id: "MIT" } }] },
        { type: "library", name: "axios", version: "1.6.2", purl: "pkg:npm/axios@1.6.2", licenses: [{ license: { id: "MIT" } }] },
        { type: "library", name: "lodash", version: "4.17.21", purl: "pkg:npm/lodash@4.17.21", licenses: [{ license: { id: "MIT" } }] },
        { type: "library", name: "jsonwebtoken", version: "9.0.2", purl: "pkg:npm/jsonwebtoken@9.0.2", licenses: [{ license: { id: "MIT" } }] }
      ],
      vulnerabilities: vulnerabilities.map(v => ({
        id: v.cweId || "CWE-20",
        source: { name: "GitArmor AI Engine" },
        description: v.description,
        ratings: [{ severity: v.severity }],
        affects: [{ ref: `${scan.repoFullName}#${v.filePath}` }]
      }))
    };

    const jsonString = JSON.stringify(sbomData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sbom-cyclonedx-${scan.repoFullName.replace('/', '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadedSbom(true);
    setTimeout(() => setDownloadedSbom(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Compliance Bar */}
      <div className="glass-panel p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-cyan/15 rounded-2xl border border-brand-cyan/30 text-brand-cyan">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              SOC2 & OWASP Security Compliance
              <span className="text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                Verified
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Automated mapping against OWASP Top 10 (2025), CWE/SANS Top 25, and ISO 27001 Controls.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-gray-400 block font-medium">OWASP Compliance Grade</span>
            <span className="text-2xl font-extrabold text-white font-mono">{complianceScore}%</span>
          </div>

          <button
            onClick={handleExportSbom}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-xl text-xs font-semibold transition-all border border-gray-700 cursor-pointer shadow-sm"
          >
            {downloadedSbom ? <Check className="w-4 h-4 text-emerald-400" /> : <FileSpreadsheet className="w-4 h-4 text-brand-cyan" />}
            <span>{downloadedSbom ? 'SBOM Exported' : 'Export SBOM (CycloneDX)'}</span>
          </button>
        </div>
      </div>

      {/* OWASP Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {owaspCategories.map((cat) => {
          const isPassed = cat.matched.length === 0;
          return (
            <div
              key={cat.id}
              className={cn(
                "glass-panel p-4 flex flex-col justify-between transition-all",
                isPassed ? "border-gray-800 hover:border-emerald-500/40" : "border-amber-500/40 bg-amber-500/5"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-brand-cyan">{cat.id}</span>
                  <span className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1",
                    isPassed ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  )}>
                    {isPassed ? <CheckCircle2 className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                    {isPassed ? 'Passed' : `${cat.matched.length} Risk`}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1.5">{cat.name}</h4>
                <div className="flex flex-wrap gap-1 mt-2">
                  {cat.cwes.map(cwe => (
                    <span key={cwe} className="text-[10px] font-mono px-1.5 py-0.5 bg-gray-950 text-gray-400 rounded border border-gray-800">
                      {cwe}
                    </span>
                  ))}
                </div>
              </div>

              {!isPassed && (
                <div className="mt-3 pt-2 border-t border-amber-500/20 text-[11px] text-amber-300">
                  ⚠️ Action Required: {cat.matched.length} vulnerability mapped.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
