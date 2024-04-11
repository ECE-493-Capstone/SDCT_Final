export interface IChat {
    name: string;
    lastMessage: string;
    lastMessageTime: Date;
    pictureUri: string;
    notificationCount: number;
    voiceChatActive: boolean;
    codeSessionActive: boolean;
    friendId?: string;
    groupId?: string;
}
