import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Scan, Vulnerability } from '../types';

interface ScanContextType {
  scans: Record<string, Scan>;
  vulnerabilities: Record<string, Vulnerability[]>;
  startScan: (repoFullName: string, ref: string) => Promise<string>;
  generateFix: (vulnId: string, scanId: string) => Promise<void>;
  createPullRequest: (vulnId: string, scanId: string) => Promise<void>;
  pollScan: (scanId: string) => void;
  refreshAllScans: () => Promise<void>;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export const ScanProvider = ({ children }: { children: ReactNode }) => {
  const [scans, setScans] = useState<Record<string, Scan>>(() => {
    try {
      const saved = localStorage.getItem('gitarmor_scans');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [vulnerabilities, setVulnerabilities] = useState<Record<string, Vulnerability[]>>(() => {
    try {
      const saved = localStorage.getItem('gitarmor_vulns');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('gitarmor_scans', JSON.stringify(scans));
  }, [scans]);

  useEffect(() => {
    localStorage.setItem('gitarmor_vulns', JSON.stringify(vulnerabilities));
  }, [vulnerabilities]);

  const pollScan = useCallback(async (scanId: string) => {
    try {
      const res = await fetch(`/api/scans/${scanId}`);
      if (!res.ok) return;
      const data = await res.json();
      
      setScans(prev => ({
        ...prev,
        [scanId]: {
          scanId: data.scanId,
          repoFullName: data.repoFullName,
          ref: data.ref,
          status: data.status,
          progress: data.progress,
          securityScore: data.securityScore,
          findingsSummary: data.findingsSummary,
          createdAt: data.createdAt,
          failureReason: data.failureReason,
        }
      }));

      setVulnerabilities(prev => ({
        ...prev,
        [scanId]: data.vulnerabilities || []
      }));
    } catch (e) {
      console.error('Polling error', e);
    }
  }, []);

  const startScan = useCallback(async (repoFullName: string, ref: string) => {
    const res = await fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoFullName, branch: ref })
    });
    
    if (!res.ok) throw new Error('Failed to start scan');
    const { scanId } = await res.json();
    return scanId;
  }, []);

  const generateFix = useCallback(async (vulnId: string, scanId: string) => {
    const vuln = vulnerabilities[scanId]?.find(v => v.vulnId === vulnId);
    const res = await fetch(`/api/scans/${scanId}/fix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vulnId, vuln })
    });
    if (!res.ok) throw new Error('Failed to generate fix');
    
    const { patch } = await res.json();
    setVulnerabilities(prev => {
      const vulns = prev[scanId];
      if (!vulns) return prev;
      return {
        ...prev,
        [scanId]: vulns.map(v => 
          v.vulnId === vulnId ? { ...v, proposedPatch: patch, status: 'patch_proposed' } : v
        )
      };
    });
  }, [vulnerabilities]);

  const createPullRequest = useCallback(async (vulnId: string, scanId: string) => {
    const vuln = vulnerabilities[scanId]?.find(v => v.vulnId === vulnId);
    const res = await fetch(`/api/scans/${scanId}/pr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vulnId, vuln })
    });
    if (!res.ok) throw new Error('Failed to create PR');
    
    setVulnerabilities(prev => {
      const vulns = prev[scanId];
      if (!vulns) return prev;
      return {
        ...prev,
        [scanId]: vulns.map(v => 
          v.vulnId === vulnId ? { ...v, status: 'pr_open' } : v
        )
      };
    });
  }, [vulnerabilities]);

  const refreshAllScans = useCallback(async () => {
    try {
      const keys = Object.keys(scans);
      if (keys.length === 0) return;
      await Promise.all(keys.map(id => pollScan(id)));
    } catch (e) {
      console.error('Failed to refresh scans', e);
    }
  }, [scans, pollScan]);

  return (
    <ScanContext.Provider value={{ scans, vulnerabilities, startScan, generateFix, createPullRequest, pollScan, refreshAllScans }}>
      {children}
    </ScanContext.Provider>
  );
};

export const useScanEngine = () => {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error('useScanEngine must be used within a ScanProvider');
  }
  return context;
};
