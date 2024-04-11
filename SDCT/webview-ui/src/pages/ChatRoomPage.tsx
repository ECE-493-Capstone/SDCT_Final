import { VSCodeButton, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useState, useEffect, useRef } from "react";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { vscode } from "../utilities/vscode";
import { IChatRoom } from "../../../src/interfaces/IChatRoom";
import { IMessage } from "../../../src/interfaces/IMessage";
import { EMessageType } from "../../../src/enums/EMessageType";
import { IUser } from "../../../src/interfaces/IUser";

function ChatRoomPage({chatRoom}: {chatRoom: IChatRoom}) {
  const [messageInput, _setMessage] = useState("");
  const messageRef = useRef(messageInput);
  const setMessage = (data: string) => {
    messageRef.current = data;
    _setMessage(data);
  };
  const [messageHistory, setMessageHistory] = useState<IMessage[]>([]);

  const handleNewMessage = (message: IMessage) => {
    let newMessageHistory = [...messageHistory];
    newMessageHistory.push(message);
    setMessageHistory(newMessageHistory);
  };

  useEffect(() => {
    function handleMessage(event: any) {
      const message = event.data;
      switch (message.command) {
        case 'chat':
          const newMessage = {
            content: message.message.content, 
            timestamp: new Date(message.message.timestamp), 
            sender: message.chatRoom.user as IUser,
            type: EMessageType.Text
          };

          handleNewMessage(newMessage);
          setMessage("");
          break;
        case 'media':
          // send media
          const isVideo = message.message.content.toString().endsWith('.mp4');
          const mediaMessage = {
            content: message.message.content, // change with URL of media in server
            timestamp: new Date(message.message.timestamp),
            sender: message.chatRoom.user,
            type: isVideo ? EMessageType.MediaVideo : EMessageType.Media,
          };
          handleNewMessage(mediaMessage);
          break;
        case 'file':
          // send file
          const fileMessage = {
            content: message.message.content, // change with URL of file in server
            timestamp: new Date(message.message.timestamp),
            sender: message.chatRoom.user,
            type: EMessageType.File
          };
          console.log(fileMessage);
          handleNewMessage(fileMessage);
          break;
        case 'code':{
          const codeMessage = {
            content: message.message.content,
            timestamp: new Date(message.message.timestamp),
            sender: message.chatRoom.user,
            type: EMessageType.Code,
            language: message.language
          };
          handleNewMessage(codeMessage);
          break;
        }
        case 'user code':{
          const language = message.language;
          const codeMessage = {
            content: messageRef.current,
            timestamp: new Date(),
            sender: chatRoom.user,
            type: EMessageType.Code,
            language
          };
          console.log(chatRoom);
          vscode.postMessage({
            command: 'sendCodeMessage',
            message: codeMessage,
            chatRoom: chatRoom
          });
          setMessage("");
          break;
        }
        case 'messageHistory':
          const reversedMessageHistory = message.messageHistory.reverse();
          const newMessageHistory = [...reversedMessageHistory];
          newMessageHistory.forEach((msg: IMessage) => {
            msg.timestamp = new Date(msg.timestamp);
            if (msg.type === EMessageType.Media) {
              msg.type =  msg.content.toString().endsWith('.mp4') ? EMessageType.MediaVideo : EMessageType.Media;
            }
          });
          setMessageHistory(newMessageHistory);
          break;
      };
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [messageHistory, chatRoom]);

  const handleOpenMenu = () => {
    vscode.postMessage({
      command: 'openChatRoomMenu',
      chatRoom: chatRoom,
    });
  };

  const handleTextMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newMessage = {
      content: messageInput, 
      timestamp: new Date(), 
      sender: chatRoom.user,
      type: EMessageType.Text
    };

    vscode.postMessage({
      command: 'sendChatMessage',
      message: newMessage,
      chatRoom: chatRoom
      });
    setMessage("");
  };

  const getTimeFormatted = (date: Date) => {
    let hours = date.getHours();
    let minutes: number | string = date.getMinutes();
    let ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 ? hours % 12 : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };
  
  return (
    <main>
      <div className="chatContent">
        {messageHistory.map((message, index) => (
          <div key={index} style={{ textAlign: message.sender.name !== chatRoom.user.name ? 'left' : 'right' }}>
            {message.sender.name !== chatRoom.user.name && !!message.content ? <img src={message.sender.pictureUri} width="20" /> : null}
            {message.type === EMessageType.Text ? <span>{message.content} </span> : null}
            {message.type === EMessageType.Media ? <img src={message.content} width="150" /> : null}
            {message.type === EMessageType.MediaVideo ? 
              <video width="200" height="150" controls>
                <source src={message.content} type="video/mp4" />
                Your browser does not support the video tag.
              </video> : null}
            {message.type === EMessageType.File ? <a href={message.content} download>{message.content}</a> : null}
            {message.type === EMessageType.Code && !!message.content ?
              <SyntaxHighlighter language={message.language} style={docco}>
                {message.content}
              </SyntaxHighlighter> : null}
            {!!message.content && <span>{getTimeFormatted(message.timestamp)}</span>}
            {message.sender.name === chatRoom.user.name && !!message.content ? <img src={message.sender.pictureUri} width="20" /> : null}
          </div>
        ))}
      </div>
      <VSCodeButton className="menuButton" appearance="secondary" onClick={handleOpenMenu}>+</VSCodeButton>
      <form className="chatForm" onSubmit={handleTextMessage}>
        <VSCodeTextField className="chatInput" value={messageInput} onInput={e => {
          const target = e.target as HTMLInputElement;
          setMessage(target.value);
        }}/>
        <VSCodeButton type="submit">Send</VSCodeButton>
      </form>
    </main>
  );
}

export default ChatRoomPage;
