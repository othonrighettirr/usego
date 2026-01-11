/**
 * Script de Ofuscação - GO-API
 * Ofusca arquivos sensíveis após o build
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

// Arquivos para ofuscar (caminho relativo à pasta dist)
const filesToObfuscate = [
  'messages/messages.service.js'
];

// Configuração MÁXIMA de ofuscação
const obfuscatorConfig = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 1,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: false,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 5,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayCallsTransformThreshold: 0.75,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false
};

const distPath = path.join(__dirname, '..', 'dist');

console.log('🔒 Iniciando ofuscação de arquivos sensíveis...\n');

filesToObfuscate.forEach(file => {
  const filePath = path.join(distPath, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Arquivo não encontrado: ${file}`);
    return;
  }

  try {
    console.log(`📄 Ofuscando: ${file}`);
    
    const originalCode = fs.readFileSync(filePath, 'utf8');
    const originalSize = Buffer.byteLength(originalCode, 'utf8');
    
    const obfuscatedResult = JavaScriptObfuscator.obfuscate(originalCode, obfuscatorConfig);
    const obfuscatedCode = obfuscatedResult.getObfuscatedCode();
    const obfuscatedSize = Buffer.byteLength(obfuscatedCode, 'utf8');
    
    fs.writeFileSync(filePath, obfuscatedCode);
    
    console.log(`   ✅ Concluído! (${(originalSize/1024).toFixed(1)}KB → ${(obfuscatedSize/1024).toFixed(1)}KB)`);
  } catch (error) {
    console.error(`   ❌ Erro ao ofuscar ${file}:`, error.message);
  }
});

console.log('\n🔒 Ofuscação concluída!');
