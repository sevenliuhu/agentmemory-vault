/* Copyright (c) 2026 HOMO AI. Proprietary. License required. Contact: 16208204@qq.com */
/**
 * AgentMemory Vault — 验证测试
 * 
 * 测试要点：
 * 1. 加密/解密正确性
 * 2. 字段级加密不影响搜索
 * 3. 完全加密不可读
 * 4. 多租户隔离
 * 5. 兼容未加密数据
 */

const { AgentMemoryVault, EncryptedStateKV, Encryptor, KeyManager } = require('../engine/vault-kv.js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}`);
    failed++;
  }
}

async function testEncryptDecrypt() {
  console.log('\n=== Test 1: Basic Encrypt/Decrypt ===');
  const km = new KeyManager('test-master-key-32bytes!');
  const enc = new Encryptor(km);
  
  const plaintext = { content: 'My API key is sk-abc123', session: 'session-1' };
  const encrypted = enc.encrypt(plaintext);
  
  // 加密后的数据不包含明文
  const encStr = encrypted.toString();
  assert(!encStr.includes('sk-abc123'), 'Encrypted data should not contain plaintext');
  assert(encStr.includes('"a":"aes-256-gcm"'), 'Encrypted data should specify algorithm');
  
  // 解密
  const decrypted = enc.decrypt(encrypted);
  assert(decrypted.content === 'My API key is sk-abc123', 'Decrypted content should match');
  assert(typeof decrypted === 'object', 'Decrypted should be an object');
}

async function testFieldLevelEncryption() {
  console.log('\n=== Test 2: Field-Level Encryption ===');
  const km = new KeyManager('field-test-key');
  const enc = new Encryptor(km);
  
  const doc = {
    id: 'obs-123',
    content: 'Sensitive data: password=admin123',
    timestamp: '2026-05-18T10:00:00Z',
    metadata: { type: 'observation', confidence: 0.95 }
  };
  
  const encrypted = enc.encryptFields(doc, ['content', 'metadata']);
  
  // 非敏感字段保持明证
  assert(encrypted.id === 'obs-123', 'Non-sensitive field should remain plaintext');
  assert(encrypted.timestamp === '2026-05-18T10:00:00Z', 'Timestamp should remain plaintext');
  
  // 敏感字段被加密
  assert(encrypted.content === undefined, 'Sensitive field should be removed');
  assert(encrypted._enc_content !== undefined, 'Encrypted field should exist');
  assert(!encrypted._enc_content.includes('password=admin123'), 'Encrypted field should not contain plaintext');
  
  // 标记加密字段
  assert(Array.isArray(encrypted._encryptedFields), 'Should have _encryptedFields marker');
  
  // 解密后恢复
  const decrypted = enc.decryptFields(encrypted);
  assert(decrypted.content === 'Sensitive data: password=admin123', 'Decrypted field should restore');
  assert(decrypted.metadata.type === 'observation', 'Nested object should restore');
  assert(decrypted._enc_content === undefined, 'Encrypted field placeholder should be removed');
  assert(decrypted._encryptedFields === undefined, 'Field marker should be removed');
}

async function testMultiTenantIsolation() {
  console.log('\n=== Test 3: Multi-Tenant Isolation ===');
  const km = new KeyManager('multi-tenant-key');
  const enc = new Encryptor(km);
  
  const data = { secret: 'my-secret-123' };
  
  // 同一数据被不同租户加密后，密文不同
  const enc1 = enc.encrypt(data, 'tenant-a');
  const enc2 = enc.encrypt(data, 'tenant-b');
  
  assert(enc1.toString() !== enc2.toString(), 'Different tenants should produce different ciphertext');
  
  // 租户A不能正确解密租户B的数据
  let decryptionError = false;
  try {
    enc.decrypt(enc2, 'tenant-a');
  } catch (e) {
    decryptionError = true;
  }
  assert(decryptionError, 'Tenant A should fail to decrypt Tenant B data (auth tag mismatch)');
}

