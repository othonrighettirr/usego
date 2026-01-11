import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './shared/prisma.service';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS - Habilitar para todas as origens
  app.enableCors({
    origin: true, // Permite qualquer origem
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Accept,Origin,X-Requested-With,x-api-key,X-Api-Key,X-API-KEY,apikey',
    exposedHeaders: 'Content-Length,Content-Range,Authorization',
    credentials: false, // Não usar credentials com origin: *
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('GO-API')
    .setDescription('API WhatsApp com Baileys - Documentação completa dos endpoints')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth'
    )
    .addApiKey(
      { type: 'apiKey', name: 'x-api-key', in: 'header' },
      'api-key'
    )
    .addTag('Auth', 'Autenticação e gerenciamento de tokens')
    .addTag('Instances', 'Gerenciamento de instâncias WhatsApp')
    .addTag('Messages', 'Envio de mensagens via JWT')
    .addTag('API', 'Envio de mensagens via API Key')
    .addTag('Groups', 'Gerenciamento de grupos')
    .addTag('Newsletter', 'Envio para canais/newsletters')
    .addTag('Integrations', 'Integrações com Typebot, n8n, Chatwoot')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'GO-API - Swagger',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0 }
      .swagger-ui .info .title { color: #f59e0b }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  // Endpoint de status
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/status', (req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Criar usuário admin se não existir
  const prisma = app.get(PrismaService);
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@goapi.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  try {
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const hash = await bcrypt.hash(adminPassword, 10);
      await prisma.user.create({
        data: { email: adminEmail, password: hash, role: 'ADMIN' },
      });
      console.log('✅ Admin user created');
    } else {
      // Atualizar senha do admin existente
      const hash = await bcrypt.hash(adminPassword, 10);
      await prisma.user.update({
        where: { email: adminEmail },
        data: { password: hash },
      });
      console.log('✅ Admin user updated');
    }
  } catch (err: any) {
    console.log('⚠️ Could not create/update admin user:', err.message);
  }
  
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log('🚀 GO-API running');
}
bootstrap();
