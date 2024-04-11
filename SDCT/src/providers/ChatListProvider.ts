import * as vscode from 'vscode';
import { IUser } from '../interfaces/IUser';
import { IChat } from '../interfaces/IChat';
import { BackendAPI } from '../backend/BackendAPI'

export class ChatListProvider implements vscode.TreeDataProvider<IChat> {
  private data: IChat[] = [];
  private authenticated: boolean;
  private backendApi: BackendAPI | undefined;
  private searchQuery: string | undefined;
  private _onDidChangeTreeData: vscode.EventEmitter<IChat | undefined | null | void> = new vscode.EventEmitter<IChat | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<IChat | undefined | null | void> = this._onDidChangeTreeData.event;

  public getCurrentData(): IChat[] {
    return this.data;
  }

  public setData(data: IChat[]): void {
    this.data = data;
    this._onDidChangeTreeData.fire();
  }

  async refresh(context: vscode.ExtensionContext): Promise<void> {
    this.authenticated = !!context.globalState.get<IUser>('userAuth');
    this.data = await this.getData();
    this._onDidChangeTreeData.fire();
  }

  async notificationUpdate(): Promise<void>{
    if(this.authenticated && this.backendApi && this.data){
      const friendNotif = await this.backendApi.getFriendNotifications();
      const groupNotif = await this.backendApi.getGroupNotifications();
      const friendLastMsg = await this.backendApi.getFriendLastChats();
      const groupLastMsg = await this.backendApi.getGroupLastChats();

      for (var i = 0; i < this.data.length; i++){
        const oldItem = this.data[i];
        if(oldItem.friendId){
          const notif = friendNotif.get(oldItem.name);
          if(notif){
            this.data[i].notificationCount = notif.NotifCount;
          } else{
            this.data[i].notificationCount = 0;
          }

          const lastMessage = friendLastMsg.get(oldItem.name);
          if(lastMessage){
            this.data[i].lastMessage = lastMessage.MessageText;
            this.data[i].lastMessageTime = new Date(lastMessage.MessageTime);
          }
        } else if(oldItem.groupId){
          const notif = groupNotif.get(oldItem.groupId);
          if(notif){
            this.data[i].notificationCount = notif.NotifCount;
          } else{
            this.data[i].notificationCount = 0;
          }

          const lastMessage = groupLastMsg.get(oldItem.name);
          if(lastMessage){
            this.data[i].lastMessage = lastMessage.MessageText;
            this.data[i].lastMessageTime = new Date(lastMessage.MessageTime);
          }
        }
      }
      this.data.sort((a,b) => { return b.lastMessageTime.getTime()-a.lastMessageTime.getTime()})
      this._onDidChangeTreeData.fire();
    }
  }

  constructor(context: vscode.ExtensionContext, backendApi: BackendAPI) {
    this.authenticated = !!context.globalState.get<IUser>('userAuth');
    this.backendApi = backendApi;
  }

  getTreeItem(element: IChat): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(element.name);
    if (element.notificationCount > 0) {
      treeItem.label += ` ${this.getNotificationCountSymbol(element.notificationCount)}`;
    }
    treeItem.iconPath = vscode.Uri.parse(element.pictureUri);
    treeItem.description = element.lastMessage;
    treeItem.command = {
      command: 'sdct.openChatRoom',
      title: 'chatListItemClicked',
      arguments: [element]
    };
    return treeItem;
  }

  getChildren(): IChat[] | Thenable<IChat[]> {
    if (this.authenticated && this.data.length > 0) {
      return this.data.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
    } else if (this.authenticated) {
      const emptyChatList: IChat = {
        name: 'No chats available',
        pictureUri: '',
        lastMessage: '',
        lastMessageTime: new Date(),
        notificationCount: 0,
        voiceChatActive: false,
        codeSessionActive: false
      };
      return [emptyChatList];
    }
    return [];
  }

  async getData(): Promise<IChat[]> {
    let data: IChat[] = [];

    if(this.backendApi){
      const friendData = await this.backendApi.getFriends();

      for(let friend of friendData){
        data.push({
          name: friend.FriendId.toString(),
          lastMessage: "", // Default value
          lastMessageTime: new Date(), // Default value
          pictureUri: friend.ImageURL,
          notificationCount: 0, // Default value
          voiceChatActive: false, // Default value
          codeSessionActive: false,// Default value
          friendId: friend.rowid.toString(),
          groupId: undefined,
        });
      }

      const groupData = await this.backendApi.getGroups();

      for(let group of groupData){
        data.push({
          name: group.GroupName,
          lastMessage: "", // Default value
          lastMessageTime: new Date(), // Default value
          pictureUri: "",
          notificationCount: 0, // Default value
          voiceChatActive: false, // Default value
          codeSessionActive: false,// Default value
          friendId: undefined,
          groupId: group.GroupId.toString(),
        });
      }
    }
    return data;
  }

  getNotificationCountSymbol(notificationCount: number): string {
    const symbols = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
    if (notificationCount > 0) {
      const notificationCountStr = notificationCount.toString();
      let result = '';
      for (let i = 0; i < notificationCountStr.length; i++) {
        result += symbols[parseInt(notificationCountStr[i])];
      }
      return result;
    } else {
      return '';
    }
  }

  async searchChatList() {
    this.searchQuery = await vscode.window.showInputBox({
      prompt: 'Search for chat',
      placeHolder: this.searchQuery
    });

    const unfilteredData = await this.getData();
    if (!!this.searchQuery) {
      const filteredData = unfilteredData.filter(chat => chat.name.toLowerCase().includes(this.searchQuery ? this.searchQuery.toLowerCase() : ''));
      this.data = filteredData;
      this._onDidChangeTreeData.fire();
    } else {
      this.data = unfilteredData;
      this._onDidChangeTreeData.fire();
    }
  }
}
