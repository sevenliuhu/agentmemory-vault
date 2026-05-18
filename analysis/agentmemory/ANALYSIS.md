# agentmemory (v0.9.18) 深度分析报告

> 项目地址：https://github.com/rohitg00/agentmemory
> 包名：`@agentmemory/agentmemory`
> 许可：Apache-2.0

---

## 一、项目概览

agentmemory 是一个为 AI 编程智能体（Claude Code、OpenClaw、Cline 等）提供**持久化记忆**的 TypeScript 服务。它基于 `iii-engine` 的三个原语（state store、stream store、function triggers）构建，通过 MCP 协议或 REST API 与智能体系统集成。

### 核心能力

| 能力 | 说明 |
|------|------|
| 观察捕获 | 自动记录智能体的每个操作（读/写文件、执行命令、对话等） |
| 混合搜索 | BM25 + 向量嵌入（可选）的混合检索 |
| 记忆持久化 | 通过 `mem::remember` 保存结构化记忆 |
| 会话管理 | 跨会话的上下文注入 |
| 知识图谱 | 从记忆中提取实体关系（可选） |
| 记忆分层 | 4层：工作记忆 → 情景记忆 → 语义记忆 → 程序记忆 |
| MCP服务 | 标准的 MCP (Model Context Protocol) 服务 |

---

## 二、记忆存储架构

### 2.1 底层引擎：iii-engine

agentmemory **不自带数据库**，它依赖 `iii-engine` 作为底层存储引擎。`iii-engine` 是一个分布式 KV + Stream 引擎，通过 WebSocket 连接。

核心存储抽象是 `StateKV`（`src/state/kv.ts`）：

```typescript
export class StateKV {
  constructor(private sdk: ISdk) {}
  async get<T>(scope: string, key: string): Promise<T | null>
  async set<T>(scope: string, key: string, value: T): Promise<T>
  async delete(scope: string, key: string): Promise<void>
  async list<T>(scope: string): Promise<T[]>
  async update<T>(scope: string, key: string, ops: Array<...>): Promise<T>
}
```

所有数据通过 `sdk.trigger()` 调用 `iii-engine` 的 state 原语操作，底层可能是嵌入式 RocksDB 或 LevelDB。

### 2.2 KV Schema（`src/state/schema.ts`）

```
┌─────────────────────────────────┐
│ KV Scope Map                    │
├─────────────────────────────────┤
│ mem:sessions        → Session[] │  // 会话列表
│ mem:obs:{sessionId} → []        │  // 每个会话的观察记录
│ mem:memories        → Memory[]  │  // 人工保存的记忆
│ mem:summaries       → []        │  // 会话摘要
│ mem:config          → {}        │  // 配置
│ mem:metrics         → []        │  // 函数指标
│ mem:health          → {}        │  // 健康快照
│ mem:emb:{obsId}     → []        │  // 嵌入向量
│ mem:index:bm25      → {}        │  // BM25 索引持久化
│ mem:graph:nodes     → []        │  // 知识图谱节点
│ mem:graph:edges     → []        │  // 知识图谱边
│ mem:semantic        → []        │  // 语义记忆
│ mem:procedural      → []        │  // 程序记忆
│ mem:actions         → []        │  // 动作
│ mem:audit           → []        │  // 审计日志
│ ...更多             │           │
└─────────────────────────────────┘
```

共约 **40+ 个 KV scope**，涵盖会话、观察、记忆、图谱、动作、信号、检查点等。

### 2.3 内存中的搜索索引

**BM25 倒排索引**（`src/state/search-index.ts`）：
- 纯内存实现
- 自带词干提取（`stemmer.ts`）、同义词扩展（`synonyms.ts`）、CJK 分词（`cjk-segmenter.ts`）
- 支持前缀匹配（术语级别的模糊搜索）
- 持久化：序列化为 JSON 字符串存入 iii-engine KV
- 加载：启动时从 KV 反序列化恢复

**向量索引**（`src/state/vector-index.ts`）：
- 纯内存实现，`Map<string, {embedding: Float32Array, sessionId: string}>`
- 余弦相似度搜索（逐一比对，无 ANN 加速）
- 嵌入存储为 Base64 编码的 Float32Array
- 持久化：同上，JSON 序列化到 iii-engine KV
- 维度守卫：启动时检查持久化索引的维度是否匹配当前嵌入提供者

