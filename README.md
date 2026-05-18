# AgentMemory Vault :: 加密版 AI 记忆系统 🔒

> AES-256-GCM encryption layer for agentmemory — your AI agent's memories, encrypted by default.
> AES-256-GCM 加密层，为 AI 智能体记忆提供默认加密保护。

---

## 📖 产品介绍 | Product Introduction

AgentMemory Vault 是 [agentmemory](https://github.com/7Bisquay/agentmemory) (11K⭐) 的加密增强版。它让 AI 智能体的记忆存储从无保护的明文 JSON 升级为 **AES-256-GCM 加密**，同时保持一行代码接入的极简体验。

AgentMemory Vault is an encrypted enhancement of [agentmemory](https://github.com/7Bisquay/agentmemory) (11K⭐). It upgrades your AI agent's memory storage from unprotected plaintext JSON to **AES-256-GCM encryption**, while maintaining a single-line integration.

### 适用场景 | Use Cases

| 中文 | English |
|------|---------|
| 🏦 金融数据和 API 密钥 | Financial data and API keys |
| 🏥 患者/客户信息 (HIPAA) | Patient/client information (HIPAA) |
| ⚖️ 法律文件 (律师-客户特权) | Legal documents (attorney-client privilege) |
| 🔬 商业源代码和商业秘密 | Proprietary source code and trade secrets |

### 工作原理 | How It Works

```
Before: agentmemory → iii-engine → plaintext .mem files ❌
After:  agentmemory → AgentMemory Vault → AES-256-GCM → encrypted .mem files ✅
```

一行代码接入 | One-line integration:

```js
import { AgentMemoryVault } from '@homo/agentmemory-vault';

const vault = new AgentMemoryVault({ password: process.env.VAULT_KEY });
vault.attach(stateKV); // ← 一切自动加密 | everything is now encrypted
```

---

## 💰 定价方案 | Pricing Plans

| 版本 / Plan | 价格 / Price | 加密引擎 | 并发限制 | 企业支持 | SaaS API |
|-------------|-------------|---------|---------|---------|---------|
| 🆓 **社区版** Community | **免费** Free | AES-128-GCM | 1 session | ❌ | ❌ |
| 🚀 **专业版** Pro | **¥199/月** $29/mo | AES-256-GCM | 10 sessions | ❌ | ❌ |
| 🏢 **企业版** Enterprise | **¥999/月** $149/mo | AES-256-GCM | 100 sessions | ✅ 5×8 工单 | ❌ |
| ☁️ **云服务版** Cloud | **¥2,999/月** $449/mo | AES-256-GCM + HSM | 不限 | ✅ 7×24 专属 | ✅ 100K req/mo |
| 🏰 **私有部署版** Private | **定制报价** Custom | AES-256-GCM + 国密SM4 | 按需 | ✅ 7×24 驻场 | ✅ 按需 |

> 所有价格含税。年付享 8 折优惠。
> All prices include tax. Annual billing at 20% discount.

---

## 📞 联系方式 | Contact Us

| 渠道 / Channel | 信息 / Info |
|---------------|-------------|
| 📧 **Email** | [homo-ai@outlook.com](mailto:homo-ai@outlook.com) |
| 💬 **微信 / WeChat** | `sevenliuhu` |

![微信](/assets/wechat-qr.png)

> 扫码添加微信，获取产品演示和技术支持。
> Scan the QR code to add us on WeChat for demos and support.

---

## 🛒 购买流程 | Purchase Process

### 中文版

1. **选择版本** — 查阅上方定价表，选择适合的方案
2. **添加微信** — 扫码或搜索 `sevenliuhu` 添加联系人
3. **沟通确认** — 我们会了解您的使用场景并推荐最佳配置
4. **付款开票** — 支持微信支付 / 支付宝 / 对公转账，提供正规发票
5. **获取授权** — 付款后 1 个工作日内发送 License Key 和部署文档
6. **开始使用** — 一行代码接入，即刻享受加密记忆保护

### English

1. **Choose a Plan** — Review the pricing table above and select your tier
2. **Add on WeChat** — Scan QR code or search `sevenliuhu`
3. **Confirm Requirements** — We'll discuss your use case and recommend the best setup
4. **Make Payment** — WeChat Pay / Alipay / Wire transfer accepted; invoices provided
5. **Receive License** — License key and deployment docs sent within 1 business day
6. **Start Using** — One-line integration, instant encrypted memory protection

---

## 📄 开源协议 | License

本项目基于 **GNU Affero General Public License v3.0 (AGPL-3.0)** 开源。

This project is open-sourced under **GNU Affero General Public License v3.0 (AGPL-3.0)**.

- **社区版**: 完全免费，遵守 AGPL v3
- **商业版本**: 如需闭源使用或商业集成，请购买付费版本
- Community Edition: Fully free under AGPL v3
- Commercial use: Purchase a paid license for proprietary integration

[查看完整许可协议](./LICENSE)

---

*AgentMemory Vault — Because your AI agent's secrets should stay secrets. 🤫*
