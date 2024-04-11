import { io, Socket} from "socket.io-client";
import { Server } from "socket.io"
import { createServer, Server as httpServer } from "http";
import { AddressInfo } from 'net'
import { EMessageType } from '../enums/EMessageType'
import { CodeHelper, CodeSession } from '../services/CodeSession'

import * as vscode from "vscode"
import { VoiceChatPanel } from "../panels/VoiceChatPanel";
import { IUser } from "../interfaces/IUser";
import { BackendAPI } from "./BackendAPI";
import { WhiteboardPanel } from "../panels/WhiteboardPanel";

export class ChatSocket{
    private static socket: Socket | undefined;

    constructor(socketUrl: string, socketPort: number){
        ChatSocket.socket = io(`${socketUrl}:${socketPort}/chat`, { autoConnect: false, transports: ["websocket"] });
    }

    startSocketIO(){
        if(ChatSocket.socket && !ChatSocket.socket.connected){
            ChatSocket.socket.connect();
            
            ChatSocket.socket.on("connect_error", (err) => {
                if (err.message === "invalid username") {
                    console.log("Bad SocketIo Connection");
                    return;
                }
            });

            ChatSocket.socket.on("get message", (chatRoom, message) => {
                console.log(message);
                switch (message.type) {
                    case EMessageType.Text:
                        vscode.commands.executeCommand('sdct.sendChatMessage', chatRoom, message);
                        break;
                    case EMessageType.Media:
                        vscode.commands.executeCommand('sdct.sendMedia', chatRoom, message);
                        break;
                    case EMessageType.File:
                        vscode.commands.executeCommand('sdct.sendFile', chatRoom, message);
                        break;
                    case EMessageType.Code:
                        vscode.commands.executeCommand('sdct.sendCodeMessage', chatRoom, message);
                        break;
                };
            });

        }else{
            console.log("No socket")
        }

    }

    public static socketEmit(command: string, ...args: any[]){
        if(ChatSocket.socket){
            ChatSocket.socket.emit(command, ...args)
        } else{
            console.log("No socket")
        }
    }

    public static endSocket(){
        if(ChatSocket.socket){
            ChatSocket.socket.close();
            console.log("Closed");
        } else{
            console.log("No socket")
        }
    }
}

export class VoiceSocket{
    private httpServer: httpServer;
    private io: Server;
    private socket: Socket

    constructor(socketUrl: string, socketPort: number){
        this.socket = io(`${socketUrl}:${socketPort}/voice`, { autoConnect: false, transports: ["websocket"],forceNew: true });

        this.socket.on("connect_error", (err) => {
            if (err.message === "invalid username") {
                console.log("Bad SocketIo Connection");
                return;
            }
        });
        this.socket.on("get voice chat", (data) => {
            this.io.emit("get voice chat", data);
        });
        this.socket.on("update friends", (roomid: any, friends: any) => {
			const panel = VoiceChatPanel.getPanel(roomid);
			panel?.webview.postMessage({command: "updateFriends", friends});
        })
        this.httpServer = createServer();
        this.io = new Server(this.httpServer, {});
        this.io.on("connection", (socket) => {
            socket.on("send voice chat", (roomid, data) => {
                this.socket.emit("send voice chat", roomid, data)
            })
            socket.on("disconnect", () => {
                console.log("Disconnected");
              });
          });
    }

    
    startVoiceChat(roomid: string, user: IUser){
        if(!this.socket.connected){
            this.socket.connect();
        }
        this.httpServer.listen(0);
        this.socket.emit("join private voice", roomid, user, (friends: any) => {
            const panel = VoiceChatPanel.getPanel(roomid);
            panel?.webview.postMessage({command: "updateFriends", friends});
        })
    }
    
    muteVoiceChat(){
        this.io.emit("mute voice chat");
    }
    endVoiceChat(){
        this.socket.close();
        this.io.close();
        console.log("Closed");
    }

    getSocketInfo(): string{
        const { port } = this.httpServer.address() as AddressInfo
        return `http://[::1]:${port}`;
    }
}

export class CodeSocket{
    private static socket: Socket | undefined;
    constructor(socketUrl: string, socketPort: number){
        CodeSocket.socket = io(`${socketUrl}:${socketPort}/code`, { autoConnect: false, transports: ["websocket"],forceNew: true });
    }

    startSocketIO(){
        if(CodeSocket.socket && !CodeSocket.socket.connected){
            CodeSocket.socket.connect();
            
            CodeSocket.socket.on("connect_error", (err) => {
                if (err.message === "invalid username") {
                    console.log("Bad SocketIo Connection");
                    return;
                }
            });


            CodeSocket.socket.on("get selection change", (file, start, end, user) => {
                CodeHelper.updateSelections(file, start, end, user);
            });

            CodeSocket.socket.on("get file change", async (file, changes) => {
                const _changes = JSON.parse(changes);
                
                const documentChange: vscode.TextDocumentContentChangeEvent = {
                    range: new vscode.Range(
                        _changes.range[0].line,
                        _changes.range[0].character,
                        _changes.range[1].line,
                        _changes.range[1].character),
                    rangeOffset: _changes.rangeOffset,
                    rangeLength: _changes.rangeLength,
                    text: _changes.text,
                };
                console.log(file, _changes)

                await CodeHelper.updateFile(file as string, documentChange);
            });

            CodeSocket.socket.on("readOnly", async (readOnly)=>{
                await CodeHelper.updateReadOnly(readOnly);
            })

            CodeSocket.socket.on("End Session", ()=>{
               CodeSession.endCodeSession();
            })

            CodeSocket.socket.on("get whiteboardchange", (roomid, change, data)=>{
                const panel = WhiteboardPanel.getPanel(roomid);
                console.log(panel, roomid, change, data);
                panel?.webview.postMessage({command: "get whiteboardchange", change, data}); 
            })
        }else{
            console.log("No socket")
        }

    }

    public static socketEmit(command: string, ...args: any[]){
        if(CodeSocket.socket){
            CodeSocket.socket.emit(command, ...args)
        } else{
            console.log("No socket")
        }
    }
    public static endCodeSession(){
        if(CodeSocket.socket){
            CodeSocket.socket.close();
            console.log("Closed");
        } else{
            console.log("No socket")
        }
    }

}