### 2.4 索引持久化（`src/state/index-persistence.ts`）

```
写入流程：
1. BM25/向量索引发生变化
2. IndexPersistence.scheduleSave() 设置 5s 防抖定时器
3. 定时器触发，序列化索引
4. 写入 iii-engine KV: mem:index:bm25/data + mem:index:bm25/vectors

加载流程：
1. 启动时从 iii-engine KV 加载序列化索引
2. 验证向量维度一致性
3. 若 BM25 为空（首次启动），从 KV 中重建索引
4. 同时回填记忆到 BM25（<0.9.5 版本升级兼容）
```

### 2.5 数据生命周期

```
观察记录 ──→ 压缩 ──→ BM25索引
                   ──→ 向量索引（可选）
                   ──→ 知识图谱（可选）
                   ──→ 会话摘要
                   ──→ 记忆保存（人工/自动）
                         ──→ 语义记忆（可选）
                         ──→ 程序记忆（可选）
                         ──→ 晶体/教训（可选）
```

---

## 三、调用流程

### 3.1 完整的调用路径

```
┌─────────────────────────────────────────────────────┐
│                   智能体侧                            │
│                                                      │
│ Claude Code / OpenClaw / Cline / ...                 │
│    │                                                  │
│    ├─[MCP stdio]── @agentmemory/mcp 进程              │
│    │                  │                                │
│    │                  ├─[HTTP]── agentmemory Server    │
│    │                  │            (:3111 REST API)    │
│    │                  │            │                    │
│    │                  └─[local]── InMemoryKV            │
│    │                             (standalone.json)     │
│    │                                                    │
│    └─[HTTP]── agentmemory Server 直接                    │
│               (:3111 REST API)                           │
└─────────────────────────────────────────────────────┘
```

### 3.2 MCP Stdio 流程（默认）

**工具包**（`packages/mcp/bin.mjs`）：
```bash
# 启动后，通过 stdio 与智能体通信
@agentmemory/mcp
```

**两种模式**（`standalone.ts`）：

1. **代理模式**（proxy）：`AGENTMEMORY_URL` 指向运行的 agentmemory 服务
   - 发送 HTTP 请求到 `/agentmemory/mcp/call`
   - 支持全部 51 个工具（通过 server 端完整 MCP）
   
2. **本地模式**（local）：纯内存 KV
   - 仅支持 7 个核心工具（memory_save, memory_recall, memory_smart_search, memory_sessions, memory_export, memory_audit, memory_governance_delete）
   - 数据持久化到 `~/.agentmemory/standalone.json`
   - 文本搜索使用 JavaScript 的 `Array.filter` + `String.includes`（非 BM25！）

**启动探测**：
```
1. 尝试连接 AGENTMEMORY_URL (默认 http://localhost:3111/agentmemory/livez)
2. 成功 → 代理模式
3. 失败 → 本地模式 (InMemoryKV)
```

### 3.3 完整服务模式（带 iii-engine）

```bash
npx @agentmemory/agentmemory start
```

**启动过程**（`src/index.ts`）：
```
1. 加载配置（~/.agentmemory/.env）
2. 检测 LLM 提供者（API 密钥优先级链）
3. 创建嵌入提供者（BM25-only 模式或混合模式）
4. 注册 iii-sdk Worker（连接 iii-engine WebSocket）
5. 创建 StateKV
6. 注册 ~50 个函数（观察、搜索、记忆、图谱、动作等）
7. 创建混合搜索器（HybridSearch = BM25 + Vector + Graph）
8. 加载持久化索引
9. 启动 REST API（:3111）
10. 启动 Streams（:3112）
11. 启动 Viewer（:3113）
```

