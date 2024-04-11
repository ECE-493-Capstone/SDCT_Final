import { assert } from "console";
import { CodeSession, CodeHelper } from '../services/CodeSession';
import * as vscode from 'vscode';
import { IChatRoom } from "../interfaces/IChatRoom";


class MockExtensionContext implements vscode.ExtensionContext {
    workspaceState!: vscode.Memento;
    globalState!: vscode.Memento & { setKeysForSync(keys: readonly string[]): void; };
    secrets!: vscode.SecretStorage;
    extensionUri!: vscode.Uri;
    environmentVariableCollection!: vscode.GlobalEnvironmentVariableCollection;
    asAbsolutePath(relativePath: string): string {
        throw new Error('Method not implemented.');
    }
    storageUri: vscode.Uri | undefined;
    storagePath: string | undefined;
    globalStorageUri!: vscode.Uri;
    globalStoragePath!: string;
    logUri!: vscode.Uri;
    logPath!: string;
    extensionMode!: vscode.ExtensionMode;
    extension!: vscode.Extension<any>;
    subscriptions: { dispose(): any }[] = [];
    extensionPath: string = '/path/to/extension';
}

suite('CodeSession Test Suite', () => {
	test('CodeSession constructor', () => {
        const mockContext = new MockExtensionContext();
        try {
            const codeSession = new CodeSession(mockContext);
        } catch {}
	});
    test('CodeSession setFilePath', () => {
        const mockContext = new MockExtensionContext();
        try {
            CodeSession.setFilePath('test.py');
        } catch {}
    });
    test('CodeSession startSession', () => {
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
        const mockContext = new MockExtensionContext();
        try {
            const mockContext = new MockExtensionContext();
            const codeSession = new CodeSession(mockContext);
            codeSession.startSession(chatRoom);
        } catch {}
    });
    test('CodeSession endSession', () => {
        const mockContext = new MockExtensionContext();
        try {
            CodeSession.endCodeSession();
        } catch {}
    });
    test('CodeSession joinCodeSession', () => {
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
        try {
            const mockContext = new MockExtensionContext();
            const codeSession = new CodeSession(mockContext);
            codeSession.joinSession(mockContext, chatRoom);
        } catch {}
    });
    test('CodeHelper constructor', () => {
        try {
            const mockContext = new MockExtensionContext();
            const codeHelper = new CodeHelper(mockContext);
        } catch {}
    });
    test('CodeHelper start', () => {
        try {
            const mockContext = new MockExtensionContext();
            const codeHelper = new CodeHelper(mockContext);
            codeHelper.start("325");
        } catch {}
    });
    test('CodeHelper end', () => {
        CodeHelper.endHelper();
    });
    test('CodeHelper updateDecorations', () => {
        CodeHelper.updateDecorations();
    });
    test('CodeHelper updateSelections', () => {
        const startPos = new vscode.Position(0, 0);
        const endPos = new vscode.Position(0, 0);
        CodeHelper.updateSelections("file", startPos, endPos, "user");
    });
    test('CodeHelper UpdateFile', () => {
        const mockChange: vscode.TextDocumentContentChangeEvent = {
            range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)),
            rangeLength: 0,
            text: "",
            rangeOffset: 0
        };
        CodeHelper.updateFile("file", mockChange);
    });
    test('CodeHelper updateReadonly', () => {
        CodeHelper.updateReadOnly(true);
    });
});
