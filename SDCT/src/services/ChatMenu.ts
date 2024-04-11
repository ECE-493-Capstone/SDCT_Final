import * as vscode from 'vscode';
import { IChatRoom } from '../interfaces/IChatRoom';
import { ChatSocket, CodeSocket } from '../backend/BackendSocket';
import { ChatRoomPanel } from '../panels/ChatRoomPanel';
import { readFileSync } from 'fs';
import {EMessageType} from '../enums/EMessageType'
import path from 'path'
import { IMessage } from '../interfaces/IMessage';
import { CodeSessionPanel } from '../panels/CodeSessionPanel';

export async function chatMenu(chatRoom: IChatRoom) {
    const options = [
        "Send Media", 
        "Send File", 
        "Send Code Message"
    ];
    if (chatRoom.groupId) {
        options.push("Leave Group");
    }

    if (!chatRoom.joinedVoiceChat) {
        options.push("Join Voice Chat");
    }
    if (!chatRoom.joinedCodeSession) {
        options.push("Start Code Session");
        options.push("Join Code Session");
    }

    const chosenOption = await vscode.window.showQuickPick(options);
    if (!!chosenOption) {
        if (chosenOption === "Send Media") {
            await sendMedia(chatRoom);
        } else if (chosenOption === "Send File") {
            await sendFile(chatRoom);
        } else if (chosenOption === "Send Code Message") {
            await handleUserCodeMessage(chatRoom);
        } else if (chosenOption === "Leave Group") {
            leaveGroup(chatRoom);
            return;
        } else if (chosenOption === "Join Voice Chat") {
            joinVoiceChat(chatRoom);
        } else if (chosenOption === "Start Code Session") {
            startCodeSession(chatRoom);
        } else if (chosenOption === "Join Code Session") {
            joinCodeSession(chatRoom);
        }
    }
}

export const sendMedia = async (chatRoom: IChatRoom) => {
    const media = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: {
            'Media': ['png', 'jpg', 'jpeg', 'mp4', 'gif'],
            'All Files': ['*']
        }
    });
    if (!!media) {
        let _file = readFileSync(media[0].fsPath);
        const newMessage = {
            content: _file,
            timestamp: new Date(),
            sender: chatRoom.user,
            type: EMessageType.Media,
            filename: path.basename(media[0].fsPath)
          };
        ChatSocket.socketEmit("send message", ChatRoomPanel.getChatRoomId(chatRoom), chatRoom, newMessage);
    }
};

export const sendFile = async (chatRoom: IChatRoom) => {
    const file = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: {
            'All Files': ['*']
        }
    });
    if (!!file) {
        let _file = readFileSync(file[0].fsPath);
        const newMessage = {
            content: _file,
            timestamp: new Date(),
            sender: chatRoom.user,
            type: EMessageType.File,
            filename: path.basename(file[0].fsPath)
          };
        ChatSocket.socketEmit("send message", ChatRoomPanel.getChatRoomId(chatRoom), chatRoom, newMessage);
    }
};

export const handleUserCodeMessage = async (chatRoom: IChatRoom) => {
    const languages = ["javascript", "python", "java", "c", "c++", "c#", "typescript", "php", "ruby", "swift", "go", "rust", "kotlin", "scala", "r", "shell", "html", "css"];
    const language = await vscode.window.showQuickPick(languages);
    vscode.commands.executeCommand("sdct.handleUserCodeMessage", chatRoom, language);
};

export const joinVoiceChat = (chatRoom: IChatRoom) => {
    vscode.commands.executeCommand("sdct.openVoiceChat", chatRoom);
};

export const startCodeSession = (chatRoom: IChatRoom) => {
    if(CodeSessionPanel.currentPanels.size >= 1){
        vscode.window.showErrorMessage("You may only be in 1 code session at a time")
        return;
    }

    vscode.commands.executeCommand("sdct.startCodeSession", chatRoom);
};

export const joinCodeSession = (chatRoom: IChatRoom) => {
    if(CodeSessionPanel.currentPanels.size >= 1){
        vscode.window.showErrorMessage("You may only be in 1 code session at a time")
        return;
    }

    vscode.commands.executeCommand("sdct.joinCodeSession", chatRoom);
};

export const leaveGroup = (chatRoom: IChatRoom) => {
    vscode.commands.executeCommand("sdct.leaveGroup", chatRoom.groupId);
};
