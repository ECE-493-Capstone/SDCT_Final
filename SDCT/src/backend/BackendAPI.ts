import { IUser } from '../interfaces/IUser';
import { IMessage } from '../interfaces/IMessage';
import { IApiFriend, IApiGroup, IApiGroupNotification, IApiMessage, IApiFriendNotification } from "../interfaces/IBackendApi"
import { IChatRoom } from '../interfaces/IChatRoom';
import { EMessageType } from '../enums/EMessageType';

export class BackendAPI {
    private userID: string = "";
    private apiURL = "";
    private apiPort = 3000;

    constructor(apiUrl: string, apiPort: number){
        this.apiURL = apiUrl;
        this.apiPort = apiPort;
    }

    private async postRequest(path: string, data: object): Promise<Response | undefined> {
        console.log("Post", path)
        try {
            const response = await fetch(`${this.apiURL}:${this.apiPort}${path}`, {
                method: 'post',
                body: JSON.stringify(data),
                headers: {'Content-Type': 'application/json'}
            })
            if(!response.ok){
                throw new Error(await response.text());
            }
     
            return response;
        } catch (error) {
            console.error(error);
        }

        return undefined;
    }

    private async getRequest(path: string): Promise<Response | undefined> {
        console.log("Get", path)
        try {
            const response = await fetch( `${this.apiURL}:${this.apiPort}${path}`)
            
            if(!response.ok){
                throw new Error(await response.text());
            }

            return response;
        } catch (error) {
            console.error(error);
        }
        return undefined;
    }

    async login(user: IUser): Promise<boolean>{
        const apiData = await this.postRequest("/login", {UserId: user.name, ImageURL: user.pictureUri});
        console.log(user);
        if(apiData){
            const data_json = await apiData.json() as {message: string};
            if(data_json.message === "success"){
                this.userID = user.name;
                return true;
            }
        }

        return false;
    }

    getUser(): string{
        return this.userID;
    }
    updateUser(user: IUser){
        this.userID = user.name;
    }

    async getFriends(): Promise<IApiFriend[]>{
        const friends = await this.getRequest(`/get_friends/${this.userID}`);

        let friendList: IApiFriend[] = []
        if(friends){
            const data = await friends.json() as {data: IApiFriend[]};
            if(data){
                for(let friend of data.data ){
                    friend.FriendId = friend.FriendId === this.userID ? friend.UserId : friend.FriendId
                    friendList.push(friend);
                }
            }
        }

        return friendList;
    }

    async getGroups(): Promise<IApiGroup[]> {
        const apiData = await this.getRequest(`/get_groups/${this.userID}`);
        
        let groupList: IApiGroup[] = [];
        if(apiData){
            const data_json = await apiData.json() as {data: IApiGroup[]};

            for(let group of data_json.data){
                groupList.push(group);
            }
        }

        return groupList;
    }

    async addFriend(friend: string): Promise<boolean>{
        const apiData = await this.postRequest(`/add_friend`, {UserId: this.userID, FriendId: friend});
        
        if(apiData){
            return true;
        }

        return false;
    }

    async getInvites(): Promise<{name: string, id: string}[]>{
        const inviteList: {name: string, id: string}[] = []
        const friend_invites = await this.getRequest(`/list_received_invitations_friends/${this.userID}`);

        if(friend_invites){
            const data = await friend_invites.json() as {data: {UserId: string}[]};
            if(data){
                for(let invite of data.data ){
                    inviteList.push({name: invite.UserId, id: invite.UserId});
                }
            }

        }

        const group_invites = await this.getRequest(`/list_received_invitations_groups/${this.userID}`);
        if(group_invites){
            const data = await group_invites.json() as {data: {GroupId: string,GroupName: string}[]};
            if(data){
                for(let invite of data.data ){
                    inviteList.push({name: `Group: ${invite.GroupName}`, id: invite.GroupId});
                }
            }

        }

        return inviteList;
    }

    async acceptFriendInvite(friend: string): Promise<boolean>{
        const apiData = await this.postRequest(`/accept_invite_friend`, {FriendId: friend, UserId: this.userID});
        
        if(apiData){
            return true;
        }

        return false;
    }
    async declineFriendInvite(friend: string): Promise<boolean>{
        const apiData = await this.postRequest(`/decline_invite_friend`, {FriendId: friend, UserId: this.userID});
        
        if(apiData){
            return true;
        }

        return false;
    }

    async createGroup(name: string): Promise<number | undefined>{
        const apiData = await this.postRequest(`/create_group`, {GroupName: name});

        if(apiData){
            const data_json = await apiData.json() as {id: number};
            if(data_json.id){
                return data_json.id;
            }
        }

        return undefined;
    }

