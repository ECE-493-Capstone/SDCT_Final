import * as assert from 'assert';
import * as vscode from 'vscode';
import { WhiteboardPanel } from '../panels/WhiteboardPanel';
import { IMessage } from '../interfaces/IMessage';
import { EMessageType } from '../enums/EMessageType';
import { IChatRoom } from '../interfaces/IChatRoom';

suite('WhiteboardPanel test', () => {
    test('render()', () => {
        const chatRoom: IChatRoom = {
            name: "Test Chat Room",
            user: {
                name: "Test User",
                pictureUri: "https://www.google.com"
            },
            friends: [
                {
                    name: "Test Friend",
                    pictureUri: "https://www.google.com",
                    friendid: "123",
                }
            ],
            joinedVoiceChat: false,
            joinedCodeSession: false,
            friendId: "123"
        };
        const uri = vscode.Uri.parse("https://www.google.com");
        WhiteboardPanel.render(uri, chatRoom);
    });
});
