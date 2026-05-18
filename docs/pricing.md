# AgentMemory Vault — 产品方案与定价

## 一、产品定位

> 在 agentmemory 的 StateKV 层注入 AES-256-GCM 加密，让 AI Agent 的记忆数据实现企业级安全。

**一句话**: 开源 agentmemory + HOMO 闭源加密引擎 = 企业级加密记忆

**卡脖子点**: agentmemory 11K⭐、5300+/周增长，但所有记忆数据明文存储。企业客户（金融/医疗/法律）不敢用。

## 二、技术架构

```
AI Agent (Claude Code / Cursor / Codex / ...)
    │
    ├─[MCP stdio]── @agentmemory/mcp ──→ AgentMemory Vault
    │                                           │
    │                                     EncryptedStateKV (Proxy)
    │                                           │
    │                                     iii-engine StateKV
    │                                      (写入加密 .mem 文件)
    │
    └─[直接API]── agentmemory REST API ──→ AgentMemory Vault
                                                     │
                                              nginx + HTTPS + Let's Encrypt
```

### 加密策略三层

| 层级 | 范围 | 方法 | 对性能影响 |
|------|------|------|:----------:|
| 🔒 完全加密 | 会话/记忆/观察/审计等敏感数据 | 整体 AES-256-GCM 加密值 | 写+5ms，读+3ms |
| 🔑 字段级 | BM25/向量索引 | 索引结构明文，敏感字段加密 | 写+2ms，读+1ms |
| 🟢 明证 | 健康检查/指标/信号 | 不加密 | 0 |

## 三、五版本定价（参照 HIPAA Vault 模板）

| 版本 | 价格 | 核心能力 | 目标客户 |
|:----:|:----:|---------|:--------:|
| 🌱 **Sprout** | **Free** | 基础加密（AES-256-GCM）+ 密钥管理 + CLI工具 | 个人开发者试用 |
| 🔑 **Key** | **$9.9/月** | Sprout + 多租户隔离 + 密钥轮换 + 审计日志 | 自由职业者/小团队 |
| 🛡️ **Shield** | **$29.9/月** | Key + 企业合规（RBAC + 访问控制 + 合规报告） | 中型团队/创业公司 |
| 🏢 **Fortress** | **$99.9/月** | Shield + SSO集成 + 团队共享 + 多集群 + 审计导出 | 企业/金融机构 |
| 👑 **Citadel** | **$299.9/月** | Fortress + 私有化部署 + 专属密钥管理 + 99.99% SLA + 专属支持 | 医疗/政府/合规严苛行业 |

### 对比 HIPAA Vault 定价逻辑

| 维度 | HIPAA Vault | AgentMemory Vault | 调整原因 |
|:----:|:-----------:|:-----------------:|---------|
| 免费版 | $0 基本查看 | **$0 Sprout** | 市场推广需要 |
| 基础版 | $199/月 | **$9.9/月** | agentmemory 个人开发者为主，门槛要低 |
| 中端 | $499/月 | **$29.9/月** | 中小团队负担得起 |
| 高端 | $999/月 | **$99.9/月** | 相比医疗，AI Agent 记忆加密支付意愿稍低 |
| 旗舰 | $1,999/月 | **$299.9/月** | 私有化部署溢价 |

### 年付优惠

| 版本 | 月付 | 年付 | 省 |
|:----:|:----:|:----:|:-:|
| Sprout | $0 | $0 | — |
| Key | $9.9/月 | $99/年 ($8.25/月) | 17% |
| Shield | $29.9/月 | $299/年 ($24.92/月) | 17% |
| Fortress | $99.9/月 | $999/年 ($83.25/月) | 17% |
| Citadel | $299.9/月 | $2,999/年 ($249.92/月) | 17% |

## 四、GG 推广策略（基于宣发分析）

### 第一步：资产上 GitHub（本周）
```
HOMO-AI-HQ/agentmemory-vault  ← 开源适配器层（Apache-2.0）
HOMO-AI-HQ/agentmemory-vault-engine  ← 闭源引擎（仅发版二进制）
```

### 第二步：README 抄袭最佳实践
- **标题**: "#1 Encrypted Memory Layer for AI Coding Agents — AES-256-GCM, Zero Config"
- **Banner**: 演示动图（加密前明文 vs 加密后密文）
- **数据徽章**: 6个（加密速度、支持agent数、零配置、企业合规数等）
- **Hook**: "Your AI agent's memories should be yours. Not your cloud provider's."
- **竞品对比**: agentmemory vs AgentMemory Vault（加密/团队/合规）

### 第三步：社区触达
- agentmemory GitHub Issues 中评论「有企业加密需求吗？」
- Reddit r/LocalLLaMA + r/ClaudeAI 发帖
- Hacker News Show HN

## 五、开发计划

| 阶段 | 内容 | 预计工时 |
|:----:|------|:--------:|
| P0 | StateKV 加密适配器（已开发） | ✅ |
| P1 | 闭源引擎（C++ 重写 vault-kv.js） | 16h |
| P2 | 安装脚本 + CLI 工具 | 4h |
| P3 | License 验证集成 | 4h |
| P4 | GitHub 开源仓库 + README | 2h |
| P5 | npm 发布 + Docker 镜像 | 2h |
| P6 | 多租户 + RBAC | 12h |
| P7 | SSO + 审计导出 | 8h |

**总计**: ~48h 内可发布 MVP
