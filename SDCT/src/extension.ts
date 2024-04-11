// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ChatListProvider } from './providers/ChatListProvider';
import { ProfileProvider } from './providers/ProfileProvider';
import { manageAccount } from './services/ManageAccount';
import { IUser } from './interfaces/IUser';
import { Credentials } from './services/Credentials';
import { ChatRoomPanel } from './panels/ChatRoomPanel';
import { VoiceChatPanel } from './panels/VoiceChatPanel';
import { CodeSessionPanel } from './panels/CodeSessionPanel';
import { IChatRoom } from './interfaces/IChatRoom';
import { chatMenu } from './services/ChatMenu';
import { IChat } from './interfaces/IChat';
import { BackendAPI } from './backend/BackendAPI';
import { ChatSocket, CodeSocket, VoiceSocket } from './backend/BackendSocket'
import { IMessage } from './interfaces/IMessage';
import { IFriend } from "./interfaces/IFriend"
import { spawn, ChildProcessWithoutNullStreams} from "child_process"
import { WhiteboardPanel } from './panels/WhiteboardPanel';
import { EMessageType }from './enums/EMessageType'
import { CodeSession, CodeHelper } from './services/CodeSession'

const BackendURL = "http://[2605:fd00:4:1000:f816:3eff:fe7d:baf9]";
const ApiPort = 8000;
const SocketPort = 3000;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "SDCT" is now active!');
	
	const credentials = new Credentials();
	await credentials.initialize(context);
	
	const backendAPI = new BackendAPI(BackendURL, ApiPort);
	const chatSocket = new ChatSocket(BackendURL, SocketPort);
	const voiceSocket = new VoiceSocket(BackendURL, SocketPort)
	const codeSocket = new CodeSocket(BackendURL, SocketPort);

	const codeSession = new CodeSession(context);
	const codeDecorator = new CodeHelper(context);

	const joinedCodeSession = context.globalState.get<{chatRoom: IChatRoom, filepath: string}>('codeRoom');
	if(joinedCodeSession){
		codeSocket.startSocketIO()
		CodeSession.setFilePath(joinedCodeSession.filepath)
		vscode.commands.executeCommand('sdct.openCodeSession', joinedCodeSession.chatRoom);
		CodeSocket.socketEmit("join code session", CodeSessionPanel.getCodeSessionRoomId(joinedCodeSession.chatRoom));
		await context.globalState.update('codeRoom', undefined);
	}
	const chatListProvider = new ChatListProvider(context, backendAPI);
	vscode.window.createTreeView('chatList', {
		treeDataProvider: chatListProvider
	});
	const notificationInterval = setInterval(chatListProvider.notificationUpdate.bind(chatListProvider), 5000);

	const profileProvider = new ProfileProvider(context);
	vscode.window.createTreeView('profile', {
		treeDataProvider: profileProvider
	});

	const user = context.globalState.get<IUser>('userAuth')
	if(user){
		chatSocket.startSocketIO();
		backendAPI.updateUser(user)
		await chatListProvider.refresh(context);
		profileProvider.refresh(context);
	}

	var voiceSession: ChildProcessWithoutNullStreams;
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const loginDisposable = vscode.commands.registerCommand('sdct.login', async () => {
		// The code you place here will be executed every time your command is executed
		const octokit = await credentials.setOctokit();
		const userInfo = await octokit.users.getAuthenticated();

		const userAuth: IUser = {
			name: userInfo.data.login,
			pictureUri: userInfo.data.avatar_url
		};
		chatSocket.startSocketIO();
		backendAPI.login(userAuth).then(async (success) =>{
			if(success){
				context.globalState.update('userAuth', userAuth);
				await chatListProvider.refresh(context);
				profileProvider.refresh(context);
				console.log("Login Success");
			}else{
				console.log("Login Failure");
			}

		}).catch(err => {
			console.log("Login Error", err);
		})
	});

	const logoutDisposable = vscode.commands.registerCommand('sdct.logout', async () => {
		context.globalState.update('userAuth', undefined);
		await chatListProvider.refresh(context);
		profileProvider.refresh(context);
	});

	const searchChatDisposable = vscode.commands.registerCommand('sdct.searchChat', () => {
		chatListProvider.searchChatList();
	});

	const manageAccountDisposable = vscode.commands.registerCommand('sdct.manageAccount', async () => {
		await manageAccount(backendAPI);
		await chatListProvider.refresh(context);
	});

	const leaveGroupDisposable = vscode.commands.registerCommand('sdct.leaveGroup', async (groupId: string) => {
		if(groupId){
			await backendAPI.leaveGroup(groupId)
			await chatListProvider.refresh(context);
		}
	});

	const openChatRoomDisposable = vscode.commands.registerCommand("sdct.openChatRoom", async (chat: IChat) => {

		const userAuth = context.globalState.get<IUser>('userAuth');
		const emptyUser: IUser = { name: "", pictureUri: "" };
		const user = userAuth ? userAuth : emptyUser;
		const friends: IFriend[] = [];
		if (chat.friendId) {
			const friend: IFriend = { name: chat.name, friendid: chat.friendId,pictureUri: chat.pictureUri };
			friends.push(friend);
		}
		const chatRoom: IChatRoom = {
			name: chat.name,
			user,
			friends,
			joinedVoiceChat: false, 
			joinedCodeSession: false,
			friendId: chat.friendId,
			groupId: chat.groupId
		};
		
		if(chatRoom.groupId){
			backendAPI.clearGroupNotifications(chatRoom.groupId)
		} else{
			backendAPI.clearFriendNotifications(chatRoom.name)
		}

		if(ChatRoomPanel.currentPanels.has(ChatRoomPanel.getChatRoomId(chatRoom))){
			ChatRoomPanel.render(context.extensionUri, chatRoom);
			return;
		}
		ChatRoomPanel.render(context.extensionUri, chatRoom);

		let messageHistory: IMessage[] = []
		if(chatRoom.friendId){
			messageHistory = await backendAPI.getFriendMessageHistory(chatRoom);
		} else{
			messageHistory = await backendAPI.getGroupMessageHistory(chatRoom);
		}
		const panel = ChatRoomPanel.getPanel(ChatRoomPanel.getChatRoomId(chatRoom));
		if(panel){
			panel.webview.postMessage({command: "messageHistory", messageHistory});
		}

		ChatSocket.socketEmit("join chat", ChatRoomPanel.getChatRoomId(chatRoom));
	});

	const openChatRoomMenuDisposable = vscode.commands.registerCommand("sdct.openChatRoomMenu", (chatRoom: IChatRoom) => {
		chatMenu(chatRoom);
	});

	const openVoiceChatDisposable = vscode.commands.registerCommand("sdct.openVoiceChat", (chatRoom: IChatRoom) => {
		const chatRooms = [...chatListProvider.getCurrentData()];
		const chatRoomId = ChatRoomPanel.getChatRoomId(chatRoom);
		const chatRoomIndex = chatRooms.findIndex(chat => {
			const chatId = chat.groupId ? chat.groupId : chat.friendId;
			return chatId === chatRoomId;
		});
		// Validate only one voicechat at a time
		if(VoiceChatPanel.currentPanels.size >= 1){
			vscode.window.showErrorMessage("You may only be in 1 voicechat at a time")
			return;
		}

		chatRooms[chatRoomIndex].voiceChatActive = true;
		chatListProvider.setData(chatRooms);
		VoiceChatPanel.render(context.extensionUri, chatRoom);

		voiceSocket.startVoiceChat(chatRoomId, chatRoom.user);

		voiceSession = spawn('python3',["out/python/audio_socketio.py", voiceSocket.getSocketInfo(), chatRoomId], {cwd: context.extensionPath});
		voiceSession.stdout.on("data", (data) => {
			console.log(`stdout: ${data}`);
		  });
		  
		voiceSession.stderr.on("data", (data) => {
			console.error(`stderr: ${data}`);
		});
		
		voiceSession.on("close", (code) => {
			console.log(`child process exited with code ${code}`);
		});
	});

	const startCodeSessionDisposable = vscode.commands.registerCommand("sdct.startCodeSession", async (chatRoom: IChatRoom) => {
		codeSocket.startSocketIO();
		if(await codeSession.startSession(chatRoom)){
			vscode.commands.executeCommand('sdct.openCodeSession', chatRoom);
			const panel = CodeSessionPanel.getPanel(CodeSessionPanel.getCodeSessionRoomId(chatRoom));
			panel?.webview.postMessage({command: "host"});
		} else{
			console.log("Failed to start codesession")
		}
	});

	const joinCodeSessionDisposable = vscode.commands.registerCommand("sdct.joinCodeSession", async (chatRoom: IChatRoom) => {
		codeSocket.startSocketIO();
		if(!await codeSession.joinSession(context, chatRoom)){
			console.log("Failed to join codesession")
		}
	});

	const openCodeSessionDisposable = vscode.commands.registerCommand("sdct.openCodeSession", (chatRoom: IChatRoom) => {
		const chatRooms = [...chatListProvider.getCurrentData()];
		const chatRoomId = ChatRoomPanel.getChatRoomId(chatRoom);
		const chatRoomIndex = chatRooms.findIndex(chat => {
			const chatId = chat.groupId ? chat.groupId : chat.friendId;
			return chatId === chatRoomId;
		});
		
		chatRooms[chatRoomIndex].codeSessionActive = true;
		chatListProvider.setData(chatRooms);
		CodeSessionPanel.render(context.extensionUri, chatRoom);
		codeDecorator.start(chatRoomId);
	});

	const openWhiteboardDisposable = vscode.commands.registerCommand("sdct.openWhiteboard", (chatRoom: IChatRoom) => {
		WhiteboardPanel.render(context.extensionUri, chatRoom);
	});

	const sendChatMessageDisposable = vscode.commands.registerCommand("sdct.sendChatMessage", (chatRoom: IChatRoom, message: IMessage) => {
		const panel = ChatRoomPanel.getPanel(ChatRoomPanel.getChatRoomId(chatRoom));
		panel?.webview.postMessage({command: "chat", message, chatRoom});

		if(panel){
			if(chatRoom.groupId){
				backendAPI.clearGroupNotifications(chatRoom.groupId)
			} else{
				backendAPI.clearFriendNotifications(chatRoom.user.name)
			}
		}
	});

	const sendMediaDisposable = vscode.commands.registerCommand("sdct.sendMedia", (chatRoom: IChatRoom, message: IMessage) => {
		const panel = ChatRoomPanel.getPanel(ChatRoomPanel.getChatRoomId(chatRoom));
		panel?.webview.postMessage({command: "media", message, chatRoom});

		if(panel){
			if(chatRoom.groupId){
				backendAPI.clearGroupNotifications(chatRoom.groupId)
			} else{
				backendAPI.clearFriendNotifications(chatRoom.user.name)
			}
		}
	});

	const sendFileDisposable = vscode.commands.registerCommand("sdct.sendFile", (chatRoom: IChatRoom, message: IMessage) => {
		const panel = ChatRoomPanel.getPanel(ChatRoomPanel.getChatRoomId(chatRoom));
		panel?.webview.postMessage({command: "file", message, chatRoom});

		if(panel){
			if(chatRoom.groupId){
				backendAPI.clearGroupNotifications(chatRoom.groupId)
			} else{
				backendAPI.clearFriendNotifications(chatRoom.user.name)
			}
		}
	});

	const sendCodeMessageDisposable = vscode.commands.registerCommand("sdct.sendCodeMessage", (chatRoom: IChatRoom, message: IMessage) => {
		const panel = ChatRoomPanel.getPanel(ChatRoomPanel.getChatRoomId(chatRoom));
		panel?.webview.postMessage({command: "code", message, chatRoom});

		if(panel){
			if(chatRoom.groupId){
				backendAPI.clearGroupNotifications(chatRoom.groupId)
			} else{
				backendAPI.clearFriendNotifications(chatRoom.user.name)
			}
		}
	});

	const handleUserCodeMessageDisposable = vscode.commands.registerCommand("sdct.handleUserCodeMessage", (chatRoom: IChatRoom, language: string) => {
		const panel = ChatRoomPanel.getPanel(ChatRoomPanel.getChatRoomId(chatRoom));
		panel?.webview.postMessage({command: "user code", language});
	});

	const muteVoiceChatDisposable = vscode.commands.registerCommand("sdct.muteVoiceChat", () => {
		console.log("mute");
		voiceSocket.muteVoiceChat();
	});

	const endVoiceChatDisposable = vscode.commands.registerCommand("sdct.endVoiceChat", () => {
		console.log("kill");
		voiceSocket.endVoiceChat();
		voiceSession.kill();
	});

	const mockLogin = vscode.commands.registerCommand("sdct.mockLogin", () => {
		const userAuth: IUser = {
			name: "MOCKUSER",
			pictureUri: "adada"
		};
		chatSocket.startSocketIO();
		backendAPI.login(userAuth).then(async (success) => {
			if(success){
				context.globalState.update('userAuth', userAuth);
				await chatListProvider.refresh(context);
				profileProvider.refresh(context);
				console.log("Login Success");
			}else{
				console.log("Login Failure");
			}

		}).catch(err => {
			console.log("Login Error", err);
		});
	});

	context.subscriptions.push(
		mockLogin,
		loginDisposable,
		logoutDisposable, 
		searchChatDisposable, 
		manageAccountDisposable, 
		leaveGroupDisposable,
		openChatRoomDisposable, 
		openChatRoomMenuDisposable, 
		openVoiceChatDisposable,
		startCodeSessionDisposable,
		joinCodeSessionDisposable,
		openCodeSessionDisposable,
		sendChatMessageDisposable,
		sendMediaDisposable,
		sendFileDisposable,
		handleUserCodeMessageDisposable,
		sendCodeMessageDisposable,
		muteVoiceChatDisposable,
		endVoiceChatDisposable,
		openWhiteboardDisposable
	);
}

// This method is called when your extension is deactivated
export function deactivate(context: vscode.ExtensionContext) {
	CodeSession.endCodeSession();
	vscode.commands.executeCommand('sdct.endVoiceChat');
	ChatSocket.endSocket();
}
