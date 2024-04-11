import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn, commands } from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import { IChatRoom } from "../interfaces/IChatRoom";
import { EPage } from "../enums/EPage";
import { IMessage } from "../interfaces/IMessage";
import { ChatSocket } from "../backend/BackendSocket";

export class ChatRoomPanel {
  public static currentPanels: Map<string, ChatRoomPanel> = new Map();
  public static currentRooms: Map<string, IChatRoom> = new Map();
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];
  private _id: string = "";

  public getPanel(): WebviewPanel {
    return this._panel;
  }

  public static getPanel(chatRoomId: string): WebviewPanel | undefined {
    const panel = ChatRoomPanel.currentPanels.get(chatRoomId);
    if (!!panel) {
      return panel._panel;
    }
    return undefined;
  }

  public static getChatRoomId(chatRoom: IChatRoom): string {
    if(chatRoom.groupId){
      return chatRoom.groupId;
    } else if(chatRoom.friendId){
      return chatRoom.friendId;
    }else {
      throw new Error("ChatRoom has no groupId or friendID");
    }
  }

  public static getChatRoomName(chatRoom: IChatRoom): string {
    if(chatRoom.name){
      return chatRoom.name;
    }else {
      throw new Error("ChatRoom has no groupId or friendID");
    }
  }

  public static sendChatMessage(chatRoomId: string, message: IMessage) {
    ChatRoomPanel.currentPanels.get(chatRoomId)?._panel.webview.postMessage({ command: "new message", message: message});
  }

  /**
   * The ChatRoomPanel class private constructor (called only from the render method).
   *
   * @param panel A reference to the webview panel
   * @param extensionUri The URI of the directory containing the extension
   */
  private constructor(panel: WebviewPanel, extensionUri: Uri, id: string) {
    this._panel = panel;
    this._id = id;

    // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
    // the panel or when the panel is closed programmatically)
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Set the HTML content for the webview panel
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

    // Set an event listener to listen for messages passed from the webview context
    this._setWebviewMessageListener(this._panel.webview);
  }

  /**
   * Renders the current webview panel if it exists otherwise a new webview panel
   * will be created and displayed.
   *
   * @param extensionUri The URI of the directory containing the extension.
   */
  public static render(extensionUri: Uri, chatRoom: IChatRoom) {
    const chatRoomId = this.getChatRoomId(chatRoom);
    if(chatRoomId === undefined){
      return;
    }
    if (ChatRoomPanel.currentPanels.has(chatRoomId)) {
      // If the webview panel already exists reveal it
      const panel = ChatRoomPanel.currentPanels.get(chatRoomId);
      if (!!panel) {
        panel._panel.reveal(ViewColumn.One);
      }
    } else {
      // If a webview panel does not already exist create and show a new one
      const panel = window.createWebviewPanel(
        // Panel view type
        "showChatRoom",
        // Panel title
        this.getChatRoomName(chatRoom),
        // The editor column the panel should be displayed in
        ViewColumn.One,
        // Extra panel configurations
        {
          // Enable JavaScript in the webview
          enableScripts: true,
          retainContextWhenHidden: true,
          // Restrict the webview to only load resources from the `out` and `webview-ui/build` directories
          localResourceRoots: [Uri.joinPath(extensionUri, "out"), Uri.joinPath(extensionUri, "webview-ui/build")],
        }
      );

      ChatRoomPanel.currentPanels.set(chatRoomId, new ChatRoomPanel(panel, extensionUri, chatRoomId));
      ChatRoomPanel.currentRooms.set(chatRoomId, chatRoom);
      panel.webview.postMessage({ command: "route", page: EPage.ChatRoom});
      panel.webview.postMessage({ command: "initChatRoom", chatRoom });
    }
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {
    ChatRoomPanel.currentPanels.delete(this._id);

    // Dispose of the current webview panel
    this._panel.dispose();

    // Dispose of all disposables (i.e. commands) for the current webview panel
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where references to the React webview build files
   * are created and inserted into the webview HTML.
   *
   * @param webview A reference to the extension webview
   * @param extensionUri The URI of the directory containing the extension
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    // The CSS file from the React build output
    const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.css"]);
    // The JS file from the React build output
    const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.js"]);

    const nonce = getNonce();

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Chat Room</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   *
   * @param webview A reference to the extension webview
   * @param context A reference to the extension context
   */
  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;

        switch (command) {
          case "openChatRoomMenu":{
            let chatRoom: IChatRoom = message.chatRoom;
            commands.executeCommand('sdct.openChatRoomMenu', chatRoom);
            break;
          }
          case "sendChatMessage":{
            let chatRoom: IChatRoom = message.chatRoom;
            const newMessage: IMessage = message.message;
            ChatSocket.socketEmit("send message", ChatRoomPanel.getChatRoomId(chatRoom), chatRoom, newMessage);
            commands.executeCommand('sdct.sendChatMessage', chatRoom, newMessage);
            break;
          }
          case "sendCodeMessage":{
            let chatRoom: IChatRoom = message.chatRoom;
            const newMessage: IMessage = message.message;
            ChatSocket.socketEmit("send message", ChatRoomPanel.getChatRoomId(chatRoom), chatRoom, newMessage);
            commands.executeCommand('sdct.sendCodeMessage', chatRoom, newMessage);
            break;
          }
        }
      },
      undefined,
      this._disposables
    );
  }
}
