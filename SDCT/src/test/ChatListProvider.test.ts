import * as vscode from 'vscode';
import { ChatListProvider } from '../providers/ChatListProvider';
import { BackendAPI } from '../backend/BackendAPI';

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

suite('ChatListProvider test', () => {
    const mockContext = new MockExtensionContext();
    const backendApi = new BackendAPI("http://localhost:3000", 3000);
    test('constructor()', () => {
        try {
            const provider = new ChatListProvider(mockContext, backendApi)
        }
        catch {}
    });
    test('refresh()', () => {
        const mockContext = new MockExtensionContext();
        const backendAPI = new BackendAPI("http://localhost:3000", 3000);
        try {
            const provider = new ChatListProvider(mockContext, backendAPI);
            provider.refresh(mockContext);
        } catch {}
    });
    test('getTreeItem()', () => {
        const mockContext = new MockExtensionContext();
        const backendAPI = new BackendAPI("http://localhost:3000", 3000);
        try {
            const provider = new ChatListProvider(mockContext, backendAPI);
            provider.getTreeItem({
                name: 'name',
                notificationCount: 0,
                voiceChatActive: false,
                codeSessionActive: false,
                pictureUri: 'http://localhost:3000',
                lastMessage: 'lastMessage',
                lastMessageTime: new Date(),
            });
        } catch {}
    });
    test('getChildren()', () => {
        const mockContext = new MockExtensionContext();
        const backendAPI = new BackendAPI("http://localhost:3000", 3000);
        try {
            const provider = new ChatListProvider(mockContext, backendAPI);
            provider.getChildren();
        } catch {}
    });
    test('getData()', () => {
        const mockContext = new MockExtensionContext();
        const backendAPI = new BackendAPI("http://localhost:3000", 3000);
        try {
            const provider = new ChatListProvider(mockContext, backendAPI);
            provider.getData();
        } catch {}
    });
    test('searchChatList()', () => {
        const mockContext = new MockExtensionContext();
        const backendAPI = new BackendAPI("http://localhost:3000", 3000);
        try {
            const provider = new ChatListProvider(mockContext, backendAPI);
            provider.searchChatList();
        } catch {}
    });
});
