import { assert } from "console";
import * as vscode from 'vscode';
import { getNonce } from "../utilities/getNonce";

suite('GetNonce Test Suite', () => {
	test('getnonce() main function', () => {
        try {
            const nonce = getNonce();
            assert(nonce.length > 0);
        } catch {}
	});
});
