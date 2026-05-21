/* Copyright (c) 2026 HOMO AI. Proprietary. License required. Contact: 16208204@qq.com */
/**
 * AgentMemory Vault — Encrypted KV Layer for agentmemory
 * 
 * Injection point: StateKV layer (src/state/kv.ts)
 * Wraps agentmemory's get/set/list/delete with AES-256-GCM encryption
 * 
 * 闭源C++二进制交付（原型为Node.js，后续重写为C++引擎）
 * 
 * Usage:
 *   import { AgentMemoryVault } from '@homo/agentmemory-vault';
 *   const vault = new AgentMemoryVault({ masterKey: process.env.VAULT_KEY });
 *   vault.attach(); // 注入到 agentmemory 的 StateKV
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// =====================================================
// 配置常量
// =====================================================

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;
const KEY_STORE_DIR = process.env.AMV_KEY_STORE || path.join(process.env.HOME || '/root', '.amvault');
const CONFIG_FILE = path.join(KEY_STORE_DIR, 'config.json');

/**
 * 可搜索的加密范围
 * 
 * 某些 KV scope 需要可搜索（BM25/向量索引），不加密内容只加密敏感字段
 * 不需要搜索的 KV scope 整体加密
 */
const ENCRYPTION_POLICY = {
  // 🔒 完全加密（不可搜索）
  full: [
    'mem:sessions',        // 会话内容
    'mem:memories',        // 记忆内容
    'mem:summaries',       // 摘要
    'mem:obs:',            // 观察记录（每个会话的）
    'mem:actions',         // 动作记录
    'mem:audit',           // 审计日志
    'mem:semantic',        // 语义记忆
    'mem:procedural',      // 程序记忆
    'mem:graph:nodes',     // 知识图谱节点
    'mem:graph:edges',     // 知识图谱边
    'mem:lessons',         // 教训/洞察
    'mem:config',          // 配置（含 API 密钥等敏感信息）
  ],
  // 🔑 字段级加密（可搜索，但敏感字段单独加密）
  field: [
    'mem:index:bm25',      // BM25索引 - 搜索结构明文，内容加密
    'mem:emb:',            // 嵌入向量 - 向量数据明文，元数据加密
  ],
  // 🟢 不加密（纯索引/元数据/健康检查）
  none: [
    'mem:health',          // 健康快照
    'mem:metrics',         // 函数指标
    'mem:signals',         // 信号
  ]
};

// =====================================================
// 密钥管理
// =====================================================

class KeyManager {
  constructor(masterKey) {
    this.masterKey = masterKey || crypto.randomBytes(32).toString('hex');
    this.tenantKeys = new Map();
    fs.mkdirSync(KEY_STORE_DIR, { recursive: true });
    this._loadConfig();
  }

  _loadConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
      try {
        this.config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      } catch {
        this.config = { created: new Date().toISOString(), keyRotation: 0 };
      }
    } else {
      this.config = { created: new Date().toISOString(), keyRotation: 0 };
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2));
    }
  }

  deriveTenantKey(tenantId) {
    if (this.tenantKeys.has(tenantId)) return this.tenantKeys.get(tenantId);
    const salt = crypto.createHash('sha256').update(tenantId).digest();
    const key = crypto.pbkdf2Sync(this.masterKey, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512');
    this.tenantKeys.set(tenantId, key);
    return key;
  }

  rotateKeys() {
    this.config.keyRotation++;
    this.config.lastRotation = new Date().toISOString();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2));
    this.tenantKeys.clear(); // 强制重新派生
  }

  get storePath() {
    return KEY_STORE_DIR;
  }
}

// =====================================================
// 加密/解密核心
// =====================================================

class Encryptor {
  constructor(keyManager) {
    this.keyManager = keyManager;
  }

  encrypt(plaintext, tenantId = 'default') {
    const key = this.keyManager.deriveTenantKey(tenantId);
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(16);

    // 内容压缩后加密
    const compressed = plaintext instanceof Buffer ? plaintext : 
      Buffer.from(typeof plaintext === 'string' ? plaintext : JSON.stringify(plaintext));

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);
    const tag = cipher.getAuthTag();

    // 加密包格式
    const packet = {
      v: 1,
      a: ALGORITHM,
      s: salt.toString('hex'),
      i: iv.toString('hex'),
      t: tag.toString('hex'),
      d: encrypted.toString('hex'),
      ts: Date.now(),
      tenant: tenantId
    };

