import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../shared/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    register(dto: RegisterDto): Promise<{
        token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
        };
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
        };
    }>;
    validateUser(userId: string): Promise<{
        email: string;
        password: string;
        id: string;
        createdAt: Date;
        role: string;
    }>;
    private generateToken;
}
