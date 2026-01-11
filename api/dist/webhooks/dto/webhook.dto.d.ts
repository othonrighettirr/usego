export declare class CreateWebhookDto {
    url: string;
    events: string[];
}
export declare class UpdateWebhookDto {
    url?: string;
    events?: string[];
    active?: boolean;
}
