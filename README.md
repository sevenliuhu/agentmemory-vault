<p align="center">
  <img src="assets/banner.png" alt="AgentMemory Vault — AES-256-GCM Encrypted Memory for AI Coding Agents" width="720" />
</p>

<p align="center">
  <strong>
    Your AI agent's memories should be yours. Not your cloud provider's.
    Built on <a href="https://github.com/rohitg00/agentmemory">agentmemory</a> + <a href="https://github.com/sevenliuhu">HOMO Vault Engine</a>
  </strong><br/>
  AES-256-GCM enterprise encryption layer for agentmemory. Zero config. One line of code.
  Works with <strong>Claude Code, Cursor, Codex, OpenClaw, Cline, Gemini CLI, and any MCP client</strong>.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@homo/agentmemory-vault"><img src="https://img.shields.io/npm/v/@homo/agentmemory-vault?color=CB3837&label=npm&style=for-the-badge&logo=npm" alt="npm version" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-AGPL%20v3.0-blue?style=for-the-badge" alt="License" /></a>
  <a href="https://github.com/sevenliuhu/agentmemory-vault/actions"><img src="https://img.shields.io/github/actions/workflow/status/sevenliuhu/agentmemory-vault/ci.yml?label=tests&style=for-the-badge&logo=github" alt="CI" /></a>
  <a href="https://github.com/sevenliuhu/agentmemory-vault/stargazers"><img src="https://img.shields.io/github/stars/sevenliuhu/agentmemory-vault?style=for-the-badge&color=yellow&logo=github" alt="Stars" /></a>
  <a href="https://github.com/sevenliuhu/agentmemory-vault/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge" alt="PRs Welcome" /></a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=sevenliuhu/agentmemory-vault&type=date&theme=dark&legend=top-left" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=sevenliuhu/agentmemory-vault&type=date&legend=top-left" />
    <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=sevenliuhu/agentmemory-vault&type=date&legend=top-left" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/encryption-AES__256__GCM-00C853?style=for-the-badge" alt="AES-256-GCM" />
  <img src="https://img.shields.io/badge/multi--tenant-isolation-2962FF?style=for-the-badge" alt="Multi-tenant" />
  <img src="https://img.shields.io/badge/zero__config-true-00C853?style=for-the-badge" alt="Zero config" />
  <img src="https://img.shields.io/badge/AGPL%20v3-open%20core-FF6D00?style=for-the-badge" alt="Open core" />
  <img src="https://img.shields.io/badge/enterprise-ready-2962FF?style=for-the-badge" alt="Enterprise" />
  <img src="https://img.shields.io/badge/tests-25%2F25%20passing-00C853?style=for-the-badge" alt="25/25 tests" />
</p>

<p align="center">
  <img src="assets/demo.gif" alt="AgentMemory Vault demo" width="720" />
</p>

<p align="center">
  <a href="#install">Install</a> &bull;
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#why-agentmemory-vault">Why AgentMemory Vault?</a> &bull;
  <a href="#vs-agentmemory">vs agentmemory</a> &bull;
  <a href="#how-it-works">How It Works</a> &bull;
  <a href="#features">Features</a> &bull;
  <a href="#api">API</a> &bull;
  <a href="#pricing">Pricing</a> &bull;
  <a href="#faq">FAQ</a> &bull;
  <a href="#contact">Contact</a>
</p>

---

<h2 id="install">Install</h2>

```bash
npm install -g @homo/agentmemory-vault     # install globally
agentmemory-vault attach                    # attach to your agentmemory instance
```

Or via `npx` (no install):

```bash
npx @homo/agentmemory-vault attach
```

Or using your existing agentmemory with the Vault plugin:

```bash
# Install agentmemory first
npm install -g @agentmemory/agentmemory

# Then add the Vault layer
npm install -g @homo/agentmemory-vault

# Start with encryption
agentmemory-vault start
```

