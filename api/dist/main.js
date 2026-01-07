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
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const prisma_service_1 = require("./shared/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
        exposedHeaders: ['Content-Length', 'Content-Type'],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true, whitelist: true }));
    const httpAdapter = app.getHttpAdapter();
    httpAdapter.get('/status', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    const prisma = app.get(prisma_service_1.PrismaService);
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@goapi.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    try {
        const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
        if (!existingAdmin) {
            const hash = await bcrypt.hash(adminPassword, 10);
            await prisma.user.create({
                data: { email: adminEmail, password: hash, role: 'ADMIN' },
            });
            console.log(`✅ Admin user created: ${adminEmail}`);
        }
        else {
            const hash = await bcrypt.hash(adminPassword, 10);
            await prisma.user.update({
                where: { email: adminEmail },
                data: { password: hash },
            });
            console.log(`✅ Admin user updated: ${adminEmail}`);
        }
    }
    catch (err) {
        console.log('⚠️ Could not create/update admin user:', err.message);
    }
    const port = process.env.PORT || 3001;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 GO-API running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map