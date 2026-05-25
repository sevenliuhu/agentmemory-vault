<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,4&height=200&section=header&text=AGENTMEMORY%20VAULT&fontSize=55&fontColor=ffffff" width="100%">
</p>

<p align="center">
  <a href="#quickstart"><b>Quickstart</b></a>
   ·
  <a href="https://github.com/sevenliuhu/agentmemory-vault"><b>Docs</b></a>
   ·
  <a href="https://github.com/sevenliuhu/Homo-Ai"><b>Website</b></a>
   ·
  <a href="mailto:16208204@qq.com"><b>Contact</b></a>
</p>

<p align="center">
  <a href="https://github.com/sevenliuhu/agentmemory-vault/stargazers">
    <img src="https://img.shields.io/github/stars/sevenliuhu/agentmemory-vault?style=social" alt="stars">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green" alt="license">
  </a>
  <a href="https://github.com/sevenliuhu/agentmemory-vault/releases">
    <img src="https://img.shields.io/github/v/release/sevenliuhu/agentmemory-vault" alt="release">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="prs">
  </a>
</p>

# 🔒 AgentMemory Vault

**AES-256-GCM加密记忆层 — AI Agent的企业级加密存储方案.**

为agentmemory提供AES-256-GCM加密层，支持字段级加密、多租户密钥隔离、密钥轮换及RBAC权限管控。通过25项加密测试，适用于企业级AI记忆保护。

## ✨ Features

- **🔐 AES-256-GCM加密** — 硬件级加密，通过25项测试
- **🔑 多租户密钥隔离** — 每个租户独立派生密钥
- **🔄 密钥轮换** — 支持周期性密钥轮换，不中断服务
- **👮 RBAC权限管控** — 基于角色的细粒度访问控制
- **📝 全流程审计日志** — 所有操作不可篡改
- **🔗 零知识证明兼容** — 支持ZKP扩展（2026 Q3）

## ⚡ Quick Start

```bash
npm install agentmemory-vault
```

```javascript
const { Encryptor, KeyManager } = require('agentmemory-vault');

const km = new KeyManager('your-master-key');
const enc = new Encryptor(km);

// 加密
const encrypted = enc.encrypt('sensitive data', 'tenant-1');

// 解密
const decrypted = enc.decrypt(encrypted, 'tenant-1');
console.log(decrypted); // 'sensitive data'
```

## 🔬 Benchmark

| 操作 | 延迟 | 安全级别 |
|:----|:----:|:--------:|
| AES-256-GCM加密 | <5ms | 军事级 |
| 多租户密钥派生 | <1ms | 硬件隔离 |
| RBAC权限检查 | <0.5ms | 角色级 |
| 审计日志写入 | <2ms | 不可篡改 |

## 🏢 For Enterprise

| 特性 | 免费版 | 企业版 |
|:----|:-----:|:------:|
| AES-256-GCM | ✅ | ✅ |
| 多租户隔离 | ❌ | ✅ |
| 密钥轮换 | ❌ | ✅ |
| RBAC权限 | ❌ | ✅ |
| ZKP扩展 | ❌ | ✅ |
| 私有部署 | ❌ | ✅ |
| **价格** | **免费** | **联系报价** |

## 📞 Contact & Business

**Author:** 刘虎 (Seven Liu Hu)  
**Email:** [16208204@qq.com](mailto:16208204@qq.com)  
**GitHub:** [sevenliuhu](https://github.com/sevenliuhu)

> 企业授权 / 定制开发 / 私有部署 — 欢迎邮件咨询

## 🔗 Related HOMO Projects

- [homo-mempalace](https://github.com/sevenliuhu/homo-mempalace) — 本地优先AI记忆系统
- [skill-vault](https://github.com/sevenliuhu/skill-vault) — AI技能加密保护
- [9router-gateway](https://github.com/sevenliuhu/9router-gateway) — LLM API企业网关
- [Homo-Ai](https://github.com/sevenliuhu/Homo-Ai) — HOMO智能体操作系统

## 📄 License

MIT License (Open Core) — 基础功能开源，企业版联系授权
