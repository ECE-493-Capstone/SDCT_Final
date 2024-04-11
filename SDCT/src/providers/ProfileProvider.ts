import * as vscode from 'vscode';
import { IUser } from '../interfaces/IUser';

export class ProfileProvider implements vscode.TreeDataProvider<IUser> {
  private userAuth: IUser | undefined;
  private _onDidChangeTreeData: vscode.EventEmitter<IUser | undefined | null | void> = new vscode.EventEmitter<IUser | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<IUser | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(context: vscode.ExtensionContext): void {
    this.userAuth = context.globalState.get<IUser>('userAuth');
    this._onDidChangeTreeData.fire();
  }

  constructor(context: vscode.ExtensionContext) {
    this.userAuth = context.globalState.get<IUser>('userAuth');
  }

  getTreeItem(element: IUser): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(element.name);
    treeItem.iconPath = vscode.Uri.parse(element.pictureUri);
    return treeItem;
  }

  getChildren(): IUser[] | Thenable<IUser[]> {
    let data = [];
    if (!!this.userAuth) {
      data.push({
        name: this.userAuth.name,
        pictureUri: this.userAuth.pictureUri
      });
    }
    return data;
  }
}
