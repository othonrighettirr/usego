import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InstancesService } from './instances.service';
import { CreateInstanceDto, UpdateInstanceDto, UpdateSettingsDto, SharedTokenDto } from './dto/instance.dto';

@ApiTags('Instances')
@Controller('instances')
export class InstancesController {
  constructor(private instancesService: InstancesService) {}

  @Get('shared/:token')
  @ApiOperation({ summary: 'Acessar QR Code via token compartilhado (público)' })
  @ApiParam({ name: 'token', description: 'Token de compartilhamento' })
  getSharedQR(@Param('token') token: string) {
    return this.instancesService.getSharedQR(token);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar todas as instâncias' })
  findAll(@Request() req: any) {
    return this.instancesService.findAll(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buscar detalhes de uma instância' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.instancesService.findOne(id, req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Criar nova instância' })
  create(@Body() dto: CreateInstanceDto, @Request() req: any) {
    return this.instancesService.create(dto, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atualizar nome da instância' })
  update(@Param('id') id: string, @Body() dto: UpdateInstanceDto, @Request() req: any) {
    return this.instancesService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deletar instância' })
  delete(@Param('id') id: string, @Request() req: any) {
    return this.instancesService.delete(id, req.user.id);
  }

  @Post(':id/connect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Iniciar conexão e gerar QR Code' })
  connect(@Param('id') id: string, @Request() req: any) {
    return this.instancesService.connect(id, req.user.id);
  }

  @Post(':id/disconnect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Desconectar instância (logout)' })
  disconnect(@Param('id') id: string, @Request() req: any) {
    return this.instancesService.disconnect(id, req.user.id);
  }

  @Post(':id/reconnect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reconectar instância mantendo sessão' })
  reconnect(@Param('id') id: string, @Request() req: any) {
    return this.instancesService.reconnect(id, req.user.id);
  }

  @Post(':id/restart')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reiniciar instância sem precisar de QR' })
  restart(@Param('id') id: string, @Request() req: any) {
    return this.instancesService.restart(id, req.user.id);
  }

  @Get(':id/qr')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obter QR Code (base64)' })
  getQR(@Param('id') id: string, @Request() req: any) {
    return this.instancesService.getQR(id, req.user.id);
  }

  @Get(':id/settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obter configurações da instância' })
  getSettings(@Param('id') id: string, @Request() req: any) {
    return this.instancesService.getSettings(id, req.user.id);
  }

  @Put(':id/settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atualizar configurações da instância' })
  updateSettings(@Param('id') id: string, @Body() dto: UpdateSettingsDto, @Request() req: any) {
    return this.instancesService.updateSettings(id, dto, req.user.id);
  }
}

@ApiTags('Auth')
@Controller('auth')
export class AuthSharedTokenController {
  constructor(private instancesService: InstancesService) {}

  @Post('shared-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Criar token compartilhado para QR Code' })
  createSharedToken(@Body() dto: SharedTokenDto, @Request() req: any) {
    return this.instancesService.createSharedToken(
      dto.instanceId,
      req.user.id,
      dto.expiresInHours || 24,
      dto.permissions || ['view_qr'],
    );
  }
}
