import { BaileysService } from './baileys.service';
export declare class ContactsController {
    private baileys;
    constructor(baileys: BaileysService);
    private newsletterStore;
    private lidCache;
    private extractPhoneNumber;
    private resolveLIDToPhone;
    private getContactName;
    getGroups(instanceId: string): Promise<{
        groups: {
            id: any;
            name: any;
            participants: any;
            creation: any;
            owner: any;
        }[];
    }>;
    getGroupParticipants(instanceId: string, groupId: string): Promise<{
        participants: any[];
        groupName?: undefined;
        groupId?: undefined;
    } | {
        groupName: any;
        groupId: any;
        participants: any[];
    }>;
    getAllContacts(instanceId: string): Promise<{
        contacts: {
            id: string;
            phone: string;
            name: string;
        }[];
    }>;
    getNewsletters(instanceId: string): Promise<{
        newsletters: {
            id: any;
            name: any;
            description: any;
            subscribers: number;
            picture: any;
        }[];
    }>;
    getNewsletterSubscribers(instanceId: string, newsletterId: string): Promise<{
        subscribers: number;
        newsletterId?: undefined;
        error?: undefined;
    } | {
        newsletterId: string;
        subscribers: any;
        error?: undefined;
    } | {
        subscribers: number;
        error: any;
        newsletterId?: undefined;
    }>;
}
