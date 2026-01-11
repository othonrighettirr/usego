import { IsEmail, IsString, MinLength, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'usuario@email.com', description: 'Email do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123', description: 'Senha (mínimo 6 caracteres)' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'usuario@email.com', description: 'Email do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123', description: 'Senha do usuário' })
  @IsString()
  password: string;
}

export class SharedTokenDto {
  @ApiProperty({ example: 'uuid-da-instancia', description: 'ID da instância' })
  @IsString()
  instanceId: string;

  @ApiPropertyOptional({ example: 24, description: 'Tempo de expiração em horas' })
  @IsNumber()
  @IsOptional()
  expiresInHours?: number;

  @ApiPropertyOptional({ example: ['view_qr'], description: 'Permissões do token' })
  @IsArray()
  @IsOptional()
  permissions?: string[];
}