    async addUserToGroup(groupId: number, userId: string): Promise<boolean>{
        const success = await this.postRequest(`/invite_group`, {GroupId: groupId, UserId: userId});
        if(success){
            return true;
        }

        return false;
    }

    async acceptGroupInvite(group: string): Promise<boolean>{
        const apiData = await this.postRequest(`/accept_invite_group`, {GroupId: group, UserId: this.userID});
        
        if(apiData){
            return true;
        }

        return false;
    }
    async declineGroupInvite(group: string): Promise<boolean>{
        const apiData = await this.postRequest(`/decline_invite_group`, {GroupId: group, UserId: this.userID});
        
        if(apiData){
            return true;
        }

        return false;
    }

    async getFriendMessageHistory(chatRoom: IChatRoom): Promise<IMessage[]>{
        const apiData = await this.getRequest(`/get_messages_friend/${this.userID}/${chatRoom.name}`);
        
        const messageList: IMessage[] = [];
        if(apiData){
            const data_json = await apiData.json() as {data: IApiMessage[]};

            for(let message of data_json.data){
                messageList.push({content: message.MessageText,
                                 sender: <IUser>{name: message.SendId, pictureUri: message.ImageURL},
                                 timestamp: new Date(message.MessageTime),
                                 type: <EMessageType>message.MessageType});
            }
        }

        return messageList;
    }

    async getGroupMessageHistory(chatRoom: IChatRoom): Promise<IMessage[]>{
        const apiData = await this.getRequest(`/get_messages_group/${chatRoom.groupId}`);
        
        const messageList: IMessage[] = [];
        if(apiData){
            const data_json = await apiData.json() as {data: IApiMessage[]};

            for(let message of data_json.data){
                messageList.push({content: message.MessageText,
                                 sender: <IUser>{name: message.SendId, pictureUri: message.ImageURL},
                                 timestamp: new Date(message.MessageTime),
                                 type: <EMessageType>message.MessageType});
            }
        }

        return messageList;
    }

    async leaveGroup(groupId: string): Promise<boolean>{
        const apiData = await this.postRequest(`/decline_invite_group`, {GroupId: groupId, UserId: this.userID});
        if(apiData){
            return true;
        }

        return false;
    }

    async getFriendNotifications(): Promise<Map<string, IApiFriendNotification>>{
        const apiData = await this.getRequest(`/get_notifications_friends/${this.userID}`);

        let newMap = new Map();
        if(apiData){
            const data_json = await apiData.json() as {data: IApiFriendNotification[]};

            for(let item of data_json.data){
                newMap.set(item.FriendId, item);
            }
        }

        return newMap;
    }

    async clearFriendNotifications(friendId: string): Promise<boolean>{
        console.log(friendId);
        const apiData = await this.postRequest(`/clear_notification_friend`, {UserId: this.userID, FriendId: friendId});
        if(apiData){
            return true;
        }

        return false;
    }
    async getGroupNotifications(): Promise<Map<string, IApiGroupNotification>>{
        const apiData = await this.getRequest(`/get_notifications_groups/${this.userID}`);

        let newMap = new Map();
        if(apiData){
            const data_json = await apiData.json() as {data: IApiGroupNotification[]};

            for(let item of data_json.data){
                newMap.set(item.GroupId.toString(), item);
            }
        }
        return newMap;
    }   

    async clearGroupNotifications(groupId: string): Promise<boolean>{
        const apiData = await this.postRequest(`/clear_notification_group`, {UserId: this.userID, GroupId: groupId});
        if(apiData){
            return true;
        }

        return false;
    }

    async getFriendLastChats(): Promise<Map<string,IApiMessage>>{
        const apiData = await this.getRequest(`/list_chats_friends/${this.userID}`);

        let newMap = new Map();
        if(apiData){
            const data_json = await apiData.json() as {data: IApiMessage[]};

            for(let item of data_json.data){
                if(item.RecvId === this.userID){
                    newMap.set(item.SendId, item);
                } else{
                    newMap.set(item.RecvId, item);
                }
            }
        }

        return newMap;
    }

    async getGroupLastChats(): Promise<Map<string,IApiMessage>>{
        const apiData = await this.getRequest(`/list_chats_groups/${this.userID}`);

        let newMap = new Map();
        if(apiData){
            const data_json = await apiData.json() as {data: IApiMessage[]};

            for(let item of data_json.data){
                newMap.set(item.GroupName, item);
            }
        }

        return newMap;
    }
}
