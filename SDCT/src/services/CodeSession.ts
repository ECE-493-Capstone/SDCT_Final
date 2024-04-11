import * as tar from 'tar';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { CodeSocket } from '../backend/BackendSocket';
import { readFileSync } from 'fs';
import { ChatRoomPanel } from '../panels/ChatRoomPanel';
import { IChatRoom } from '../interfaces/IChatRoom';
import { IUser } from '../interfaces/IUser'

export class CodeSession {
  private storagePath: string | undefined;
  private static filepath: string | undefined;
  private static _chatRoom: IChatRoom;
  private static isHost: boolean = false;

  constructor(context: vscode.ExtensionContext) {
    this.storagePath = context.globalStorageUri.fsPath;
    if(!fs.existsSync(this.storagePath)){
      fs.mkdirSync(this.storagePath);
    }
	}
  
  public static setFilePath(filepath: string){
    CodeSession.filepath = filepath;
  }

  private async archiveWorkspace(): Promise<string | undefined>{
		let workspacename = vscode.workspace.name;
		let workspacefolders = vscode.workspace.workspaceFolders?.map(folder => folder.uri.fsPath)
		if(workspacename && workspacefolders){ 
        
        let parent = path.dirname(workspacefolders[0]);

        if(workspacefolders.length !== 1 || workspacename.toLowerCase().includes("(workspace)")){
          vscode.window.showErrorMessage('Please open a single folder or a folder without "(workspace)" in it');
          return;
        }
        console.log(parent, `${this.storagePath}/${workspacename}.tar.gz`);
        await tar.c(
          {
            gzip: true,
            file: `${this.storagePath}/${workspacename}.tar.gz`,
            cwd: parent,
          },
          workspacefolders.map(folder => {return folder.split(path.sep).slice(-1)[0]})
        )

        CodeSession.filepath = `${this.storagePath}/${workspacename}.tar.gz`;
		} else{
			vscode.window.showErrorMessage('Please open a Folder');
		}

    return undefined;
  }
  
  private async extractWorkspace(){
    if(CodeSession.filepath){
      if(!fs.existsSync(CodeSession.filepath)){
        console.log("Unable to find tar for session")
        return;
      }

      return tar.x(
        {
          C: this.storagePath, 
          file: CodeSession.filepath
        })
    }
  }

  async startSession(chatRoom: IChatRoom): Promise<boolean>{
    await this.archiveWorkspace();
		if(CodeSession.filepath === undefined){
			console.log("No file");
			return false;
		}
		let _file = readFileSync(CodeSession.filepath);
		return new Promise((resolve, reject) => {
      CodeSocket.socketEmit("start code session", ChatRoomPanel.getChatRoomId(chatRoom), 
													{name: vscode.workspace.name, data: _file}, (response: any) => {
			  console.log(response);
        if(response === "CodeSession Exists"){
          vscode.window.showErrorMessage("CodeSession exists for this room");
          CodeSession.endCodeSession();
        } else if (response === "Started"){
          CodeSession.isHost = true;
          CodeSession._chatRoom = chatRoom;
          resolve(true);
        } else{
          vscode.window.showErrorMessage("Backend Error");
        }
        resolve(false);
		  })
    });
  }

  getSessionFile(){
    if(CodeSession.filepath){
      return CodeSession.filepath
    }
  }

  public static endCodeSession(){
    if(CodeSession.filepath){
      fs.unlink(CodeSession.filepath, (err: any) => {
            if (err) throw err //handle your error the way you want to;
            console.log('file was deleted');//or else the file will be deleted
          });
      fs.unlink(CodeSession.filepath.replace(".tar.gz", ""), (err: any) => {
        if (err) throw err //handle your error the way you want to;
        console.log('file was deleted');//or else the file will be deleted
      });

    }
    if(!CodeSession.isHost && CodeSession.filepath){
      vscode.commands.executeCommand('workbench.action.closeFolder');
    }
    CodeHelper.endHelper();
    CodeSocket.endCodeSession();
  }

  async joinSession(context: vscode.ExtensionContext, chatRoom: IChatRoom): Promise<boolean>{
		CodeSocket.socketEmit("join code session", ChatRoomPanel.getChatRoomId(chatRoom), async (response: any, file: any) => {
        console.log(response);
        if(response === "CodeSession DNE"){
          vscode.window.showErrorMessage("No Codesession for this room");
          CodeSession.endCodeSession();
        } else if (response === "joined"){
          if(vscode.workspace.name){
            vscode.window.showErrorMessage('Please Close Existing Workspace');
            CodeSession.endCodeSession();
            return false;
          } else {
            CodeSession.filepath = `${this.storagePath}/${file.name}.tar.gz`
            fs.writeFileSync(CodeSession.filepath, file.data, {encoding: null});
            if(CodeSession.filepath){
              await this.extractWorkspace()
              await context.globalState.update('codeRoom', {chatRoom: chatRoom, filepath: CodeSession.filepath})
              await vscode.commands.executeCommand(
                'vscode.openFolder', 
                vscode.Uri.file(CodeSession.filepath.replace(".tar.gz", "")),{forceReuseWindow: true});
              return true;
            }
          }
          return false;
        } else{
          vscode.window.showErrorMessage("Backend Error");
        }
      });
      return false;
  }
}

