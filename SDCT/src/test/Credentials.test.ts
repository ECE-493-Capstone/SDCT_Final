import { assert } from "console";
import * as vscode from 'vscode';
import { Credentials } from "../services/Credentials";

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

suite('Credentials Test Suite', () => {
	test('initialize', () => {
        const credentials = new Credentials();
        const mockContext = new MockExtensionContext();
        try {
            credentials.initialize(mockContext);
        } catch {}
	});
    test('setOctokit', () => {
        const credentials = new Credentials();
        try {
            credentials.setOctokit();
        } catch {}
    });
    test('registerListeners', () => {
        const credentials = new Credentials();
        const mockContext = new MockExtensionContext();
        try {
            credentials.registerListeners(mockContext);
        } catch {}
    });
});
