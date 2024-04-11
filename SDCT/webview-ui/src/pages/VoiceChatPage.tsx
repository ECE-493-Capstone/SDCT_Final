import { VSCodeButton, } from "@vscode/webview-ui-toolkit/react";
import { useState, useEffect } from "react";
import { vscode } from "../utilities/vscode";
import { IChatRoom } from "../../../src/interfaces/IChatRoom";

function VoiceChatPage({chatRoom}: {chatRoom: IChatRoom}) {
  const [isMuted, setIsMuted] = useState(false);

  const handleMute = () => {
    setIsMuted(!isMuted);
    vscode.postMessage({command: 'muteVoiceChat'});
  };

  const handleEndCall = () => {
    vscode.postMessage({command: 'endVoiceChat'});
  };

  return (
    <main>
      <img src={chatRoom?.user.pictureUri} width="100" />
      {chatRoom?.friends.map(friend => (
        <img key={friend.name} src={friend.pictureUri} width="100" />
      ))}
      <br/>
      <span>{chatRoom?.user.name + "\t"}</span>
      {chatRoom?.friends.map(friend => (
        <span key={friend.name}>{friend.name + "\t"}</span>
      ))}
      <br/>
      <VSCodeButton appearance={isMuted ? "primary" : "secondary"} onClick={handleMute}>{isMuted ? "🔇" : "🔈"}</VSCodeButton>
      <VSCodeButton appearance="primary" onClick={handleEndCall}>End Call</VSCodeButton>
    </main>
  );
}

export default VoiceChatPage;