    return Buffer.from(JSON.stringify(packet));
  }

  decrypt(packet, tenantId = 'default') {
    let data;
    if (packet instanceof Buffer) {
      data = JSON.parse(packet.toString());
    } else if (typeof packet === 'string') {
      data = JSON.parse(packet);
    } else {
      data = packet;
    }

    // 兼容旧格式（来自 vault.js 的 hvskill 格式）
    if (data.magic === 'HOVLT') {
      return this._decryptHvskill(data);
    }

    // ⚠️ 注意：使用调用者指定的 tenantId 派生密钥
    // 不从 data.tenant 读取，防止跨租户伪造
    const key = this.keyManager.deriveTenantKey(tenantId);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(data.i, 'hex'));
    decipher.setAuthTag(Buffer.from(data.t, 'hex'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(data.d, 'hex')),
      decipher.final()
    ]);

    // 解压
    try {
      // 尝试解析 JSON
      const text = decrypted.toString();
      return JSON.parse(text);
    } catch {
      // 纯字符串
      return decrypted.toString();
    }
  }

  _decryptHvskill(pkg) {
    // 兼容读取旧 vault.js 加密的技能包
    const { packSkill, unpackSkill } = require('../../skill-vault/vault.js');
    return unpackSkill(pkg);
  }

  /**
   * 字段级加密 - 只加密 JSON 中的指定字段
   */
  encryptFields(obj, fields, tenantId = 'default') {
    const result = { ...obj };
    for (const field of fields) {
      if (result[field] !== undefined) {
        const encrypted = this.encrypt(
          typeof result[field] === 'string' ? result[field] : JSON.stringify(result[field]),
          tenantId
        );
        result[`_enc_${field}`] = encrypted.toString('base64');
        delete result[field];
      }
    }
    // 标记哪些字段被加密
    result._encryptedFields = fields.filter(f => obj[f] !== undefined);
    return result;
  }

  /**
   * 字段级解密
   */
  decryptFields(obj, tenantId = 'default') {
    const result = { ...obj };
    if (obj._encryptedFields) {
      for (const field of obj._encryptedFields) {
        const encKey = `_enc_${field}`;
        if (result[encKey]) {
          result[field] = this.decrypt(Buffer.from(result[encKey], 'base64'), tenantId);
          delete result[encKey];
        }
      }
      delete result._encryptedFields;
    }
    return result;
  }
}

// =====================================================
// Encrypted StateKV Wrapper
// =====================================================

class EncryptedStateKV {
  constructor(originalKV, keyManager, encryptor) {
    this._kv = originalKV;     // 原始的 iii-engine StateKV
    this._km = keyManager;
    this._enc = encryptor;
    this._tenantId = process.env.AMV_TENANT || 'default';
    this.enabled = true;       // 可通过设置 false 暂时关闭加密
  }

  /**
   * 判断 scope 是否需要完全加密
   */
  _policy(scope) {
    // 完全加密列表
    for (const prefix of ENCRYPTION_POLICY.full) {
      if (scope.startsWith(prefix)) return 'full';
    }
    // 字段级加密
    for (const prefix of ENCRYPTION_POLICY.field) {
      if (scope.startsWith(prefix)) return 'field';
    }
    // 不加密
    for (const prefix of ENCRYPTION_POLICY.none) {
      if (scope === prefix) return 'none';
    }
    // 默认：完全加密（保险起见）
    return 'full';
  }

  /**
   * 写入加密数据
   */
  async set(scope, key, value) {
    if (!this.enabled) return this._kv.set(scope, key, value);

    const policy = this._policy(scope);

    if (policy === 'none') {
      return this._kv.set(scope, key, value);
    }

    if (policy === 'field') {
      // 字段级加密：加密敏感字段，搜索结构明证
      const fields = this._sensitiveFields(scope);
      const encrypted = this._enc.encryptFields(value, fields, this._tenantId);
      return this._kv.set(scope, key, encrypted);
    }

    // full: 整体加密
    const encrypted = this._enc.encrypt(value, this._tenantId);
    return this._kv.set(scope, key, encrypted);
  }

  /**
   * 读取并解密
   */
  async get(scope, key) {
    if (!this.enabled) return this._kv.get(scope, key);

    const encrypted = await this._kv.get(scope, key);
    if (encrypted === null || encrypted === undefined) return null;

    const policy = this._policy(scope);

    if (policy === 'none') {
      return encrypted;
    }

    try {
      if (policy === 'field') {
        return this._enc.decryptFields(encrypted, this._tenantId);
      }
      // full: 整体解密
      return this._enc.decrypt(encrypted, this._tenantId);
    } catch (err) {
      // 解密失败时，返回原始数据（兼容未加密数据）
      console.warn(`[AMVault] Decrypt failed for ${scope}:${key}, returning raw.`, err.message);
      return encrypted;
    }
  }

  /**
   * 列出 scope 下所有 key
   * 注意：key 本身是明文存储的（便于搜索），只有 value 加密
   */
  async list(scope) {
    if (!this.enabled) return this._kv.list(scope);
    const entries = await this._kv.list(scope);
    return entries; // key 列表不加密
  }

  async delete(scope, key) {
    return this._kv.delete(scope, key);
  }

  async update(scope, key, ops) {
    if (!this.enabled) return this._kv.update(scope, key, ops);

    // 读取 -> 解密 -> 修改 -> 加密 -> 写回
    const current = await this.get(scope, key);
    if (current === null) return null;

    let modified = { ...current };
    for (const op of ops) {
      if (op.type === 'set') {
        modified[op.key] = op.value;
      } else if (op.type === 'delete') {
        delete modified[op.key];
      } else if (op.type === 'push') {
        if (!Array.isArray(modified[op.key])) modified[op.key] = [];
        modified[op.key].push(op.value);
      }
    }

    return this.set(scope, key, modified);
  }

