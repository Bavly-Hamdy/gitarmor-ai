export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type VulnClass = "sqli" | "xss" | "ssrf" | "hardcoded_secret" | "insecure_deserialization" | "broken_auth" | "idor" | "path_traversal" | "dependency_cve" | "misconfig" | "other";
export type ScanStatus = "queued" | "cloning" | "parsing" | "analyzing" | "completed" | "failed";

export interface User {
  uid: string;
  githubUsername: string;
  avatarUrl: string;
  plan: "free" | "pro" | "enterprise";
}

export interface Scan {
  scanId: string;
  repoFullName: string;
  ref: string;
  status: ScanStatus;
  progress: { chunksTotal: number; chunksProcessed: number };
  securityScore: number | null;
  findingsSummary: Record<Severity, number>;
  createdAt: number;
  failureReason?: string;
  currentFile?: string;
  activeStepLabel?: string;
}

export interface Vulnerability {
  vulnId: string;
  scanId: string;
  filePath: string;
  startLine: number;
  endLine: number;
  codeSnippet: string;
  vulnerabilityClass: VulnClass;
  severity: Severity;
  cweId: string | null;
  description: string;
  status: "open" | "patch_proposed" | "pr_open" | "resolved" | "dismissed";
  proposedPatch: string | null;
  createdAt: number;
}

export interface CoPilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  codeSuggestion?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "pro" | "enterprise";
  role: "admin" | "security_lead" | "developer" | "viewer";
  membersCount: number;
  reposCount: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: "admin" | "security_lead" | "developer" | "viewer";
  status: "active" | "invited";
}

export interface NotificationChannel {
  id: string;
  type: "slack" | "teams" | "discord" | "email";
  name: string;
  webhookUrl: string;
  enabled: boolean;
  minSeverity: Severity;
}

export interface RegressionAnalysis {
  riskScore: number; // 0-100
  breakingChangeRisk: "low" | "medium" | "high";
  affectedFunctions: string[];
  testSuggestions: string[];
  compatibilityNotes: string;
}

