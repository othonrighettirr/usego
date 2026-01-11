/**
 * License Module para NestJS
 * 
 * Sistema de proteção de licença com verificação em tempo real
 */

import {
  Module,
  DynamicModule,
  Global,
  OnModuleInit,
  OnModuleDestroy,
  Injectable,
  NestMiddleware,
  MiddlewareConsumer,
  NestModule,
  Controller,
  Get,
  Inject,
  RequestMethod,
} from '@nestjs/common';
import { LicenseValidator, LicenseStatus } from './LicenseValidator';

export interface LicenseModuleOptions {
  serverUrl: string;
  apiKey: string;
  cacheDir?: string;
  validateOnStart?: boolean;
  checkInterval?: number;
}

// Token para injeção das opções
const LICENSE_OPTIONS = 'LICENSE_OPTIONS';

@Injectable()
export class LicenseService implements OnModuleInit, OnModuleDestroy {
  private validator: LicenseValidator | null = null;
  private licenseConfigured: boolean = false;

  constructor(@Inject(LICENSE_OPTIONS) private options: LicenseModuleOptions) {
    // Só criar validator se as opções estiverem configuradas
    if (options.serverUrl && options.apiKey) {
      this.validator = new LicenseValidator(
        options.serverUrl,
        options.apiKey,
        options.cacheDir || '/app/license',
      );
      this.licenseConfigured = true;
    } else {
      console.warn('⚠️ Licença não configurada - sistema funcionando sem validação');
    }
  }

  async onModuleInit() {
    if (this.licenseConfigured && this.validator && this.options.validateOnStart !== false) {
      console.log('🔐 Validando licença...');
      await this.validator.validateOrDie();
    }
  }

  async validate(): Promise<boolean> {
    if (!this.licenseConfigured || !this.validator) {
      return true; // Sem licença configurada = sempre válido
    }
    return this.validator.validate();
  }

  // Força verificação com servidor (ignora cache)
  async forceValidate(): Promise<boolean> {
    if (!this.licenseConfigured || !this.validator) {
      return true; // Sem licença configurada = sempre válido
    }
    return this.validator.validate(true);
  }

  isBlocked(): boolean {
    if (!this.licenseConfigured || !this.validator) {
      return false; // Sem licença configurada = não bloqueado
    }
    return this.validator.isLicenseBlocked();
  }

  getBlockReason(): string | null {
    if (!this.licenseConfigured || !this.validator) {
      return null;
    }
    return this.validator.getBlockReason();
  }

  getStatus(): LicenseStatus {
    if (!this.licenseConfigured || !this.validator) {
      return {
        valid: true,
        blocked: false,
        reason: null,
        machineId: 'not-configured',
        ip: 'not-configured',
        expiresAt: null,
      };
    }
    return this.validator.getStatus();
  }

  onModuleDestroy() {
    if (this.validator) {
      this.validator.stopRealtimeCheck();
    }
  }
}

@Injectable()
export class LicenseMiddleware implements NestMiddleware {
  constructor(private licenseService: LicenseService) {}

  async use(_req: any, res: any, next: () => void) {
    try {
      // SEMPRE força verificação com servidor
      const isValid = await this.licenseService.forceValidate();

      if (!isValid || this.licenseService.isBlocked()) {
        return res.status(403).json({
          error: 'LICENSE_BLOCKED',
          message: 'Licença bloqueada',
          reason: this.licenseService.getBlockReason(),
          blocked: true,
          status: this.licenseService.getStatus(),
        });
      }
      next();
    } catch (error) {
      // Se houver erro na verificação, permitir acesso
      // para não bloquear o sistema por erro de conexão
      console.error('Erro no middleware de licença:', error);
      next();
    }
  }
}

// Controller para verificar status da licença
@Controller('license')
export class LicenseController {
  constructor(private licenseService: LicenseService) {}

  @Get('check')
  async check() {
    try {
      // SEMPRE força verificação com servidor
      const isValid = await this.licenseService.forceValidate();

      if (!isValid || this.licenseService.isBlocked()) {
        return {
          error: 'LICENSE_BLOCKED',
          message: 'Licença bloqueada',
          reason: this.licenseService.getBlockReason(),
          blocked: true,
          status: this.licenseService.getStatus(),
        };
      }

      return {
        success: true,
        blocked: false,
        status: this.licenseService.getStatus(),
      };
    } catch (error) {
      // Se houver erro na verificação, retornar como não bloqueado
      // para não bloquear o sistema por erro de conexão
      console.error('Erro ao verificar licença:', error);
      return {
        success: true,
        blocked: false,
        status: {
          valid: true,
          blocked: false,
          reason: null,
          machineId: 'unknown',
          ip: 'unknown',
          expiresAt: null,
        },
      };
    }
  }

  @Get('status')
  getStatus() {
    return {
      blocked: this.licenseService.isBlocked(),
      reason: this.licenseService.getBlockReason(),
      status: this.licenseService.getStatus(),
    };
  }
}

@Global()
@Module({})
export class LicenseModule implements NestModule {
  static forRoot(options: LicenseModuleOptions): DynamicModule {
    return {
      module: LicenseModule,
      controllers: [LicenseController],
      providers: [
        {
          provide: LICENSE_OPTIONS,
          useValue: options,
        },
        LicenseService,
        LicenseMiddleware,
      ],
      exports: [LicenseService],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    // Aplicar middleware em todas as rotas EXCETO as de licença, health e OPTIONS (preflight)
    consumer
      .apply(LicenseMiddleware)
      .exclude(
        'health',
        'health/(.*)',
        'license',
        'license/check',
        'license/(.*)',
        'status',
        'auth/login',
        'auth/register',
        { path: '*', method: RequestMethod.OPTIONS }, // Excluir preflight CORS
      )
      .forRoutes('*');
  }
}
