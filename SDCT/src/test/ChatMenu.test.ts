import { assert } from "console";
import { chatMenu, sendMedia, sendFile, handleUserCodeMessage, joinVoiceChat, joinCodeSession, startCodeSession, leaveGroup } from "../services/ChatMenu";
import { IChatRoom } from "../interfaces/IChatRoom";

suite('ChatMenu Test Suite', () => {
	test('ChatMenu main functions', () => {
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
        chatMenu(chatRoom);
	});
    test('sendMedia', () => {
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
        sendMedia(chatRoom);
    });
    test('sendFile', () => {
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
        sendFile(chatRoom);
    });
    test('handleUserCodeMessage', () => {
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
        handleUserCodeMessage(chatRoom);
    });
    test('joinVoiceChat', () => {
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
        joinVoiceChat(chatRoom);
    });
    test('joinCodeSession', () => {
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
        joinCodeSession(chatRoom);
    });
    test('startCodeSession', () => {
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
        startCodeSession(chatRoom);
    });
    test('showGroupMembers', () => {
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
        leaveGroup(chatRoom);
    });
});