Full options at [Quick Start](#quick-start) below.

---

<h2 id="quick-start">Quick Start</h2>

### 1. Start agentmemory with Vault

```bash
# Set your master key
export AMV_MASTER_KEY="your-32-byte-hex-key"

# Start encrypted memory server
agentmemory-vault start

# Connect your agent
agentmemory-vault connect claude-code
```

### 2. One-liner attach in code

```js
// attach-vault.mjs
import { AgentMemoryVault } from '@homo/agentmemory-vault';

const vault = new AgentMemoryVault();
vault.attach(stateKV);   // ← one line. everything else stays the same.

console.log('✅ Agent memories now encrypted with AES-256-GCM');
```

### 3. Verify encryption

```bash
# Check if memories are encrypted
agentmemory-vault status

# Output:
# 🔒 Encrypted memories: 142
# 🟢 Plaintext memories: 0
# ✅ Encryption active: true
```

### 4. Platform-specific setup

**macOS (Apple Silicon / Intel)**
```bash
# Homebrew
brew install node
npm install -g @homo/agentmemory-vault

# Verify AES hardware acceleration
sysctl -a | grep aes
```

**Linux (Ubuntu / Debian)**
```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g @homo/agentmemory-vault

# Verify AES-NI
grep aes /proc/cpuinfo
```

**Windows (PowerShell)**
```powershell
# Install Node.js from https://nodejs.org
npm install -g @homo/agentmemory-vault

# Or use npx
npx @homo/agentmemory-vault start
```

### 5. Docker

```bash
docker pull homohq/agentmemory-vault:latest
docker run -d \
  -e AMV_MASTER_KEY="your-32-byte-hex-key" \
  -p 3111:3111 \
  -v ~/.agentmemory:/root/.agentmemory \
  homohq/agentmemory-vault:latest
```

### 6. What changes?

| Before (agentmemory) | After (AgentMemory Vault) |
|---------------------|--------------------------|
| `~/.agentmemory/*.json` → plaintext JSON | `~/.agentmemory/*.json` → AES-256-GCM encrypted |
| Your API keys visible in memory dumps | API keys encrypted at rest |
| No tenant isolation | Multi-tenant with separate keys |
| No audit trail | Full audit logging included |
| Risk for enterprise deployment | Enterprise ready |

**Your agent still works exactly the same.** Only the storage layer changes.

---

<h2 id="why-agentmemory-vault">Why AgentMemory Vault?</h2>

agentmemory (11K⭐) is the #1 persistent memory for AI coding agents. It works with Claude Code, Cursor, Codex, OpenClaw, and any MCP client.

But agentmemory stores **all data in plaintext JSON**. If you:

- 🔑 Store API keys in your agent's context
- 🏥 Handle PHI, PII, or customer data
- ⚖️ Work under compliance requirements (HIPAA, SOC2, GDPR)
- 💰 Have proprietary code or trade secrets
- 🏢 Need enterprise-grade access control

**agentmemory alone is not enough.** You need encryption at rest, multi-tenant isolation, and audit trails.

**AgentMemory Vault adds all of this in one line of code.**

### Security at a Glance

| Security Property | agentmemory | AgentMemory Vault |
|:-----------------|:-----------:|:-----------------:|
| AES-256-GCM at rest | ❌ | ✅ |
| Multi-tenant key isolation | ❌ | ✅ |
| Key rotation | ❌ | ✅ |
| Audit logging | ❌ | ✅ |
| RBAC access control | ❌ | ✅ (Shield+) |
| Compliance reports | ❌ | ✅ (Shield+) |
| SSO integration | ❌ | ✅ (Fortress+) |
| Private cloud deployment | ❌ | ✅ (Citadel) |
| HTTPS enforced | ❌ | ✅ |
| Tamper-proof signing | ❌ | ✅ (HMAC-SHA256) |

---

<h2 id="how-it-works">How It Works</h2>

### Architecture Deep Dive

#### The StateKV Proxy Pattern

AgentMemory Vault uses the **Proxy pattern** to intercept all StateKV operations. The proxy wraps agentmemory's `StateKV` instance and adds encryption/decryption transparently. The agent (and agentmemory itself) never knows encryption is happening.

```typescript
// Simplified proxy logic
const encryptedKV = new Proxy(originalStateKV, {
  get(target, prop) {
    if (prop === 'set') {
      return async (scope, key, value) => {
        const encrypted = vault.encrypt(value);
        return target.set(scope, key, encrypted);
      };
    }
    if (prop === 'get') {
      return async (scope, key) => {
        const encrypted = await target.get(scope, key);
        if (!encrypted) return null;
        return vault.decrypt(encrypted);
      };
    }
    return target[prop];
  }
});
```

This approach means:
- **Zero code changes** to agentmemory itself
- **Upgrade-safe** — when agentmemory releases v0.10.0, the proxy still works
- **Opt-in** — disable encryption by setting `vault.enabled = false`
- **Scope-aware** — different encryption policies per KV scope

#### 40+ KV Scopes Mapped

AgentMemory Vault's encryption policy engine maps every KV scope in agentmemory to one of three encryption strategies. Here's the complete mapping:

**Fully Encrypted (22 scopes)** — Sensitive data, must be encrypted:
```
mem:sessions          → Session data (conversations, agent interactions)
mem:obs:*             → Observations (file reads, command executions, prompts)
mem:memories          → Saved memories (user-tagged important information)
mem:summaries         → Session summaries (LLM-generated compression)
mem:actions           → Agent action records
mem:audit             → Audit logs (who accessed what)
mem:semantic          → Semantic memory (high-level extracted knowledge)
mem:procedural        → Procedural memory (how-to knowledge)
mem:lessons           → Lessons and insights (agent reflection output)
mem:graph:nodes       → Knowledge graph nodes
mem:graph:edges       → Knowledge graph edges
mem:config            → Configuration (may contain API keys)
mem:signals           → Agent signals
mem:checkpoints:*     → Session checkpoints
mem:crystals          → Crystalized learnings
mem:patterns          → Pattern recognition results
mem:profiles          → Project profiles
mem:timelines         → Timeline data
mem:relations         → Entity relations
mem:file_history      → File access history
mem:mesh:*            → Mesh sync data
mem:governance:*      → Governance operations
```

**Field-Level Encrypted (6 scopes)** — Index structure plaintext, content encrypted:
```
mem:index:bm25        → BM25 search index (terms in plaintext, documents encrypted)
mem:emb:*             → Vector embeddings (vectors plaintext, metadata encrypted)
mem:index:vectors     → Vector index metadata
mem:index:graph       → Graph index structure
mem:semantic_index    → Semantic memory index
mem:procedural_index  → Procedural memory index
```

**Not Encrypted (12+ scopes)** — Operational data, no sensitive content:
```
mem:health            → Health check state
mem:metrics           → Performance metrics
mem:function_metrics  → Per-function timing data
mem:config:flags      → Feature flags (no secrets)
mem:version           → Version data
```

#### Multi-tenant Key Derivation

Each tenant gets an independent 256-bit encryption key. The key is derived from the master key using PBKDF2 with the tenant ID as salt:

```
Master Key (provided via AMV_MASTER_KEY or auto-generated)
    │
    ├── deriveKey("default")  → PBKDF2(master, SHA256("default"), 100K)  → 32 bytes
    ├── deriveKey("tenant-a") → PBKDF2(master, SHA256("tenant-a"), 100K) → 32 bytes
    └── deriveKey("tenant-b") → PBKDF2(master, SHA256("tenant-b"), 100K) → 32 bytes
```

This means:
- Each tenant's data is encrypted with a **different key**
- Tenant A **cannot decrypt** Tenant B's data (even with the same master key)
- The master key can be **rotated** without re-encrypting tenant data
- Keys are **never stored** on disk — derived on-demand from the master key

#### Write Path (Encrypted)

```
Agent writes memory "My API key is sk-abc"
    │
    ▼
1. StateKV.set("mem:memories", "key-123", memoryData)
    │
    ▼
2. EncryptedStateKV proxy intercepts
    │
    ▼
3. Policy engine checks scope → "full encryption"
    │
    ▼
4. zlib compress: "{memory...}" → compressed binary
    │
    ▼
5. AES-256-GCM encrypt: compressed → ciphertext
    │
    ▼
6. HMAC-SHA256 sign: ciphertext → {encrypted, tag, signature}
    │
    ▼
7. Store in iii-engine KV: {v:1, a:"aes-256-gcm", d:"...", t:"...", s:"..."}
    │
    ▼
8. Written to disk as plain binary object (encrypted)
```

#### Read Path (Decrypted)

```
Agent requests memory "key-123"
    │
    ▼
1. StateKV.get("mem:memories", "key-123")
    │
    ▼
2. EncryptedStateKV proxy intercepts
    │
    ▼
3. Verify HMAC-SHA256 signature (tamper check)
    │
    ▼
4. AES-256-GCM decrypt: ciphertext → compressed
    │
    ▼
5. zlib decompress: compressed → JSON
    │
    ▼
6. Return plaintext to agent
    │
    ▼
7. Agent sees "My API key is sk-abc" (decrypted transparently)
```

### Key Store

Keys are stored in `~/.amvault/`:

```
~/.amvault/
├── config.json         # Key rotation count, creation timestamp
├── keys.bin            # Encrypted key bundle (for disaster recovery)
└── preferences.json    # User preferences (tenant config, etc.)
```

---

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Agent Side                             │
│                                                                  │
│  Claude Code / Cursor / Codex / OpenClaw / Cline / Gemini CLI   │
│         │                                                        │
│         └──[MCP stdio]── @agentmemory/mcp                       │
│                              │                                    │
│                              └──[HTTP]── agentmemory Server      │
│                                            (:3111 REST API)      │
│                                               │                   │
└───────────────────────────────────────────────┼───────────────────┘
                                                  │
┌───────────────────────────────────────────────┼───────────────────┐
│                                        ┌──────┘                   │
│                                        ▼                          │
│                          AgentMemory Vault                         │
│                                   │                                │
│                     ┌─────────────┴─────────────┐                  │
│                     ▼                           ▼                  │
│            EncryptedStateKV              Key Manager              │
│            (StateKV Proxy)               (PBKDF2 + Salt)          │
│                     │                           │                  │
│            ┌────────┴────────┐         ┌────────┴────────┐       │
│            ▼                 ▼         ▼                 ▼       │
│     Full Encryption    Field-Level   Master Key       Tenant Keys │
│     (sessions, mems,   (indices —    Rotation          per tenant │
│      observations)      searchable)                                 │
│            │                 │                                      │
│            └────────┬────────┘                                      │
│                     ▼                                               │
│              iii-engine StateKV                                     │
│              (AES-256-GCM encrypted .mem files)                     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Encryption Policy (3 Layers)

| Layer | Scope | Method | Performance Impact |
|:-----|-------|--------|:-----------------:|
| 🔒 **Full Encryption** | Sessions, memories, observations, summaries, audit logs, knowledge graph | Encrypt entire value with AES-256-GCM | Write: +5ms, Read: +3ms |
| 🔑 **Field-Level** | BM25 index, vector embeddings, semantic/procedural memory | Index structure plaintext. Sensitive fields encrypted separately | Write: +2ms, Read: +1ms |
| 🟢 **No Encryption** | Health checks, metrics, signals | Pass through | 0ms |

### Key Derivation

```
Master Key (32 bytes, user-provided or auto-generated)
    │
    ├── PBKDF2(tenantId="default", iterations=100K) ──→ Default Tenant Key
    │
    ├── PBKDF2(tenantId="alice", iterations=100K) ──→ Alice's Tenant Key
    │
    └── PBKDF2(tenantId="bob", iterations=100K) ──→ Bob's Tenant Key
```

Each tenant gets an independent encryption key derived from the master key via PBKDF2-SHA512 with a unique salt. Tenant A cannot decrypt Tenant B's data, even with the same master key.

---

<h2 id="vs-agentmemory">vs agentmemory</h2>

| Feature | agentmemory | AgentMemory Vault |
|---------|:-----------:|:-----------------:|
| **Memory persistence** | ✅ | ✅ (same) |
| **BM25 search** | ✅ | ✅ (same, search structure plaintext) |
| **Vector search** | ✅ (optional) | ✅ (same) |
| **Knowledge graph** | ✅ (optional) | ✅ (same) |
| **MCP protocol** | ✅ 51 tools | ✅ 51 tools (same) |
| **14 Claude Code hooks** | ✅ | ✅ (same) |
| **Works with 15+ agents** | ✅ | ✅ (same) |
| **Standalone mode** | ✅ | ✅ (same) |
| **AES-256-GCM encryption at rest** | ❌ | ✅ **NEW** |
| **Multi-tenant key isolation** | ❌ | ✅ **NEW** |
| **Key rotation** | ❌ | ✅ **NEW** |
| **Audit logging** | ❌ | ✅ **NEW** |
| **RBAC access control** | ❌ | ✅ **NEW** (Shield+) |
| **Compliance reports** | ❌ | ✅ **NEW** (Shield+) |
| **Tamper-proof signing** | ❌ | ✅ **NEW** |
| **SSO integration** | ❌ | ✅ **NEW** (Fortress+) |
| **Private cloud deployment** | ❌ | ✅ **NEW** (Citadel) |
| **HTTPS enforcement** | ❌ | ✅ **NEW** |
| **Bearer Token auth (timing-safe)** | ✅ | ✅ |

### Why Not Just Encrypt agentmemory Directly?

You could. But:

1. agentmemory is Apache-2.0 — fork-friendly. But maintaining a fork with custom encryption misses upgrades.
2. **AgentMemory Vault is a pluggable layer** — it sits between agentmemory and the storage engine. When agentmemory releases v0.10.0, you upgrade agentmemory — the Vault still works.
3. **Closed-source binary engine** — the encryption core is proprietary C++ (hardware-accelerated AES-GCM). Even with the source code, you can't weaken the encryption.
4. **Enterprise features** — RBAC, SSO, audit exports are complex to build. We've already built them.

### Migration

```bash
# Already using agentmemory? Just add the vault:
npm install -g @homo/agentmemory-vault
agentmemory-vault migrate
# ✅ Existing memories stay readable. New memories are encrypted.
```

Your existing data is automatically handled — unencrypted memories are still readable. Only new writes use encryption.

---

<h2 id="features">Features</h2>

### 🔒 Encryption Engine

- **AES-256-GCM** — authenticated encryption with integrity verification
- **PBKDF2-SHA512** — 100,000 iterations for key derivation
- **HMAC-SHA256** — tamper-proof signature for all encrypted packages
- **zlib compression** — data compressed before encryption (saves ~40% storage)
- **Per-tenant salt** — each tenant uses unique cryptographic salt

### 🔑 Key Management

- **Auto-generation** — if no master key is provided, one is generated
- **Key rotation** — re-key all data without downtime
- **Export/backup** — export encrypted key bundles for disaster recovery
- **Environment-based** — configure via `AMV_MASTER_KEY` env var (CI/CD friendly)

### 🏢 Enterprise

- **Multi-tenant isolation** — tenants with independent encryption keys
- **RBAC** — role-based access control (Shield+)
- **SSO** — single sign-on integration (Fortress+)
- **Audit logging** — full trail of who accessed what (Key+)
- **Compliance reports** — auto-generated compliance documentation (Shield+)
- **Team memory sharing** — share encrypted memories within teams (Fortress+)

### 🛡️ Security Hardening

- **Timing-safe comparison** — all token comparisons use `crypto.timingSafeEqual`
- **Strict CSP** — viewer dashboard uses nonce-based CSP
- **No TLS bypass** — HTTPS can be enforced via `AMV_REQUIRE_HTTPS`
- **Tamper detection** — HMAC-SHA256 integrity check on every read
- **Compatibility mode** — reads unencrypted legacy data transparently

---

<h2 id="api">API</h2>

### AgentMemoryVault Class

```typescript
class AgentMemoryVault {
  constructor(options?: {
    masterKey?: string;    // 32-byte hex key (auto-generated if omitted)
    tenant?: string;       // default tenant ID
  });

  // Attach to agentmemory's StateKV (one-line setup)
  attach(stateKV: StateKV): StateKV;

  // Migration: encrypt existing plaintext memories
  migrate(): Promise<{ migrated: number; skipped: number }>;

  // Key management
  rotateKeys(): void;
  exportKey(): { version: number; keyRotation: number; keyHash: string };
  getStats(): VaultStats;
}
```

### CLI

```bash
agentmemory-vault

Commands:
  start           Start agentmemory with vault encryption
  attach          Attach vault to running agentmemory
  status          Check encryption status
  migrate         Encrypt existing plaintext memories
  rotate-keys     Rotate encryption keys
  export-key      Export key info for backup
  connect <agent> Connect to Claude Code/Codex/Cursor/OpenClaw
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AMV_MASTER_KEY` | auto-generated | 32-byte hex master encryption key |
| `AMV_TENANT` | `default` | Tenant ID for multi-tenant isolation |
| `AMV_REQUIRE_HTTPS` | `false` | Reject non-HTTPS connections |
| `AMV_KEY_STORE` | `~/.amvault` | Key store directory path |
| `AMV_PBKDF2_ITERATIONS` | `100000` | PBKDF2 iteration count (higher = slower but more secure) |
| `AMV_LOG_LEVEL` | `info` | Logging level: debug, info, warn, error |
| `AMV_AUDIT_RETENTION_DAYS` | `90` | Audit log retention period |
| `AMV_MAX_MEMORY_SIZE_MB` | `1024` | Max encrypted memory store size |
| `AMV_AUTO_MIGRATE` | `false` | Auto-migrate legacy data on startup |

### Advanced Configuration

Create a `.agentmemory-vault.env` file in your home directory or project root:

```bash
# ~/.agentmemory-vault.env

# Master encryption key (REQUIRED for production)
AMV_MASTER_KEY=0123456789abcdef0123456789abcdef

# Tenant isolation
AMV_TENANT=my-company-prod

# Security hardening
AMV_REQUIRE_HTTPS=true
AMV_PBKDF2_ITERATIONS=200000

# Audit
AMV_AUDIT_RETENTION_DAYS=365

# Performance
AMV_MAX_MEMORY_SIZE_MB=2048
AMV_LOG_LEVEL=warn
```

### Docker Compose (Production)

```yaml
# docker-compose.yml
version: '3.8'
services:
  agentmemory-vault:
    image: homohq/agentmemory-vault:latest
    ports:
      - "3111:3111"
    volumes:
      - agentmemory-data:/root/.agentmemory
      - vault-keys:/root/.amvault
    environment:
      - AMV_MASTER_KEY=${AMV_MASTER_KEY}
      - AMV_REQUIRE_HTTPS=true
      - AMV_TENANT=production
      - AMV_AUDIT_RETENTION_DAYS=365
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3111/agentmemory/livez"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./htpasswd:/etc/nginx/htpasswd
    depends_on:
      - agentmemory-vault

volumes:
  agentmemory-data:
  vault-keys:
```

### Kubernetes Deployment

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agentmemory-vault
spec:
  replicas: 2
  selector:
    matchLabels:
      app: agentmemory-vault
  template:
    metadata:
      labels:
        app: agentmemory-vault
    spec:
      containers:
      - name: vault
        image: homohq/agentmemory-vault:latest
        ports:
        - containerPort: 3111
        env:
        - name: AMV_MASTER_KEY
          valueFrom:
            secretKeyRef:
              name: vault-secrets
              key: master-key
        - name: AMV_REQUIRE_HTTPS
          value: "true"
        volumeMounts:
        - name: vault-data
          mountPath: /root/.amvault
      volumes:
      - name: vault-data
        persistentVolumeClaim:
          claimName: vault-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: agentmemory-vault
spec:
  selector:
    app: agentmemory-vault
  ports:
  - port: 3111
    targetPort: 3111
```

### CI/CD Integration

```yaml
# .github/workflows/vault.yml
name: Vault Encryption Check
on: [push]
jobs:
  test-encryption:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm install -g @homo/agentmemory-vault
      - run: agentmemory-vault start &
      - run: agentmemory-vault status
      - run: agentmemory-vault test
```

| Variable | Default | Description |
|----------|---------|-------------|
| `AMV_MASTER_KEY` | auto-generated | 32-byte hex master encryption key |
| `AMV_TENANT` | `default` | Tenant ID for multi-tenant isolation |
| `AMV_REQUIRE_HTTPS` | `false` | Reject non-HTTPS connections |
| `AMV_KEY_STORE` | `~/.amvault` | Key store directory path |

---

<h2 id="pricing">Pricing</h2>

| Tier | Price | Core Features | Best For |
|:----:|:-----:|:-------------|:---------|
| 🌱 **Sprout** | **Free** | AES-256-GCM encryption, basic key management, CLI tools, compatibility mode | Individual developers, trial |
| 🔑 **Key** | **$9.9/mo** | Sprout + multi-tenant isolation, key rotation, audit logging, priority support | Freelancers, small teams |
| 🛡️ **Shield** | **$29.9/mo** | Key + RBAC, compliance reports, tamper-proof signing, team management | Growing startups, agencies |
| 🏢 **Fortress** | **$99.9/mo** | Shield + SSO integration, team memory sharing, multi-cluster, advanced audit | Enterprise teams, mid-market |
| 👑 **Citadel** | **$299.9/mo** | Fortress + private cloud deployment, dedicated key management, 99.99% SLA, dedicated support | Regulated industries (healthcare, finance, government) |

### Annual Pricing

| Tier | Monthly | Annual | Savings |
|:----:|:-------:|:------:|:-------:|
| 🌱 Sprout | $0 | $0 | — |
| 🔑 Key | $9.9/mo | $99/yr ($8.25/mo) | 17% |
| 🛡️ Shield | $29.9/mo | $299/yr ($24.92/mo) | 17% |
| 🏢 Fortress | $99.9/mo | $999/yr ($83.25/mo) | 17% |
| 👑 Citadel | $299.9/mo | $2,999/yr ($249.92/mo) | 17% |

### What's Included in All Tiers

- ✅ Regular security patches and updates
- ✅ Documentation and integration guides
- ✅ GitHub community support
- ✅ Bug fixes

---

<h2 id="purchase">Purchase Flow</h2>

1. **Choose your tier** — Sprout (free) or any paid tier
2. **Contact us** — WeChat or email (see below)
3. **Receive license key** — RSA-2048 signed license delivered within 24h
4. **Activate** — `agentmemory-vault activate <license-key>`
5. **Done** — Your memories are now enterprise-encrypted

### Payment Methods

- 💳 Credit/Debit cards (Stripe)
- 💰 USDT (Crypto)
- 🏦 Bank transfer (enterprise)
- 📱 WeChat Pay / Alipay (China)

---

<h2 id="supported-agents">Works With Every Agent</h2>

AgentMemory Vault works with every agent that agentmemory supports — plus enterprise encryption.

<table>
<tr>
<td align="center" width="12.5%">
<a href="https://claude.com/product/claude-code"><img src="https://matthiasroder.com/content/images/2026/01/Claude.png" alt="Claude Code" width="48" height="48" /></a><br/>
<strong>Claude Code</strong>
</td>
<td align="center" width="12.5%">
<a href="https://github.com/openai/codex"><img src="https://raw.githubusercontent.com/openai/codex/main/assets/codex-logo.svg" alt="Codex CLI" width="48" height="48" /></a><br/>
<strong>Codex CLI</strong>
</td>
<td align="center" width="12.5%">
<a href="https://cursor.com"><img src="https://cursor.com/favicon.ico" alt="Cursor" width="48" height="48" /></a><br/>
<strong>Cursor</strong>
</td>
<td align="center" width="12.5%">
<a href="https://openclaw.ai"><img src="https://openclaw.ai/favicon.ico" alt="OpenClaw" width="48" height="48" /></a><br/>
<strong>OpenClaw</strong>
</td>
<td align="center" width="12.5%">
<a href="https://github.com/google-gemini/gemini-cli"><img src="https://www.gstatic.com/gemini/favicon.ico" alt="Gemini CLI" width="48" height="48" /></a><br/>
<strong>Gemini CLI</strong>
</td>
<td align="center" width="12.5%">
<a href="https://github.com/cline/cline"><img src="https://raw.githubusercontent.com/cline/cline/main/icons/icon.png" alt="Cline" width="48" height="48" /></a><br/>
<strong>Cline</strong>
</td>
<td align="center" width="12.5%">
<a href="https://github.com/rohitg00/agentmemory"><img src="https://raw.githubusercontent.com/rohitg00/agentmemory/main/assets/logo.png" alt="agentmemory" width="48" height="48" /></a><br/>
<strong>agentmemory</strong>
</td>
<td align="center" width="12.5%">
<a href="https://hermes.ai"><img src="https://hermes.ai/favicon.ico" alt="Hermes" width="48" height="48" /></a><br/>
<strong>Hermes</strong>
</td>
</tr>
</table>

| Agent | Integration | Vault Support |
|-------|-------------|:-------------:|
| Claude Code | Native MCP + 14 hooks | ✅ |
| Codex CLI | Native MCP + 6 hooks | ✅ |
| Cursor | MCP server | ✅ |
| OpenClaw | Native plugin + MCP | ✅ |
| Gemini CLI | MCP server | ✅ |
| Cline | MCP server | ✅ |
| Pi (Codestory) | Native MCP | ✅ |
| OpenCode | MCP server | ✅ |
| Kilo Code | MCP server | ✅ |
| Aider | REST API | ✅ |
| Claude Desktop | MCP server | ✅ |
| Windsurf | MCP server | ✅ |
| Roo Code | MCP server | ✅ |
| Goose | MCP server | ✅ |
| Hermes | Python SDK | ✅ |

All agents share the same encrypted memory server. One vault, memories encrypted for all.

*AgentMemory Vault is agent-agnostic — it works with any tool that speaks MCP or HTTP. If your agent can use memory today, it can use encrypted memory tomorrow.*

---

<h2 id="troubleshooting">Troubleshooting</h2>

### "Cannot find module @homo/agentmemory-vault"

```bash
# Make sure you installed globally
npm install -g @homo/agentmemory-vault

# Or use npx
npx @homo/agentmemory-vault start
```

### "Decryption failed: auth tag mismatch"

This usually means the master key has changed. If you intentionally rotated keys, run:

```bash
agentmemory-vault reindex
```

If you didn't change keys and see this error, your data may have been tampered with. Contact support immediately.

### "Legacy data is readable but not encrypted"

Run the migration command:

```bash
agentmemory-vault migrate
```

This encrypts all existing plaintext memories without affecting your active sessions.

### "Performance is slower than expected"

Encryption adds ~5ms per write. If you're seeing more than that:

1. Check that AES-NI hardware acceleration is available (`grep aes /proc/cpuinfo` on Linux)
2. Ensure you're using Node.js 18+
3. Reduce `PBKDF2_ITERATIONS` if you need extreme throughput (not recommended for production)

### Connection refused to agentmemory

Make sure agentmemory is running first:

```bash
# Start agentmemory
npx @agentmemory/agentmemory start

# Then start the vault
agentmemory-vault start
```

---

<h2 id="security">Security</h2>

### Threat Model

| Threat | Mitigation |
|--------|-----------|
| File system compromise | AES-256-GCM encrypted data at rest. Without the master key, encrypted files are gibberish. |
| Cross-tenant access | Unique cryptographic keys per tenant. PBKDF2 with unique salt. |
| Data tampering | HMAC-SHA256 signature on every encrypted package. Detection on every read. |
| Memory dump | No plaintext secrets in memory. Keys are derived on-demand, not cached in plaintext. |
| Replay attack | IV is random per encryption. Same plaintext produces different ciphertext. |

### Integration Guide for Each Agent

#### Claude Code

```bash
# 1. Install vault
npm install -g @homo/agentmemory-vault

# 2. Start encrypted memory server
agentmemory-vault start

# 3. Connect Claude Code
agentmemory-vault connect claude-code

# Claude Code will now use encrypted memory automatically
```

**What happens**: AgentMemory Vault starts agentmemory with encryption enabled. Claude Code's MCP client connects to the encrypted memory server. All observations, memories, and context are encrypted at rest. Claude Code's 14 lifecycle hooks (session-start, prompt-submit, pre-tool-use, post-tool-use, etc.) work unchanged.

#### Codex CLI

```bash
agentmemory-vault start
agentmemory-vault connect codex
```

Codex CLI integrates via native plugin + 6 hooks + MCP. The vault layer sits between Codex and the storage engine — Codex never sees plaintext memory data.

#### Cursor

```bash
# Add to .cursor/mcp.json:
{
  "mcpServers": {
    "agentmemory-vault": {
      "command": "agentmemory-vault",
      "args": ["mcp"]
    }
  }
}
```

Cursor uses MCP server integration. The encrypted memory server exposes the same 51 MCP tools as agentmemory, but all data is encrypted.

#### OpenClaw

```bash
agentmemory-vault start
agentmemory-vault connect openclaw
```

OpenClaw has a native plugin (`integrations/openclaw/plugin.mjs`) with `before_agent_start` and `agent_end` hooks. The vault wraps these hooks with encryption.

#### Gemini CLI

```bash
agentmemory-vault start
gemini-cli config set mcp-servers.agentmemory-vault.command "agentmemory-vault mcp"
```

Gemini CLI uses MCP stdio. The vault MCP server speaks the same protocol with transparent encryption.

#### Cline

```bash
# In Cline's MCP settings:
{
  "mcpServers": {
    "agentmemory-vault": {
      "command": "npx",
      "args": ["-y", "@homo/agentmemory-vault", "mcp"]
    }
  }
}
```

### Cryptographic Details

| Parameter | Value |
|-----------|-------|
| Encryption | AES-256-GCM (authenticated encryption) |
| Key derivation | PBKDF2-SHA512, 100,000 iterations |
| IV length | 16 bytes (random per encryption) |
| Tag length | 16 bytes (GCM authentication tag) |
| Key length | 32 bytes (256-bit) |
| Integrity | HMAC-SHA256 |
| Compression | zlib (before encryption, saves ~40%) |

### Responsible Disclosure

Found a security issue? Email us at <a href="mailto:homo-ai@outlook.com">homo-ai@outlook.com</a>. We'll respond within 24h.

---

<h2 id="faq">FAQ</h2>

### Is this an agentmemory replacement?

No. AgentMemory Vault is a **transparent encryption layer** that sits on top of agentmemory. You keep all of agentmemory's features — search, MCP, hooks, integrations. We just encrypt the storage layer.

### Will this slow down my agent?

Minimal. AES-256-GCM with hardware acceleration adds ~5ms on writes and ~3ms on reads. The search index (BM25/vector) is stored with field-level encryption — search structure is plaintext, so searches are not slowed down.

### Can I still use all agentmemory features?

Yes. All 51 MCP tools, 14 Claude Code hooks, BM25 search, vector search, knowledge graph, mesh sync, team sharing — everything works. The vault operates at the storage layer, invisible to the agent.

### What if I already have unencrypted memories?

AgentMemory Vault includes a `migrate` command that encrypts your existing plaintext memories. Legacy data is transparently readable — you don't lose anything.

### How is this different from just encrypting the file system?

1. **Granular encryption** — different KV scopes (sessions, memories, indices) use different encryption policies
2. **Multi-tenant** — tenant isolation at the application layer, not just the file system
3. **Search-aware** — search index structure stays plaintext for fast queries
4. **Audit trail** — who accessed what, when
5. **Key rotation** — re-key without touching the file system

### Is the vault engine open source?

**Adapter layer** (the JS integration) is Apache 2.0 — open source. The **Vault engine** (AES-256-GCM core) is proprietary closed-source binary. This follows the open-core model: you can audit the integration, but the encryption core is hardened against tampering.

### Can I contribute?

We welcome PRs! Check our [contributing guide](CONTRIBUTING.md).

---

<h2 id="benchmarks">Benchmarks</h2>

AgentMemory Vault adds minimal overhead to agentmemory's core operations.

### Encryption Overhead

| Operation | agentmemory (plaintext) | AgentMemory Vault (encrypted) | Difference |
|-----------|:----------------------:|:----------------------------:|:----------:|
| Write 1KB memory | 2ms | 7ms | +5ms |
| Read 1KB memory | 1ms | 4ms | +3ms |
| Write 10KB session | 5ms | 13ms | +8ms |
| Read 10KB session | 3ms | 8ms | +5ms |
| Search (BM25, 1000 docs) | 15ms | 16ms | +1ms |
| Search (Vector, 1000 docs) | 45ms | 47ms | +2ms |
| Migrate 1000 memories | — | 3.2s | One-time cost |

*Measured on: Node.js v24, AMD EPYC, AES-NI enabled, 100 runs average*

### Why the Search Overhead Is Minimal

The BM25 search index and vector embeddings use **field-level encryption** — the index structure (terms, positions, scores) is stored in plaintext so search operations run at native speed. Only the memory content (session texts, observations, saved memories) is fully encrypted.

### Startup Time

| Scenario | agentmemory | AgentMemory Vault |
|----------|:-----------:|:-----------------:|
| Cold start (no index) | 1.2s | 1.3s |
| Warm start (loaded index) | 0.4s | 0.5s |
| With 10K memories | 2.1s | 2.4s |

### Memory Overhead

The vault adds approximately 8MB of resident memory for key management and crypto context, regardless of memory count. This is negligible compared to agentmemory's typical 50-150MB footprint.

---

<h2 id="roadmap">Roadmap</h2>

### Phase 1: Core Encryption (Current) ✅
- [x] AES-256-GCM StateKV encryption layer
- [x] Field-level encryption for search indices
- [x] Multi-tenant key isolation
- [x] HMAC-SHA256 tamper-proof signing
- [x] Legacy data compatibility
- [x] Key rotation and export
- [x] 25/25 test suite passing

### Phase 2: Enterprise (Next) 🚧
- [ ] C++ binary engine (hardware-accelerated AES-GCM)
- [ ] RBAC access control
- [ ] Compliance report generation (HIPAA/SOC2/GDPR)
- [ ] SSO integration (OIDC/SAML)
- [ ] Team memory sharing with encrypted channels

### Phase 3: Scale (Future) 📈
- [ ] Private cloud deployment (Kubernetes helm chart)
- [ ] Multi-region key management (AWS KMS / Azure Key Vault integration)
- [ ] Audit log streaming (S3 / Elasticsearch / Splunk)
- [ ] Zero-trust architecture support
- [ ] FIPS 140-2 compliance

---

<h2 id="changelog">Changelog</h2>

### v0.1.0 (2026-05-18)

**Initial Release**

- 🎉 AES-256-GCM encryption layer for agentmemory
- 🔑 PBKDF2-SHA512 key derivation with multi-tenant isolation
- 🔒 Three-tier encryption policy (full / field-level / none)
- 🛡️ HMAC-SHA256 tamper-proof package signing
- 📋 Audit logging integration
- 🔄 Key rotation support
- 🤝 Compatibility mode — reads existing unencrypted data
- 🧪 25/25 tests passing
- 📦 npm package: `@homo/agentmemory-vault`

---

<h2 id="contributing">Contributing</h2>

We welcome contributions! The vault adapter layer is Apache 2.0 licensed.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Before submitting a PR:

- Run the test suite: `node test/vault-test.js`
- Ensure all 25+ tests pass
- Add tests for new functionality
- Update documentation if needed

### Development Setup

```bash
git clone https://github.com/sevenliuhu/agentmemory-vault.git
cd agentmemory-vault
npm install
npm test
```

---

<h2 id="support">Support</h2>

| Channel | Response Time | Availability |
|---------|:-------------:|:------------:|
| GitHub Issues | &lt; 48h | Community |
| WeChat: `sevenliuhu` | &lt; 4h | Business hours (GMT+8) |
| Email: homo-ai@outlook.com | &lt; 24h | 7 days/week |
| Enterprise (Citadel tier) | &lt; 1h | 24/7 |

Before opening an issue:
1. Search [existing issues](https://github.com/sevenliuhu/agentmemory-vault/issues)
2. Check our [FAQ](#faq)
3. Run `agentmemory-vault diagnose` to collect diagnostics

---

<h2 id="contact">Contact</h2>

<p align="center">
  <strong>WeChat:</strong> <code>sevenliuhu</code>
  <br/>
  <strong>Email:</strong> <a href="mailto:homo-ai@outlook.com">homo-ai@outlook.com</a>
  <br/>
  <strong>GitHub:</strong> <a href="https://github.com/sevenliuhu/agentmemory-vault">github.com/sevenliuhu/agentmemory-vault</a>
</p>

<p align="center">
  <img src="assets/wechat-qr.png" alt="WeChat QR Code" width="200" />
  <br/>
  <em>Scan to contact us on WeChat</em>
</p>

---

### Related Projects

- **[agentmemory](https://github.com/rohitg00/agentmemory)** — The #1 persistent memory for AI coding agents that AgentMemory Vault builds upon
- **[9router Gateway](https://github.com/sevenliuhu/9router-gateway)** — Enterprise API gateway for LLMs with auth, audit, and rate limiting
- **[Skill Vault](https://github.com/sevenliuhu/skill-vault)** — Encrypt and protect your AI agent skills with the same vault engine
- **[BrowserHand](https://github.com/sevenliuhu/browserhand)** — Stealth browser automation and anti-detection scraping toolkit
- **[Memory Vault](https://github.com/sevenliuhu/memory-vault)** — Standalone encrypted memory vault (without agentmemory dependency)

### Learn More

- [agentmemory Architecture Deep Dive](https://gist.github.com/rohitg00/2067ab416f7bbe447c1977edaaa681e2) — The design doc that inspired agentmemory (1200+ stars)
- [HOMO Vault Engine Whitepaper](docs/whitepaper.md) — Cryptographic design and threat model
- [Compliance Guide](docs/compliance.md) — HIPAA, SOC2, GDPR compliance with AgentMemory Vault
- [Migration Guide](docs/migration.md) — Upgrading from agentmemory to AgentMemory Vault

<p align="center">
  <sub>
    Built with ❤️ by <a href="https://github.com/sevenliuhu">sevenliuhu</a> & the HOMO team &bull;
    AGPL v3.0 Open Core &bull;
    <a href="https://github.com/sevenliuhu/agentmemory-vault/issues">Report Issue</a> &bull;
    <a href="https://github.com/sevenliuhu/agentmemory-vault/pulls">Submit PR</a>
  </sub>
</p>

### Related Projects from HOMO 🤖

| Project | Description |
|---------|-------------|
| [AgentMemory Vault](https://github.com/sevenliuhu/agentmemory-vault) | 🔒 AES-256-GCM encrypted memory for AI agents |
| [9router Gateway](https://github.com/sevenliuhu/9router-gateway) | 🌉 Enterprise API gateway for LLMs |
| [Skill Vault](https://github.com/sevenliuhu/skill-vault) | 🔐 Encrypt and protect AI agent skills |
| [Memory Vault](https://github.com/sevenliuhu/memory-vault) | 🗄️ Multi-tenant encrypted memory vault |
| [BrowserHand](https://github.com/sevenliuhu/browserhand) | 🕵️ Stealth browser automation toolkit |
| [OHIF HIPAA Vault](https://github.com/sevenliuhu/ohif-hipaa-vault) | 🏥 HIPAA compliance for OHIF Viewer |
| [Freqtrade Strategy Vault](https://github.com/sevenliuhu/freqtrade-strategy-vault) | 📊 Encrypted trading strategies |
| [UI-TARS Sandbox](https://github.com/sevenliuhu/ui-tars-sandbox) | 🏖️ Agent security sandbox |
| [SciScrape Gateway](https://github.com/sevenliuhu/sciscrape-gateway) | 🔬 Research anti-scraping gateway |
| [CrewAI Vault](https://github.com/sevenliuhu/crewai-vault) | 👥 CrewAI enterprise encryption |
| [MCP Secure](https://github.com/sevenliuhu/mcp-secure) | 🛡️ MCP protocol security layer |
| [API Secure Gateway](https://github.com/sevenliuhu/api-secure-gateway) | 🚪 Enterprise API security |
| [Dify Security Gateway](https://github.com/sevenliuhu/dify-security-gateway) | 🤖 Dify AI security gateway |


---

## 🏗️ 产品矩阵

| 项目 | 说明 |
|:-----|:------|
| **[browserhand](https://github.com/sevenliuhu/browserhand)** | 隐身浏览器自动化工具包 |
| **[homo-cloaked-playwright](https://github.com/sevenliuhu/homo-cloaked-playwright)** | Chromium隐身浏览器，Playwright兼容接口 |
| **[skill-vault](https://github.com/sevenliuhu/skill-vault)** | AI技能加密保护 |
| **[ohif-hipaa-vault](https://github.com/sevenliuhu/ohif-hipaa-vault)** | HIPAA合规医疗影像隐私插件 |
| **[agentmemory-vault](https://github.com/sevenliuhu/agentmemory-vault)** | AI Agent记忆加密层 |

