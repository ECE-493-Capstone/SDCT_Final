import { IUser } from "./IUser";
import {IFriend} from "./IFriend"

export interface IChatRoom {
    name: string,
    user: IUser;
    friends: IFriend[];
    joinedVoiceChat: boolean;
    joinedCodeSession: boolean;
    friendId?: string;
    groupId?: string;
}
