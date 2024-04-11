import { IUser } from './IUser';
import { EMessageType } from '../enums/EMessageType';

export interface IMessage {
    content: string;
    timestamp: Date;
    sender: IUser;
    type: EMessageType;
    language?: string;
    filename?: string;
}
