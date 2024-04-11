/*
	This is modified code from the vscode examples at https://github.com/microsoft/vscode-extension-samples/tree/main/github-authentication-sample
	2024-03-19
*/

import * as vscode from 'vscode';
import * as Octokit from '@octokit/rest';

const GITHUB_AUTH_PROVIDER_ID = 'github';
// The GitHub Authentication Provider accepts the scopes described here:
// https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/
const SCOPES = ['user:email'];

export class Credentials {
	private octokit: Octokit.Octokit | undefined;

	async initialize(context: vscode.ExtensionContext): Promise<void> {
		this.registerListeners(context);
	}

	async setOctokit() {
		/**
		 * Set or return an existing octokit
		 * */
		if (this.octokit) {
			return this.octokit;
		}

		const session = await vscode.authentication.getSession(GITHUB_AUTH_PROVIDER_ID, SCOPES, { createIfNone: true });
		this.octokit = new Octokit.Octokit({
			auth: session.accessToken
		});

		return this.octokit;
	}

	registerListeners(context: vscode.ExtensionContext): void {
		/**
		 * If any session changes occur logout
		 */
		context.subscriptions.push(vscode.authentication.onDidChangeSessions(async e => {
			const session = await vscode.authentication.getSession(GITHUB_AUTH_PROVIDER_ID, [], { createIfNone: false, silent: true });
			if(session === undefined){
				vscode.commands.executeCommand("sdct.logout");
				this.octokit = undefined;
			}
		},));
	}
}