export class CodeHelper{
  private static decorationType = vscode.window.createTextEditorDecorationType({
    borderWidth: '1px',
    borderStyle: 'solid',
    overviewRulerColor: 'blue',
    overviewRulerLane: vscode.OverviewRulerLane.Full,
  });
  private static activeEditor = vscode.window.activeTextEditor;
  private context: vscode.ExtensionContext;
  private static selections: Map<string, vscode.Range> = new Map();
  private static _disposables: vscode.Disposable[] = [];
  private static socketChanges: vscode.TextDocumentContentChangeEvent[] = [];
  private static readOnly: boolean = false;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  start(roomid: string){
    CodeHelper._disposables.push(vscode.window.onDidChangeActiveTextEditor(async editor => {
      CodeHelper.activeEditor = editor;
      if (editor) {
        CodeHelper.selections.clear();
        CodeHelper.updateDecorations();
        if(CodeHelper.readOnly){
          await vscode.commands.executeCommand('workbench.action.files.setActiveEditorReadonlyInSession')
        } else{
          await vscode.commands.executeCommand('workbench.action.files.setActiveEditorWriteableInSession')
        }
      }
    }, null, this.context.subscriptions));
  
    CodeHelper._disposables.push(vscode.workspace.onDidChangeTextDocument(async event => {
        if (CodeHelper.activeEditor && event.document === CodeHelper.activeEditor.document) {
          if(CodeHelper.readOnly){
            await vscode.commands.executeCommand('workbench.action.files.setActiveEditorReadonlyInSession')
          } else{
            await vscode.commands.executeCommand('workbench.action.files.setActiveEditorWriteableInSession')
          }
          CodeHelper.selections.clear();
          CodeHelper.updateDecorations();
        }
      }, null, this.context.subscriptions));

    CodeHelper._disposables.push(vscode.window.onDidChangeTextEditorSelection(event => {
      let workspaceFolders = vscode.workspace.workspaceFolders;
      if(CodeHelper.activeEditor === event.textEditor && workspaceFolders){
        CodeSocket.socketEmit("send selection change", roomid, event.textEditor.document.uri.path.replace(workspaceFolders[0].uri.path, "").replace(/^\/+/, ''), event.selections[0].start, 
          event.selections[0].end, this.context.globalState.get<IUser>('userAuth')?.name);
      }
    }, null, this.context.subscriptions));
  
    CodeHelper._disposables.push(vscode.workspace.onDidChangeTextDocument(event => {
      if(CodeHelper.activeEditor?.document === event.document){

        if(CodeHelper.socketChanges.length >=50){
          CodeHelper.socketChanges.splice(0,10);
        }
        for(let change of event.contentChanges){
          let isSameEdit: boolean = false;
          for(var i = 0; i < CodeHelper.socketChanges.length; i++){
            const item = CodeHelper.socketChanges[i];
            if(item.range.isEqual(change.range) && item.text === change.text){
              CodeHelper.socketChanges.splice(i,1);
              isSameEdit = true;
              break;
            }
          }
          let workspaceFolders = vscode.workspace.workspaceFolders;
          if(!isSameEdit && !CodeHelper.readOnly && workspaceFolders){
            CodeSocket.socketEmit("send file change", roomid, event.document.uri.path.replace(workspaceFolders[0].uri.path, "").replace(/^\/+/, ''), JSON.stringify(change));
          }
        }

      }
    }, null, this.context.subscriptions));
  }

  public static endHelper(){
    while (CodeHelper._disposables.length) {
      const disposable = CodeHelper._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  public static updateDecorations() {
    if (!this.activeEditor) {
      return;
    }
    this.activeEditor.setDecorations(CodeHelper.decorationType, 
      Array.from(CodeHelper.selections, ([hoverMessage, range]) => ({ hoverMessage, range })));
  }

  public static updateSelections(file: string, start: vscode.Position, end: vscode.Position, user: string){
    let workspaceFolders = vscode.workspace.workspaceFolders;
    if(this.activeEditor && workspaceFolders && this.activeEditor.document.uri.path.replace(workspaceFolders[0].uri.path, "").replace(/^\/+/, '') === file){
      CodeHelper.selections.set(user, new vscode.Range(start, end));
      CodeHelper.updateDecorations();
    }
  }

  public static async updateFile(file: string, change: vscode.TextDocumentContentChangeEvent){
    let workspaceFolders = vscode.workspace.workspaceFolders;
    if(workspaceFolders){
      let _file = await vscode.workspace.findFiles(file);
      let _fileOpen = await vscode.workspace.openTextDocument(`${workspaceFolders[0].uri.path}/${file}`);

      let edit = new vscode.WorkspaceEdit();
      edit.replace(_file[0], change.range, change.text)
      vscode.workspace.applyEdit(edit)
      CodeHelper.socketChanges.push(change);
    }
  }

  public static async updateReadOnly(readOnly: boolean){
    CodeHelper.readOnly = readOnly;
    if(CodeHelper.readOnly){
      await vscode.commands.executeCommand('workbench.action.files.setActiveEditorReadonlyInSession')
    } else{
      await vscode.commands.executeCommand('workbench.action.files.setActiveEditorWriteableInSession')
    }
  }
}

