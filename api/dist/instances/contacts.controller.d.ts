import { BaileysService } from './baileys.service';
export declare class ContactsController {
    private baileys;
    constructor(baileys: BaileysService);
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
}
