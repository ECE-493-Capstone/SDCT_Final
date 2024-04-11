import { useState, useEffect, useRef } from "react";
import { EPage } from "../../src/enums/EPage";
import "./App.css";
import ChatRoomPage from "./pages/ChatRoomPage";
import VoiceChatPage from "./pages/VoiceChatPage";
import CodeSessionPage from "./pages/CodeSessionPage";
import WhiteboardPage from "./pages/WhiteboardPage";
import { IChatRoom } from "../../src/interfaces/IChatRoom";

const defaultChatRoom: IChatRoom = {name: "", user: {name: "", pictureUri: ""}, friends: [], joinedCodeSession: false, joinedVoiceChat: false};

function App() {
  const [page, setPage] = useState<EPage>(EPage.ChatRoom);
  const [chatRoom, setChatRoom] = useState<IChatRoom>(defaultChatRoom);

  useEffect(() => {
    function handleMessage(event: any) {
      const message = event.data;
      switch (message.command) {
        case 'route':
          setPage(message.page);
          break;
        case 'initChatRoom':
          setChatRoom(message.chatRoom);
          break;
        case 'updateFriends':
          let newChatRoom = structuredClone(chatRoom)
          newChatRoom.friends = message.friends.filter((item: any) => item.name != chatRoom.user.name);
          setChatRoom(newChatRoom);
          break;
      };
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [page, chatRoom]);

  return (
    <main>
      {page === EPage.ChatRoom && <ChatRoomPage chatRoom={chatRoom}/>}
      {page === EPage.VoiceChat && <VoiceChatPage chatRoom={chatRoom}/>}
      {page === EPage.CodeSession && <CodeSessionPage chatRoom={chatRoom}/>}
      {page === EPage.Whiteboard && <WhiteboardPage chatRoom={chatRoom}/>}
    </main>
  );
}

export default App;