async function testMockStateKV() {
  console.log('\n=== Test 4: EncryptedStateKV Wrapper ===');
  const km = new KeyManager('kv-test-key');
  const enc = new Encryptor(km);
  
  // Mock StateKV
  const store = new Map();
  const mockKV = {
    get: async (scope, key) => store.get(`${scope}:${key}`),
    set: async (scope, key, value) => { store.set(`${scope}:${key}`, value); return value; },
    delete: async (scope, key) => store.delete(`${scope}:${key}`),
    list: async (scope) => Array.from(store.keys()).filter(k => k.startsWith(scope)),
    update: async (scope, key, ops) => {
      let current = store.get(`${scope}:${key}`);
      if (!current) return null;
      for (const op of ops) {
        if (op.type === 'set') current[op.key] = op.value;
      }
      store.set(`${scope}:${key}`, current);
      return current;
    }
  };
  
  const wrapped = new EncryptedStateKV(mockKV, km, enc);
  
  // 测试完全加密 scope
  await wrapped.set('mem:sessions', 'session-1', { messages: ['hello', 'world'], user: 'alice' });
  const rawSession = store.get('mem:sessions:session-1');
  assert(rawSession !== undefined, 'Data should be stored');
  assert(typeof rawSession === 'object' || Buffer.isBuffer(rawSession) || typeof rawSession === 'string', 'Data should exist in store');
  
  // 验证原始存储是加密的（Buffer 形式）
  assert(rawSession instanceof Buffer || typeof rawSession === 'string', 'Raw stored data should be Buffer or string');
  const rawStr = rawSession instanceof Buffer ? rawSession.toString() : JSON.stringify(rawSession);
  assert(rawStr.includes('"d":') || rawStr.includes('"data":'), 'Stored data should be encrypted format');
  assert(!rawStr.includes('hello'), 'Plaintext should not appear in store');
  
  // 读取
  const decrypted = await wrapped.get('mem:sessions', 'session-1');
  assert(decrypted && decrypted.user === 'alice', 'Decrypted data should restore original');
  
  // 测试不加密 scope
  await wrapped.set('mem:health', 'status', { ok: true });
  const rawHealth = store.get('mem:health:status');
  const healthStr = typeof rawHealth === 'string' ? rawHealth : JSON.stringify(rawHealth);
  assert(healthStr.includes('"ok":true'), 'Health data should remain plaintext');
}

async function testUnencryptedCompatibility() {
  console.log('\n=== Test 5: Compatibility with Unencrypted Data ===');
  const km = new KeyManager('compat-key');
  const enc = new Encryptor(km);
  
  // 模拟已有未加密数据
  const store = new Map();
  const mockKV = {
    get: async (scope, key) => store.get(`${scope}:${key}`),
    set: async (scope, key, value) => { store.set(`${scope}:${key}`, value); return value; },
    delete: async (scope, key) => store.delete(`${scope}:${key}`),
    list: async (scope) => Array.from(store.keys()).filter(k => k.startsWith(scope)),
    update: async (scope, key, ops) => null
  };
  
  // 预存未加密数据
  store.set('mem:memories:old-1', { content: 'unencrypted memory', created: '2026-05-01' });
  
  const wrapped = new EncryptedStateKV(mockKV, km, enc);
  
  // 读取未加密数据（应该兼容）
  const oldData = await wrapped.get('mem:memories', 'old-1');
  assert(oldData !== null, 'Unencrypted data should be readable');
  assert(oldData.content === 'unencrypted memory' || oldData === 'unencrypted memory', 'Legacy data should return');
}

async function runAll() {
  console.log('\n🔒 AgentMemory Vault — Test Suite');
  console.log('='.repeat(45));
  
  await testEncryptDecrypt();
  await testFieldLevelEncryption();
  await testMultiTenantIsolation();
  await testMockStateKV();
  await testUnencryptedCompatibility();
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runAll();
