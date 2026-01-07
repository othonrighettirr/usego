"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseValidator = void 0;
exports.createLicenseGuard = createLicenseGuard;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const crypto = __importStar(require("crypto"));
class LicenseValidator {
    constructor(serverUrl, apiKey, cacheDir = '/app/license') {
        this.ip = '0.0.0.0';
        this.cacheTimeout = 15;
        this.offlineTolerance = 60;
        this.error = null;
        this.isBlocked = false;
        this.blockReason = null;
        this.checkIntervalId = null;
        this.onBlockCallback = null;
        this.lastServerCheck = 0;
        this.serverUrl = serverUrl.replace(/\/$/, '');
        this.apiKey = apiKey;
        this.cacheDir = cacheDir;
        this.machineId = this.getMachineId();
        this.hostname = os.hostname();
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }
    getMachineId() {
        if (process.env.MACHINE_ID) {
            return process.env.MACHINE_ID;
        }
        const machineIdPaths = ['/etc/machine-id', '/var/lib/dbus/machine-id'];
        for (const filePath of machineIdPaths) {
            if (fs.existsSync(filePath)) {
                return fs.readFileSync(filePath, 'utf8').trim();
            }
        }
        const cpus = os.cpus();
        const data = `${os.hostname()}-${os.platform()}-${cpus[0]?.model || 'unknown'}`;
        return crypto.createHash('md5').update(data).digest('hex');
    }
    async getPublicIp() {
        const services = [
            'https://api.ipify.org',
            'https://icanhazip.com',
            'https://ifconfig.me/ip'
        ];
        for (const service of services) {
            try {
                const response = await fetch(service, {
                    signal: AbortSignal.timeout(5000)
                });
                if (response.ok) {
                    const ip = (await response.text()).trim();
                    if (this.isValidIp(ip)) {
                        return ip;
                    }
                }
            }
            catch {
                continue;
            }
        }
        return '0.0.0.0';
    }
    isValidIp(ip) {
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        return ipv4Regex.test(ip);
    }
    async request(endpoint, data) {
        const url = `${this.serverUrl}${endpoint}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'X-API-Key': this.apiKey,
                    'User-Agent': 'LicenseValidator/2.0'
                },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(10000)
            });
            const responseText = await response.text();
            if (!response.ok) {
                this.error = `Erro na validação`;
                return null;
            }
            try {
                return JSON.parse(responseText);
            }
            catch {
                this.error = `Resposta inválida do servidor`;
                return null;
            }
        }
        catch (err) {
            this.error = `Erro de conexão com servidor de licenças`;
            return null;
        }
    }
    saveCache(data) {
        if (this.isBlocked || data.blocked || data.status === 'blocked') {
            this.clearCache();
            return;
        }
        const cacheData = {
            ...data,
            cached_at: Math.floor(Date.now() / 1000)
        };
        const cachePath = path.join(this.cacheDir, 'license.cache');
        fs.writeFileSync(cachePath, JSON.stringify(cacheData), { mode: 0o600 });
    }
    loadCache() {
        if (this.isBlocked) {
            return null;
        }
        const cachePath = path.join(this.cacheDir, 'license.cache');
        if (!fs.existsSync(cachePath)) {
            return null;
        }
        try {
            const content = fs.readFileSync(cachePath, 'utf8');
            const cached = JSON.parse(content);
            if (cached.blocked || cached.status === 'blocked') {
                this.clearCache();
                return null;
            }
            return cached;
        }
        catch {
            return null;
        }
    }
    clearCache() {
        const cachePath = path.join(this.cacheDir, 'license.cache');
        if (fs.existsSync(cachePath)) {
            fs.unlinkSync(cachePath);
        }
    }
    isCacheValid(cached) {
        if (this.isBlocked || cached.blocked || cached.status === 'blocked') {
            return false;
        }
        const now = Math.floor(Date.now() / 1000);
        return (now - cached.cached_at) < this.cacheTimeout;
    }
    isWithinOfflineTolerance(cached) {
        if (this.isBlocked || cached.blocked || cached.status === 'blocked') {
            return false;
        }
        const now = Math.floor(Date.now() / 1000);
        return (now - cached.cached_at) < this.offlineTolerance;
    }
    onBlock(callback) {
        this.onBlockCallback = callback;
        return this;
    }
    block(reason) {
        this.isBlocked = true;
        this.blockReason = reason;
        this.clearCache();
        console.error(`🚫 Licença bloqueada`);
        if (this.onBlockCallback) {
            this.onBlockCallback(reason);
        }
    }
    isLicenseBlocked() {
        return this.isBlocked;
    }
    getBlockReason() {
        return this.blockReason;
    }
    getStatus() {
        return {
            valid: !this.isBlocked,
            blocked: this.isBlocked,
            reason: this.blockReason || this.error,
            machineId: this.machineId.substring(0, 8) + '...',
            ip: this.ip.split('.').slice(0, 2).join('.') + '.*.*',
            expiresAt: null
        };
    }
    async activate() {
        this.ip = await this.getPublicIp();
        const response = await this.request('/api/license/activate', {
            api_key: this.apiKey,
            machine_id: this.machineId,
            ip: this.ip,
            hostname: this.hostname
        });
        if (!response) {
            return false;
        }
        if (response.fraud_detected) {
            this.block('Fraude detectada');
            return false;
        }
        if (response.blocked || response.status === 'blocked') {
            this.block(response.reason || 'Licença bloqueada');
            return false;
        }
        if (response.success && response.status === 'active') {
            this.saveCache(response);
            console.log('✅ Licença ativada');
            return true;
        }
        this.error = response.reason || 'Falha na ativação';
        return false;
    }
    async validate(forceCheck = false) {
        if (this.isBlocked) {
            const response = await this.request('/api/license/validate', {
                api_key: this.apiKey,
                machine_id: this.machineId,
                ip: this.ip || await this.getPublicIp()
            });
            if (response && response.success && response.status === 'active' && !response.blocked) {
                this.isBlocked = false;
                this.blockReason = null;
                this.saveCache(response);
                console.log('✅ Licença reativada');
                return true;
            }
            return false;
        }
        if (!forceCheck) {
            const cached = this.loadCache();
            if (cached && this.isCacheValid(cached)) {
                if (cached.blocked || cached.status === 'blocked') {
                    this.block(cached.reason || 'Licença bloqueada');
                    return false;
                }
                return true;
            }
        }
        this.ip = await this.getPublicIp();
        this.lastServerCheck = Date.now();
        const response = await this.request('/api/license/validate', {
            api_key: this.apiKey,
            machine_id: this.machineId,
            ip: this.ip
        });
        if (response) {
            if (response.fraud_detected) {
                this.block('Fraude detectada');
                return false;
            }
            if (response.blocked || response.status === 'blocked') {
                this.block(response.reason || 'Licença bloqueada');
                return false;
            }
            if (response.status === 'expired') {
                this.block('Licença expirada');
                return false;
            }
            if (response.status === 'pending') {
                return await this.activate();
            }
            if (response.success && response.status === 'active') {
                this.saveCache(response);
                return true;
            }
            this.error = response.reason || 'Licença inválida';
            return false;
        }
        const cached = this.loadCache();
        if (cached && this.isWithinOfflineTolerance(cached)) {
            if (cached.blocked || cached.status === 'blocked') {
                this.block('Licença bloqueada');
                return false;
            }
            return true;
        }
        this.error = 'Não foi possível validar a licença';
        return false;
    }
    startRealtimeCheck(intervalSeconds = 15) {
        if (this.checkIntervalId) {
            clearInterval(this.checkIntervalId);
        }
        console.log('🔄 Verificação de licença em tempo real iniciada');
        this.checkIntervalId = setInterval(async () => {
            const isValid = await this.validate(true);
            if (!isValid && !this.isBlocked) {
                this.block(this.error || 'Licença inválida');
            }
        }, intervalSeconds * 1000);
    }
    stopRealtimeCheck() {
        if (this.checkIntervalId) {
            clearInterval(this.checkIntervalId);
            this.checkIntervalId = null;
        }
    }
    async validateOrDie() {
        console.log('🔐 Validando licença...');
        if (!this.apiKey || this.apiKey === '') {
            console.warn('⚠️ LICENSE_KEY não configurada - sistema funcionando sem validação de licença');
            return;
        }
        if (!this.serverUrl || this.serverUrl === '') {
            console.warn('⚠️ LICENSE_SERVER não configurado - sistema funcionando sem validação de licença');
            return;
        }
        const isValid = await this.validate();
        if (!isValid) {
            console.error('❌ Licença inválida ou bloqueada');
            this.block(this.error || 'Licença inválida');
            return;
        }
        console.log('✅ Licença válida');
        this.startRealtimeCheck(15);
    }
    getError() {
        return this.error;
    }
    getMachineIdValue() {
        return this.machineId;
    }
    getIp() {
        return this.ip;
    }
    setCacheTimeout(seconds) {
        this.cacheTimeout = Math.min(seconds, 30);
        return this;
    }
    setOfflineTolerance(seconds) {
        this.offlineTolerance = Math.min(seconds, 120);
        return this;
    }
}
exports.LicenseValidator = LicenseValidator;
function createLicenseGuard(validator) {
    return async (req, res, next) => {
        if (validator.isLicenseBlocked()) {
            return res.status(403).json({
                error: 'LICENSE_BLOCKED',
                message: 'Licença bloqueada',
                reason: validator.getBlockReason(),
                blocked: true,
                status: validator.getStatus()
            });
        }
        const isValid = await validator.validate();
        if (!isValid) {
            return res.status(403).json({
                error: 'LICENSE_INVALID',
                message: 'Licença inválida',
                reason: validator.getError(),
                blocked: validator.isLicenseBlocked(),
                status: validator.getStatus()
            });
        }
        next();
    };
}
//# sourceMappingURL=LicenseValidator.js.map