import { render } from "@testing-library/react";
import WhiteboardPage from "../pages/WhiteboardPage";
import '@testing-library/jest-dom';
import { IChatRoom } from "../../../src/interfaces/IChatRoom";

test('Renders App', () => {
    const chatRoom: IChatRoom = {
        name: "Test Chat Room",
        user: {
            name: "Test User",
            pictureUri: "https://www.google.com"
        },
        friends: [],
        joinedVoiceChat: false,
        joinedCodeSession: false

    };
    render(<WhiteboardPage chatRoom={chatRoom}/>);
    expect(true).toBeTruthy();
});