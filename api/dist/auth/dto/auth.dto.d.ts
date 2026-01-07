export declare class RegisterDto {
    email: string;
    password: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class SharedTokenDto {
    instanceId: string;
    expiresInHours?: number;
    permissions?: string[];
}
