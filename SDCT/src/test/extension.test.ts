import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../extension';

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

suite('Extension Test Suite', () => {
	test('activate', () => {
		const mockContext = new MockExtensionContext();
        try {
            myExtension.activate(mockContext);
        } catch {}
	});
    test('deactivate', () => {
        const mockContext = new MockExtensionContext();
        try {
            myExtension.deactivate(mockContext);
        } catch {}
    });
});
