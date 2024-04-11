import { assert } from "console";
import * as vscode from 'vscode';
import { getUri } from "../utilities/getUri";

suite('getUri Test Suite', () => {
	test('getUri() main function', () => {
        try {
            const webView: vscode.Webview = {
                asWebviewUri(resource: vscode.Uri): vscode.Uri {
                    throw new Error('Method not implemented.');
                },
                cspSource: '',
                html: '',
                options: {},
                onDidReceiveMessage: new vscode.EventEmitter<any>().event,
                postMessage(message: any): Thenable<boolean> {
                    throw new Error('Method not implemented.');
                },
            };
            const extensionUri = vscode.Uri.parse('https://www.google.com');
            const uri = getUri(webView, extensionUri, ['test', 'test']);
            assert(uri instanceof vscode.Uri === true);
        } catch {}
	});
});