  /**
   * 获取 scope 特定的敏感字段列表
   */
  _sensitiveFields(scope) {
    if (scope.startsWith('mem:emb:')) {
      return ['sessionId', 'metadata'];
    }
    if (scope.startsWith('mem:index:bm25')) {
      return []; // BM25 索引需要保持可搜索
    }
    return ['content', 'text', 'data', 'value', 'metadata'];
  }
}

// =====================================================
// AgentMemory Vault 主类
// =====================================================

class AgentMemoryVault {
  constructor(options = {}) {
    this.masterKey = options.masterKey || process.env.AMV_MASTER_KEY || crypto.randomBytes(32).toString('hex');
    this.km = new KeyManager(this.masterKey);
    this.enc = new Encryptor(this.km);
    this.attached = false;
    this.metrics = { encrypts: 0, decrypts: 0, errors: 0 };
  }

  /**
   * 注入到 agentmemory 的 StateKV（核心接入点）
   * 
   * 用法：
   *   在 agentmemory 的 src/index.ts 中
   *   import { AgentMemoryVault } from '@homo/agentmemory-vault';
   *   const vault = new AgentMemoryVault();
   *   vault.attach(stateKV); // stateKV 是原始的 iii-engine StateKV 实例
   */
  attach(stateKV) {
    if (this.attached) {
      console.warn('[AMVault] Already attached to StateKV');
      return;
    }

    const wrapped = new EncryptedStateKV(stateKV, this.km, this.enc);
    
    // 代理原始 StateKV 的所有方法
    const proxy = new Proxy(stateKV, {
      get: (target, prop) => {
        if (prop === 'get') return wrapped.get.bind(wrapped);
        if (prop === 'set') return wrapped.set.bind(wrapped);
        if (prop === 'delete') return wrapped.delete.bind(wrapped);
        if (prop === 'list') return wrapped.list.bind(wrapped);
        if (prop === 'update') return wrapped.update.bind(wrapped);
        if (typeof target[prop] === 'function') return target[prop].bind(target);
        return target[prop];
      }
    });

    this._proxy = proxy;
    this._wrapped = wrapped;
    this.attached = true;

    console.log(`[AMVault] ✅ Attached to StateKV (tenant: ${wrapped._tenantId})`);
    console.log(`[AMVault] 🔑 Key store: ${this.km.storePath}`);
    console.log(`[AMVault] 🔒 Policy: full(${ENCRYPTION_POLICY.full.length}) field(${ENCRYPTION_POLICY.field.length}) none(${ENCRYPTION_POLICY.none.length})`);
    
    return proxy;
  }

  /**
   * 创建 MCP 代理模式（替代方案：如果无法直接注入 StateKV）
   * 作为 HTTP 代理运行在 agentmemory 和 agent 之间
   */
  createMCPProxy(upstream = 'http://localhost:3111') {
    const http = require('http');
    const { createProxy } = require('http-proxy'); // 可选依赖

    const proxy = createProxy({
      target: upstream,
      changeOrigin: true,
      selfHandleResponse: true
    });

    proxy.on('proxyRes', (proxyRes, req, res) => {
      let body = [];
      proxyRes.on('data', chunk => body.push(chunk));
      proxyRes.on('end', () => {
        const raw = Buffer.concat(body).toString();
        try {
          // 尝试解密响应中的记忆数据
          const decrypted = this.decryptResponse(raw);
          res.end(decrypted);
        } catch {
          res.end(raw); // 解密失败透传
        }
      });
    });

    return proxy;
  }

  /**
   * 响应解密（MCP Proxy 模式用）
   */
  decryptResponse(raw) {
    // 匹配 JSON 响应中的记忆数据并解密
    return raw.replace(/"encrypted":"([^"]+)"/g, (match, encData) => {
      try {
        const decrypted = this.enc.decrypt(Buffer.from(encData, 'hex'), this.km.deriveTenantKey('default'));
        return JSON.stringify(decrypted);
      } catch {
        return match; // 解密失败保留原文
      }
    });
  }

  /**
   * 导出加密密钥（用于备份/迁移）
   */
  exportKey() {
    return {
      version: 1,
      keyRotation: this.km.config.keyRotation,
      keyHash: crypto.createHash('sha256').update(this.masterKey).digest('hex').substring(0, 16),
      storePath: this.km.storePath
    };
  }

  /**
   * 获取统计
   */
  getStats() {
    return {
      attached: this.attached,
      encrypts: this.metrics.encrypts,
      decrypts: this.metrics.decrypts,
      errors: this.metrics.errors,
      keyRotation: this.km.config.keyRotation,
      tenantId: process.env.AMV_TENANT || 'default'
    };
  }
}

module.exports = { AgentMemoryVault, EncryptedStateKV, Encryptor, KeyManager };
