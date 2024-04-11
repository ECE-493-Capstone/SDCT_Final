import { assert } from "console";
import { ChatSocket, VoiceSocket, CodeSocket } from '../backend/BackendSocket';
import { IUser } from "../interfaces/IUser";

suite('BackendSocket Test Suite', () => {
	test('ChatSocket constructor', () => {
		const chatSocket = new ChatSocket("mockURL", 123);
        assert(chatSocket instanceof ChatSocket === true);
	});
    test('ChatScoket startSocketIO()', () => {
        const chatSocket = new ChatSocket("mockURL", 123);
        chatSocket.startSocketIO();
        assert(chatSocket instanceof ChatSocket === true);
    });
    test('ChatSocket socketEmit()', () => {
        const chatSocket = new ChatSocket("mockURL", 123);
        chatSocket.startSocketIO();
        ChatSocket.socketEmit("mockEvent", "mockData");
        assert(chatSocket instanceof ChatSocket === true);
    });
    test('ChatSocket endSocket()', () => {
        const chatSocket = new ChatSocket("mockURL", 123);
        chatSocket.startSocketIO();
        ChatSocket.endSocket();
        assert(chatSocket instanceof ChatSocket === true);
    });
    test('VoiceSocket constructor', () => {
        const voiceSocket = new VoiceSocket("mockURL", 123);
        assert(voiceSocket instanceof VoiceSocket === true);
    });
    test('VoiceScoket startVoiceChat()', () => {
        const voiceSocket = new VoiceSocket("mockURL", 123);
        const user: IUser = {
            name: "test",
            pictureUri: "http"
        };
        voiceSocket.startVoiceChat("mockRoomID", user);
        assert(voiceSocket instanceof VoiceSocket === true);
    });
    test('VoiceSocket muteVoiceChat()', () => {
        const voiceSocket = new VoiceSocket("mockURL", 123);
        const user: IUser = {
            name: "test",
            pictureUri: "http"
        };
        voiceSocket.startVoiceChat("mockRoomID", user);
        voiceSocket.muteVoiceChat();
        assert(voiceSocket instanceof VoiceSocket === true);
    });
    test("VoiceSocket endVoiceChat()", () => {
        const voiceSocket = new VoiceSocket("mockURL", 123);
        const user: IUser = {
            name: "test",
            pictureUri: "http"
        };
        voiceSocket.startVoiceChat("mockRoomID", user);
        voiceSocket.endVoiceChat();
        assert(voiceSocket instanceof VoiceSocket === true);
    });
    test('CodeSocket constructor', () => {
        const codeSocket = new CodeSocket("mockURL", 123);
        assert(codeSocket instanceof CodeSocket === true);
    });
    test('CodeSocket startSocketIO()', () => {
        const codeSocket = new CodeSocket("mockURL", 123);
        codeSocket.startSocketIO();
        assert(codeSocket instanceof CodeSocket === true);
    });
    test('CodeSocket socketEmit()', () => {
        const codeSocket = new CodeSocket("mockURL", 123);
        codeSocket.startSocketIO();
        CodeSocket.socketEmit("mockEvent", "mockData");
        assert(codeSocket instanceof CodeSocket === true);
    });
    test('CodeSocket endCodeSession()', () => {
        const codeSocket = new CodeSocket("mockURL", 123);
        codeSocket.startSocketIO();
        CodeSocket.endCodeSession();
        assert(codeSocket instanceof CodeSocket === true);
    });
});
