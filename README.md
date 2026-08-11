# 🛡️ GitArmor AI — Enterprise DevSecOps & AI Security Intelligence Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge&logo=github-actions)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![Powered By Gemini 2.5](https://img.shields.io/badge/AI_Engine-Gemini_2.5_Flash-7C3AED?style=for-the-badge&logo=google-gemini)](https://ai.google.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

> **GitArmor AI** is a next-generation, AI-driven Static Application Security Testing (SAST) and DevSecOps platform. Built for modern software engineering teams, GitArmor automatically ingests code repositories, detects deep vulnerabilities (SQLi, XSS, SSRF, IDOR, Secrets, Supply Chain CVEs), generates contextual unified diff patches, provides live in-browser security sandbox testing, and enforces CI/CD security gates with automated SARIF & CycloneDX SBOM exports.

---

## 🌟 Key Highlights & Major Capabilities

```
+-----------------------------------------------------------------------------------+
|                                  GITARMOR AI PLATFORM                             |
+-----------------------------------------------------------------------------------+
|  [1] Real-time AI Code Scanner     │  [2] Interactive Code Sandbox & Fix Engine  |
|  [3] AI Security Co-Pilot Assistant │  [4] OWASP Top 10 & SOC2 Compliance Matrix |
|  [5] CycloneDX 1.5 SBOM Exporter   │  [6] GitHub Actions CI/CD Security Gate     |
|  [7] Real-Time Webhooks (Slack)    │  [8] Multi-Tenant SaaS & RBAC Workspaces   |
+-----------------------------------------------------------------------------------+
```

### 1. 🤖 Deep AI Security Analysis Engine
- **LLM-Powered SAST**: Analyzes code semantics beyond simple AST pattern matching using Google's **Gemini 2.5 Flash** model.
- **Chunked Stream Analysis**: Processes large repositories in parallel code chunks with live progress tracking and zero timeout constraints.
- **Unified Diff Generation**: Generates production-ready, contextual code patches ready to merge.

### 2. ⚡ In-Browser Code Remediation Sandbox
- **Live Code Editor**: Edit code snippets directly in the browser to test remediation strategies.
- **Automated Regression Checker**: Evaluates applied patches against safety test suites to prevent logic breakage or performance regressions.
- **One-Click PR Creator**: Generates automated Pull Requests directly with standardized security verification notes.

### 3. 💬 AI Security Co-Pilot
- **Context-Aware Assistance**: Dedicated chat drawer initialized with repository metadata and specific vulnerability line numbers.
- **Guided Explanations**: Explains complex exploit vectors, CWE classifications, and CVSS scores in developer-friendly terms.

### 4. 📊 Compliance & Audit Matrix
- **OWASP Top 10 (2025) & CWE Mapping**: Automated categorization against standards like Broken Access Control, Injection, Cryptographic Failures, and SSRF.
- **SOC2 & ISO 27001 Readiness**: Real-time calculated security compliance grade and risk density metrics.
- **CycloneDX 1.5 SBOM Exporter**: Export complete Software Bill of Materials (SBOM) for enterprise software supply chain security audits.

### 5. 🔁 CI/CD & Real-Time Alerts
- **GitHub Actions Workflow Generator**: Auto-generate `.github/workflows/gitarmor-scan.yml` to block non-compliant PRs.
- **SARIF & JSON/Markdown Export**: Standardized SARIF v2.1.0 output for native integration with GitHub Security tab and IDE tools.
- **Webhook Integrations**: Instant security alerts delivered via Slack, Discord, or Microsoft Teams.

### 6. 🏢 Multi-Tenant SaaS Workspace & RBAC
- **Workspace Switching**: Easily toggle between organization accounts (e.g., Enterprise, Pro, Personal Lab).
- **Role-Based Access Control (RBAC)**: Manage team permissions across `Admin`, `Security Lead`, `Developer`, and `Viewer` roles.

---

## 🏗️ System Architecture

```
                                +-------------------+
                                |   Client Browser  |
                                |  (React 19 + Vite)|
                                +---------+---------+
                                          |
                                    HTTPS / REST
                                          |
                                v---------v---------v
                                | Express Node Server|
                                |   (Port 3000)     |
                                +----+----+----+----+
                                     |    |    |
        +----------------------------+    |    +---------------------------+
        |                                 |                                |
v-------v-------v                v--------v--------v              v--------v--------v
| Gemini 2.5 AI |                | GitHub API Proxy |              | Webhook Dispatch|
| Analysis Engine|               | (Repo & Commits) |              | (Slack/Discord) |
+---------------+                +------------------+              +-----------------+
```

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend Framework** | React 19 + Vite 6 | High-performance Single Page Application architecture |
| **Language** | TypeScript 5.8 | End-to-end type safety and strict compile checks |
| **Styling & UI** | Tailwind CSS v4 + Lucide Icons | Premium high-contrast dark aesthetic with custom glassmorphism |
| **Data Visualization** | Recharts v3 | Responsive trend lines, metric gauges, and severity distribution charts |
| **Backend Runtime** | Express.js + TSX | Fast API proxy layer preventing key exposure |
| **AI Integration** | `@google/genai` (Gemini 2.5 Flash) | Contextual threat identification and patch generation |
| **Build & Bundling** | Esbuild | Single-file CJS server bundler for optimal runtime performance |

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Gemini API Key**: Obtain a key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-org/gitarmor-ai.git
cd gitarmor-ai
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
PORT=3000
NODE_ENV=development
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Build & Run in Production Mode
```bash
npm run build
npm run start
```

---

## 📑 API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/scans/start` | Initiates repository scanning with AST chunking |
| `GET` | `/api/scans/:scanId/status` | Polls scan progress and vulnerability findings |
| `POST` | `/api/scans/:scanId/fix` | Generates AI patch fix for a specific vulnerability |
| `POST` | `/api/scans/:scanId/regression-check` | Tests a custom patch in the code sandbox |
| `POST` | `/api/copilot` | Interactive Q&A stream with AI Security Co-Pilot |
| `POST` | `/api/webhook/test` | Sends test payload to Slack/Discord/Teams webhook |

---

## 🛡️ Security & Privacy Features

1. **Zero Secret Leaks**: API keys are strictly confined to the backend server environment (`process.env.GEMINI_API_KEY`). No secrets are transmitted or accessible to client-side bundles.
2. **Rate Limiting**: Built-in Express rate-limiting prevents API abuse during heavy repository scanning.
3. **Lazy Initialization**: AI client SDK is lazily instantiated to prevent runtime crashes upon key rotation or missing environment variables.

---

## 📜 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute it for enterprise or open-source DevSecOps workflows.

---

<p align="center">
  Developed with ❤️ by <b>GitArmor Security Engineering Team</b>
</p>
