import * as vscode from 'vscode';
import { ProfileProvider } from '../providers/ProfileProvider';

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

suite('ProfileProvider test', () => {
    const mockContext = new MockExtensionContext();
    test('constructor()', () => {
        try {
            const provider = new ProfileProvider(mockContext)
        }
        catch {}
    });
    test('refresh()', () => {
        const mockContext = new MockExtensionContext();

        try {
            const provider = new ProfileProvider(mockContext);
            provider.refresh(mockContext);
        } catch {}
    });
    test('getTreeItem()', () => {
        const mockContext = new MockExtensionContext();

        try {
            const provider = new ProfileProvider(mockContext);
            provider.getTreeItem({
                name: 'name',
                pictureUri: 'http://localhost:3000',
            });
        } catch {}
    });
    test('getChildren()', () => {
        const mockContext = new MockExtensionContext();

        try {
            const provider = new ProfileProvider(mockContext);
            provider.getChildren();
        } catch {}
    });
});