### 3.4 REST API 接口（`src/triggers/api.ts`）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/agentmemory/livez` | GET | 存活检查 |
| `/agentmemory/health` | GET | 健康检查 |
| `/agentmemory/config/flags` | GET | 配置标志 |
| `/agentmemory/observe` | POST | 提交观察 |
| `/agentmemory/search` | POST | 搜索记忆 |
| `/agentmemory/context` | POST | 获取会话上下文 |
| `/agentmemory/session/start` | POST | 开始会话 |
| `/agentmemory/session/end` | POST | 结束会话 |
| `/agentmemory/remember` | POST | 保存记忆 |
| `/agentmemory/smart-search` | POST | 混合搜索 |
| `/agentmemory/compress-file` | POST | 压缩文件 |
| `/agentmemory/replay/*` | GET/POST | 回放系统 |
| `/agentmemory/export` | GET | 导出数据 |
| `/agentmemory/mcp/tools` | GET | MCP 工具列表 |
| `/agentmemory/mcp/call` | POST | MCP 工具调用 |
| `/agentmemory/mesh/*` | POST | Mesh 同步 |
| `/agentmemory/governance/*` | POST/DELETE | 治理操作 |
| `/agentmemory/audit` | GET | 审计查询 |
| 全部共约 100+ 端点 | | |

### 3.5 MCP 工具（`src/mcp/server.ts` 中的 switch）

| 工具名 | 说明 |
|--------|------|
| `memory_recall` | 搜索记忆（支持 format/token_budget） |
| `memory_save` | 保存记忆 |
| `memory_smart_search` | 混合搜索（BM25+向量+图谱） |
| `memory_sessions` | 列出会话 |
| `memory_export` | 导出全部数据 |
| `memory_audit` | 查询审计日志 |
| `memory_governance_delete` | 删除记忆 |
| `memory_patterns` | 模式识别 |
| `memory_profile` | 项目画像 |
| `memory_timeline` | 时间线查询 |
| `memory_relations` | 记忆关系 |
| `memory_file_history` | 文件历史 |
| `memory_compress_file` | 文件压缩 |
| `memory_vision_search` | 视觉搜索 |
| `memory_graph_query` | 图谱查询 |
| `memory_consolidate` | 主动合并 |
| `memory_claude_bridge_sync` | Claude 桥同步 |
| `memory_team_share` / `memory_team_feed` | 团队分享 |

---

## 四、加密现状

### 4.1 传输安全

| 场景 | 安全措施 | 风险 |
|------|---------|------|
| REST API | Bearer Token 认证 (`AGENTMEMORY_SECRET`) | HTTP 明文传输时 Token 可被嗅探 |
| REST API | `timingSafeCompare` 防时序攻击 | 已做 |
| Viewer CSP | `script-src 'nonce-...'` + 严格的 CSP | 已做 |
| 服务间通信 | 无 TLS | **默认无 HTTPS** |
| OpenClaw 集成 | 有 `usesPlaintextBearerAuth` 守卫 + `AGENTMEMORY_REQUIRE_HTTPS` | 仅在主动配置时生效 |

### 4.2 数据存储

| 数据类型 | 加密 |
|----------|-----|
| iii-engine KV 中的数据 | **❌ 不加密** — 全部为明文 JSON |
| BM25/向量索引持久化 | **❌ 不加密** — 存入 KV 的纯文本 |
| 观察记录中的 API 密钥 | **✅ 运行时脱敏** — `privacy.ts` 用正则 `[REDACTED_SECRET]` 替换 |
| 用户标记的隐私内容 | **✅ 运行时脱敏** — `<private>...</private>` 标签被替换为 `[REDACTED]` |

### 4.3 密钥管理

| 密钥 | 存储位置 | 管理方式 |
|------|---------|---------|
| `AGENTMEMORY_SECRET` | `~/.agentmemory/.env` 或环境变量 | 用户手动设置，无自动轮换 |
| LLM API 密钥 | `~/.agentmemory/.env` | 用户手动设置，启动时加载到内存 |
| 嵌入 API 密钥 | `~/.agentmemory/.env` | 同上 |
| Mesh 同步 Token | 使用同一个 `AGENTMEMORY_SECRET` | Bearer Token 传输 |

### 4.4 安全结论

> **agentmemory 没有对存储数据实施任何加密。**
>
> - `auth.ts` 仅提供认证（HMAC-SHA256 时序安全比较 + Viewer nonce）
> - `privacy.ts` 仅提供运行时脱敏（正向匹配替换，不保证彻底清除）
> - 所有数据以明文 JSON 形式存储在 iii-engine 的 state store 中
> - REST API 默认在 localhost HTTP 上运行，无 TLS
> - 暴露到外网时，需用户自行配置反向代理（如 nginx + Let's Encrypt）

