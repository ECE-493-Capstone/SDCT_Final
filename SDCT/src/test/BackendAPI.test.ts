import { assert } from "console";
import { IUser } from "../interfaces/IUser";
import { IChatRoom } from "../interfaces/IChatRoom";
import { BackendAPI } from '../backend/BackendAPI';

suite('BackendAPI Test Suite', () => {
    test('Test constructor()', () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        assert(backendAPI instanceof BackendAPI === true);
    });

    test('Test login()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const user: IUser = {
            name: "mockName",
            pictureUri: "mockUri"
        };
        let res: Boolean = false;
        res = await backendAPI.login(user);
        assert(res instanceof Boolean === true);
    });

    test('Test getFriends()' , async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const friends = await backendAPI.getFriends();
        assert(friends instanceof Array === true);
    });

    test('Test getGroups()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const groups = await backendAPI.getGroups();
        assert(groups instanceof Array === true);
    });

    test('Test addFriend()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const res: any = await backendAPI.addFriend("mockFriend");
        assert(res instanceof Boolean === true);
    });

    test('Test getInvites()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const invites = await backendAPI.getInvites();
        assert(invites instanceof Array === true);
    });

    test('Test acceptFriendInvite()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const res: any = await backendAPI.acceptFriendInvite("mockFriend");
        assert(res instanceof Boolean === true);
    });

    test('Test declienFriendInvite()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const res: any = await backendAPI.declineFriendInvite("mockFriend");
        assert(res instanceof Boolean === true);
    });

    test('Test createGroup()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const res: any = await backendAPI.createGroup("mockGroup");
        assert(res instanceof Boolean === true);
    });

    test('Test addUserToGroup()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const res: any = await backendAPI.addUserToGroup(123, "mockUser");
        assert(res instanceof Boolean === true);
    });

    test('Test acceptGroupInvite()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const res: any = await backendAPI.acceptGroupInvite("mockGroup");
        assert(res instanceof Boolean === true);
    });

    test('Test declineGroupInvite()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const res: any = await backendAPI.declineGroupInvite("mockGroup");
        assert(res instanceof Boolean === true);
    });

    test('Test getFriendMessageHistory()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
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
        const messages = await backendAPI.getFriendMessageHistory(chatRoom);
        assert(messages instanceof Array === true);
    });

    test('Test getGroupMessageHistory()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
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
        const messages = await backendAPI.getGroupMessageHistory(chatRoom);
        assert(messages instanceof Array === true);
    });
});
