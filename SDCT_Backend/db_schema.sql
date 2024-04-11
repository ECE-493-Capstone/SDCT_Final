drop table if exists User;
drop table if exists ChatGroup;
drop table if exists GroupMembership;
drop table if exists Friend;
drop table if exists FriendMessage;
drop table if exists GroupMessage;
drop table if exists FriendNotification;
drop table if exists GroupNotification;

PRAGMA foreign_keys = ON;

create table User (
  UserId      text,
  ImageURL    text,
  primary key (UserId)
);

create table ChatGroup (
  GroupId     int,
  GroupName   text,
  primary key (GroupId)
);

create table GroupMembership (
  GroupId     int,
  UserId      text,
  ContactTime int,
  primary key (GroupId, UserId),
  foreign key (GroupId) references ChatGroup (GroupId),
  foreign key (UserId) references User (UserId)
);

create table Friend (
  UserId      text,
  FriendId    text,
  ContactTime int,
  primary key (UserId, FriendId),
  foreign key (UserId) references User (UserId),
  foreign key (FriendId) references User (UserId)
);

create table FriendMessage (
  MessageId   int,
  SendId      text,
  RecvId      text,
  MessageType int,
  MessageTime int,
  MessageText text,
  MessageLoc  text,
  primary key (MessageId),
  foreign key (SendId) references User (UserId),
  foreign key (RecvId) references User (UserId)
);

create table GroupMessage (
  MessageId   int,
  SendId      text,
  GroupId     int,
  MessageType int,
  MessageTime int,
  MessageText text,
  MessageLoc  text,
  primary key (MessageId),
  foreign key (SendId) references User (UserId),
  foreign key (GroupId) references ChatGroup (GroupId)
);

create table FriendNotification (
  UserId      text,
  FriendId    text,
  NotifCount  int,
  primary key (UserId, FriendId),
  foreign key (UserId) references User (UserId),
  foreign key (FriendId) references User (UserId)
);

create table GroupNotification (
  UserId      text,
  GroupId     int,
  NotifCount  int,
  primary key (UserId, GroupId),
  foreign key (UserId) references User (UserId),
  foreign key (GroupId) references ChatGroup (GroupId)
);