import { assert } from "console";
import * as vscode from 'vscode';
import { BackendAPI } from '../backend/BackendAPI';
import { manageAccount, addFriend, createGroup, acceptInvites, declineInvites } from '../services/ManageAccount';


suite('ManageAccount Test Suite', () => {
	test('manageAcount() main function', () => {
        const backendAPI = new BackendAPI("test", 3000);
        try {
            manageAccount(backendAPI);
        } catch {}
	});
    test('addFriend()', () => {
        const backendAPI = new BackendAPI("test", 3000);
        try {
            addFriend(backendAPI);
        } catch {}
    });
    test('createGroup()', () => {
        const backendAPI = new BackendAPI("test", 3000);
        try {
            createGroup(backendAPI);
        } catch {}
    });
    test('acceptInvites()', () => {
        const backendAPI = new BackendAPI("test", 3000);
        try {
            acceptInvites(backendAPI);
        } catch {}
    });
    test('declineInvites()', () => {
        const backendAPI = new BackendAPI("test", 3000);
        try {
            declineInvites(backendAPI);
        } catch {}
    });
});
