var sqlite3 = require('sqlite3').verbose()
const fs = require('fs');

const DBSOURCE = "sdct.db"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        console.log('ENSURE DATABASE SCHEMA HAS BEEN PRE_CONFIGURED BEFORE RUNNING')
    }
});

const uploadResource = (name, time, data) =>{

  const file_name = time+ name;
  // Move the uploaded image to our upload folder

  fs.writeFileSync(__dirname + `/upload/${file_name}`, data, {encoding: null});

  return `http://[2605:fd00:4:1000:f816:3eff:fe7d:baf9]:8000/upload/${file_name}`;

}

const saveGroupMessage = (message, groupid) =>{
  var data = {
    SendId : message.sender.name,
    GroupId : groupid,
    MessageType : message.type,
    MessageText : message.content,
    MessageLoc : "",

    MessageTime: Math.floor(new Date().getTime() / 1000)
  }
  var sql =`
  INSERT INTO GroupMessage (MessageId, SendId, GroupId, MessageType, MessageTime, MessageText, MessageLoc) VALUES
  (COALESCE((SELECT MAX(MessageId) FROM GroupMessage),0) + 1, ?, ?, ?, ?, ?, ? );`

  var params =[data.SendId, data.GroupId, data.MessageType, data.MessageTime, data.MessageText, data.MessageLoc ]
  db.run(sql, params, function (err, result) {
      if (err){
          console.log(err);
          return false;
      }
      return true;
  });
  notifyGroup(message, groupid);
}

const saveFriendMessage = (message, friendname) =>{
  var data = {
    SendId : message.sender.name,
    RecvId : friendname,
    MessageType : message.type,
    MessageText : message.content,
    MessageLoc : "",

    MessageTime: Math.floor(new Date().getTime() / 1000)
  }
  var sql =`
  INSERT INTO FriendMessage (MessageId, SendId, RecvId, MessageType, MessageTime, MessageText, MessageLoc) VALUES
  (COALESCE((SELECT MAX(MessageId) FROM FriendMessage),0) + 1, ?, ?, ?, ?, ?, ? );`

  var params =[data.SendId, data.RecvId, data.MessageType, data.MessageTime, data.MessageText, data.MessageLoc]
  db.run(sql, params, function (err, result) {
      if (err){
          console.log(err);
          return false;
      }
      return true;
  });
  notifyFriend(message, friendname);
}

const notifyFriend = (message, friendname) =>{
  var data = {
    SendId : message.sender.name,
    RecvId : friendname,
  }
  var sql =`
  INSERT INTO FriendNotification (UserId, FriendId, NotifCount)
  VALUES(?, ?, 1)
  ON CONFLICT(UserId, FriendId) DO UPDATE SET
    NotifCount = NotifCount + 1
  WHERE UserId = ? AND FriendId = ?;`

  var params =[data.RecvId, data.SendId, data.RecvId, data.SendId]
  db.run(sql, params, function (err, result) {
      if (err){
          console.log(err);
          return false;
      }
      return true;
  });
}

const notifyGroup = (message, GroupId) =>{
  var data = {
    SendId : message.sender.name,
    GroupId : GroupId,
  }
  var sql =`
  INSERT INTO GroupNotification (UserId, GroupId, NotifCount)
  SELECT g1.UserId, ?, 1
    FROM GroupMembership as g1
    WHERE (GroupId = ?) AND (g1.UserId != ?)

  ON CONFLICT(UserId, GroupId) DO UPDATE SET
    NotifCount = NotifCount + 1;`

  var params =[data.GroupId, data.GroupId, data.SendId]
  db.run(sql, params, function (err, result) {
      if (err){
          console.log(err);
          return false;
      }
      return true;
  });
}


module.exports = {db, uploadResource, saveGroupMessage, saveFriendMessage};