---

## 五、扩展机制

### 5.1 提供者体系

**LLM 提供者**（`src/providers/`）：

| 提供者 | 实现文件 | 备注 |
|--------|---------|------|
| Anthropic | `anthropic.ts` | 使用官方 SDK |
| Gemini | → 适配为 OpenRouter 兼容 | 用 OpenAI 兼容端点 |
| OpenRouter | `openrouter.ts` | 兼容路径 |
| MiniMax | `minimax.ts` | 原生 fetch |
| OpenAI | `openai.ts` | 官方 SDK |
| Agent SDK | `agent-sdk.ts` | Claude Agent SDK 子会话 |
| Noop | `noop.ts` | 无操作回退 |
| **Fallback** | `fallback-chain.ts` | 按序回退链 |
| **Resilient** | `resilient.ts` | 带断路器包装 |

**嵌入提供者**（`src/providers/embedding/`）：

| 提供者 | 维度 | 备注 |
|--------|------|------|
| Gemini | 768 | 文本嵌入 |
| OpenAI | 1536 | text-embedding-3-small |
| Voyage | 1024 | 代码优化嵌入 |
| Cohere | 1024 | 通用嵌入 |
| OpenRouter | 可变 | 路由到第三方 |
| Local | 384 | Xenova/all-MiniLM-L6-v2 |
| CLIP | 512 | 图像嵌入 |

### 5.2 插件集成

**已实现集成**：

| 平台 | 集成方式 | 位置 |
|------|---------|------|
| **OpenClaw** | MCP 回调 + `before_agent_start`/`agent_end` hooks | `integrations/openclaw/` |
| **Claude Code** | MCP stdio + CLI 钩子 | `plugin/scripts/` 14个钩子 |
| **Cline/Cursor** | MCP stdio | `src/cli/connect/` |
| **Gemini CLI** | MCP stdio | `src/cli/connect/gemini-cli.ts` |
| **Pi (Codestory)** | MCP stdio | `integrations/pi/` |
| **Hermes** | Python SDK | `integrations/hermes/` |
| **Codex** | MCP + 钩子 | `plugin/scripts/` |

**Claude Code 钩子系统**（14个生命周期挂钩）：

```
session-start → prompt-submit → pre-tool-use → post-tool-use
                ↓                                ↓
           post-tool-failure                pre-compact
                ↓                                ↓
           subagent-start                   subagent-stop
                ↓                                ↓
           notification                     task-completed
                ↓                                ↓
           session-end ←─ stop ←───────────
```

### 5.3 部署扩展

| 方式 | 文件 |
|------|------|
| Docker Compose | `docker-compose.yml` |
| Coolify | `deploy/coolify/` |
| Fly.io | `deploy/fly/` |
| Railway | `deploy/railway/` |
| Render | `deploy/render/` |

### 5.4 功能标志驱动的可扩展性

几乎所有高级功能都是通过环境变量开关控制的：

```typescript
// 示例功能标志
GRAPH_EXTRACTION_ENABLED   // 知识图谱提取
CONSOLIDATION_ENABLED      // 4层记忆合并
AGENTMEMORY_AUTO_COMPRESS  // LLM压缩（默认关）
AGENTMEMORY_INJECT_CONTEXT // 上下文注入（默认关）
STANDALONE_MCP             // MCP standalone模式
TEAM_MODE                  // 团队共享模式
```

这种设计使得 agentmemory 可以从「零配置 BM25 纯文本搜索」逐步升级到「完整 LLM 驱动的知识图谱 + 向量搜索 + 4层记忆系统」。

### 5.5 搜索扩展路径

```
BM25 only (默认)
   → 加嵌入提供者 → BM25 + 向量混合搜索
   → 启用图谱 → BM25 + 向量 + 图谱三级搜索
   → 启用合并 → 语义/程序记忆层
   → 启用反思 → 教训/洞察抽取
```

---

## 六、综合评价

### 优点

1. **架构清晰**：所有数据通过统一的 StateKV 抽象操作，iii-engine 提供分布式存储能力
2. **渐进式能力**：从零配置到全功能，用户根据需求逐步开启功能
3. **MCP 优先**：原生支持 MCP 协议，可被任何 MCP 客户端使用
4. **双模设计**：standalone MCP shim 可以在没有完整 iii-engine 时运行
5. **丰富的集成**：覆盖 Claude Code、OpenClaw、Cline、Cursor 等主流平台
6. **BM25 实现完整**：自带词干提取、同义词、CJK 分词、前缀匹配
7. **性能优化**：索引防抖、错误日志节流、断路器模式、fallback 链

### 缺点 / 风险

1. **❌ 无数据加密**：所有数据以明文 JSON 存储，无静态加密
2. **❌ 默认无 HTTPS**：REST API 运行在 HTTP 上，需用户自行配置 TLS
3. **❌ 强依赖 iii-engine**：完整模式必须运行 iii-engine，引入额外复杂度
4. **向量搜索性能堪忧**：向量索引使用暴力余弦相似度比对（`O(n)`），非 ANN 方案
5. **standalone 模式搜索弱**：使用 `Array.filter` + `String.includes`，不是 BM25
6. **嵌入式依赖多**：依赖 `iii-sdk`、`@anthropic-ai/sdk`、`@anthropic-ai/claude-agent-sdk` 等
7. **文档质量一般**：`DESIGN.md` 内容与项目无关（实际上是兰博基尼的设计系统文档）

### 与同类项目对比

| 特性 | agentmemory | MemoryPlugin (OpenClaw) | mem0 |
|------|-------------|------------------------|------|
| 底层引擎 | iii-engine | 无（文件系统） | 向量数据库（多种） |
| 搜索方式 | BM25 + 向量（可选） | 无 | 向量搜索 |
| MCP 支持 | ✅ 原生 | ❌ | ✅ |
| 加密存储 | ❌ | 文件级 | 取决于后端 |
| 去中心化 | ✅ 有 Mesh 同步 | ❌ | ❌ |
| 代码适配度 | 专为 AI Coding Agent 设计 | OpenClaw 原生 | 通用型 |
| 知识图谱 | ✅ 可选 | ❌ | ❌ |
| 部署复杂度 | 高（需 iii-engine） | 低 | 中 |

---

## 附：分析源文件清单

分析中参考的关键源码文件：

| 文件 | 大小 | 作用 |
|------|------|------|
| `src/index.ts` | ~22KB | 主入口，注册所有函数 |
| `src/config.ts` | ~12KB | 配置加载 |
| `src/types.ts` | ~19KB | 全部类型定义 |
| `src/auth.ts` | ~1KB | 认证 |
| `src/state/kv.ts` | ~1KB | StateKV 封装 |
| `src/state/schema.ts` | ~3KB | KV scope 定义 + ID生成 |
| `src/state/search-index.ts` | ~7KB | BM25搜索索引 |
| `src/state/vector-index.ts` | ~4KB | 向量索引 |
| `src/state/index-persistence.ts` | ~3KB | 索引持久化 |
| `src/mcp/server.ts` | ~60KB | MCP REST端点 |
| `src/mcp/standalone.ts` | ~14KB | MCP standalone shim |
| `src/mcp/in-memory-kv.ts` | ~2KB | 内存KV（JSON文件持久化） |
| `src/mcp/tools-registry.ts` | ~29KB | 51个工具定义 |
| `src/triggers/api.ts` | ~99KB | REST API定义 |
| `src/functions/privacy.ts` | ~1KB | 隐私脱敏 |
| `src/functions/remember.ts` | ~5KB | 记忆保存 |
| `src/functions/search.ts` | ~10KB | 搜索函数 |
| `src/functions/mesh.ts` | ~16KB | P2P同步 |
| `src/providers/index.ts` | ~3KB | LLM提供者工厂 |
| `src/providers/embedding/index.ts` | ~3KB | 嵌入提供者工厂 |
| `integrations/openclaw/plugin.mjs` | ~7KB | OpenClaw插件 |
| `.env.example` | ~10KB | 全部配置项说明 |
| `package.json` | ~2KB | 项目配置 |
