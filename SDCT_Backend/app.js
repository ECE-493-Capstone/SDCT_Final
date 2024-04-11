// Create express app
var express = require("express")
var { db }  = require("./database.js")
var app = express()

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const fileUpload = require('express-fileupload');

app.use(
  fileUpload({
      limits: {
          fileSize: 10000000,
      },
      abortOnLimit: true,
  })
);

// app.post('/upload', (req, res) => {
//   // Get the file that was set to our field named "image"
//   const { image } = req.files;

//   // If no image submitted, exit
//   if (!image) return res.sendStatus(400);

//   // If does not have image mime type prevent from uploading
//   // if (/^image/.test(image.mimetype)) return res.sendStatus(400);

//   // Move the uploaded image to our upload folder
//   data.mv(__dirname + '/upload/' + Math.floor(new Date().getTime() / 1000) + image.name);

//   // All good
//   res.json({
//     "message": "success",
//     "data": "http://[2605:fd00:4:1000:f816:3eff:fe7d:baf9]:8000/upload/" + Math.floor(new Date().getTime() / 1000) + image.name,
//     // "data": "http://localhost:8000/upload/" + image.name,
//   })
// });

// Server port
var HTTP_PORT = 8000 
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});
// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});

app.use('/upload', express.static('upload'))

// const io = require("socket.io")(httpServer, {
//     cors: {
//       origin: "http://localhost:8080",
//     },
// });

// Insert here other API endpoints
app.post("/login/", (req, res, next) => {
  var errors=[]
  if (!req.body.ImageURL){
      errors.push("No ImageURL Specified");
  }
  if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
  }
  var data = {
    UserId : req.body.UserId,  
    ImageURL : req.body.ImageURL
  }
  var sql =`
INSERT INTO User (UserId, ImageURL)
SELECT ?, ?
WHERE NOT EXISTS (SELECT * FROM User WHERE UserId = ? AND ImageURL = ?);`
  var params =[data.UserId, data.ImageURL, data.UserId, data.ImageURL]
  db.run(sql, params, function (err, result) {
      if (err){
          res.status(400).json({"error": err.message})
          return;
      }
      res.json({
          "message": "success",
          "data": data,
          "id" : this.lastID
      })
  });
})

app.get("/get_friends/:id", (req, res, next) => {
  var sql = `
SELECT f1.rowid, u1.ImageURL, f1.FriendId, f1.UserId
FROM Friend f1, User u1
WHERE 
((u1.UserId = f1.FriendId AND f1.UserId = ?) 
OR (u1.UserId = f1.UserId AND f1.FriendId = ?))
AND (f1.ContactTime IS NOT NULL);`

  var params = [req.params.id, req.params.id]
  db.all(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      res.json({
          "message":"success",
          "data":row
      })
    });
});

app.get("/get_groups/:id", (req, res, next) => {
  var sql = `
SELECT cg.GroupId, cg.GroupName
FROM GroupMembership gm, ChatGroup cg
WHERE gm.UserId = ? and cg.GroupId = gm.GroupId and gm.ContactTime IS NOT NULL;`
  var params = [req.params.id]
  db.all(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      res.json({
          "message":"success",
          "data":row
      })
    });
});


app.get("/get_all_users/", (req, res, next) => {
  var sql = `
SELECT * FROM User;`
  var params = [req.params.id, req.params.id]
  db.all(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      res.json({
          "message":"success",
          "data":row
      })
    });
});

app.get("/list_chats_friends/:id", (req, res, next) => {
  var sql = `
SELECT f1.rowid, u1.ImageURL, f1.FriendId, f1.ContactTime, m1.*
FROM FriendMessage m1, Friend f1, User u1
WHERE 
    ((u1.UserId = f1.FriendId AND f1.UserId = ?) 
    OR (u1.UserId = f1.UserId AND f1.FriendId = ?))
    AND (f1.ContactTime IS NOT NULL)
    AND m1.MessageId IN
        (SELECT m2.MessageId
        FROM FriendMessage as m2
        WHERE
            (m2.SendId = f1.UserId AND m2.RecvId = f1.FriendId)
            OR (m2.SendId = f1.FriendId AND m2.RecvId = f1.UserId)
        ORDER BY m2.MessageTime DESC
        LIMIT 1)
ORDER BY m1.MessageTime DESC;`
  var params = [req.params.id, req.params.id]
  db.all(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      res.json({
          "message":"success",
          "data":row
      })
    });
});

app.get("/list_chats_groups/:id", (req, res, next) => {
  var sql = `
SELECT c1.GroupName, g1.GroupId, g1.ContactTime, m1.*
FROM GroupMembership g1, ChatGroup c1, GroupMessage m1
WHERE
    g1.UserId = ?
    AND c1.GroupId = g1.GroupId
    AND m1.GroupId = g1.GroupId
    AND m1.MessageId IN
        (SELECT m2.MessageId
        FROM GroupMessage as m2
        WHERE m2.GroupId = c1.GroupId
        ORDER BY m2.MessageTime DESC
        LIMIT 1)
ORDER BY g1.ContactTime DESC;`
  var params = [req.params.id]
  db.all(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      res.json({
          "message":"success",
          "data":row
      })
    });
});

app.post("/add_friend/", (req, res, next) => {
  var errors=[]
  if (!req.body.UserId){
      errors.push("No Id Specified");
  }
  if (!req.body.FriendId){
    errors.push("No Friend Id Specified");
  }
  if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
  }
  var data = {
      UserId : req.body.UserId,
      FriendId : req.body.FriendId
  }
  var sql =`
INSERT INTO Friend (UserId, FriendId, ContactTime) VALUES (?, ?, NULL);`
 
  var params =[data.UserId, data.FriendId]
  db.run(sql, params, function (err, result) {
      if (err){
          res.status(400).json({"error": err.message})
          return;
      }
      res.json({
          "message": "success",
          "data": data,
          "id" : this.lastID
      })
  });
})

app.post("/add_notification_friend/", (req, res, next) => {
  var errors=[]
  if (!req.body.UserId){
      errors.push("No Id Specified");
  }
  if (!req.body.FriendId){
    errors.push("No Friend Id Specified");
  }
  if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
  }
  var data = {
      UserId : req.body.UserId,
      FriendId : req.body.FriendId
  }
  var sql =`
INSERT INTO FriendNotification (UserId, FriendId, NotifCount)
  VALUES(?, ?, 1)
ON CONFLICT(UserId, FriendId) DO UPDATE SET
  NotifCount = NotifCount + 1
WHERE UserId = ? AND FriendId = ?;`
 
  var params =[data.UserId, data.FriendId, data.UserId, data.FriendId]
  db.run(sql, params, function (err, result) {
      if (err){
          res.status(400).json({"error": err.message})
          return;
      }
      res.json({
          "message": "success",
          "data": data,
          "id" : this.lastID
      })
  });
})

app.post("/clear_notification_friend/", (req, res, next) => {
  var errors=[]
  if (!req.body.UserId){
      errors.push("No Id Specified");
  }
  if (!req.body.FriendId){
    errors.push("No Friend Id Specified");
  }
  if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
  }
  var data = {
      UserId : req.body.UserId,
      FriendId : req.body.FriendId
  }

  var sql =`
DELETE FROM FriendNotification
WHERE UserId = ? AND FriendId = ?;`
 
  var params =[data.UserId, data.FriendId]
  db.run(sql, params, function (err, result) {
      if (err){
          res.status(400).json({"error": err.message})
          return;
      }
      res.json({
          "message": "success",
          "data": data,
          "id" : this.lastID
      })
  });
})

app.get("/get_notifications_friends/:id", (req, res, next) => {
  var sql = `
SELECT * FROM FriendNotification
WHERE UserId = ?;`
  var params = [req.params.id]
  db.all(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      res.json({
          "message":"success",
          "data":row
      })
    });
});

app.post("/add_notification_group/", (req, res, next) => {
  var errors=[]
  if (!req.body.UserId){
      errors.push("No Id Specified");
  }
  if (!req.body.GroupId){
    errors.push("No Group Id Specified");
  }
  if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
  }
  var data = {
      UserId : req.body.UserId,
      GroupId : req.body.GroupId
  }
  var sql =`
INSERT INTO GroupNotification (UserId, GroupId, NotifCount)
  VALUES(?, ?, 1)
ON CONFLICT(UserId, GroupId) DO UPDATE SET
  NotifCount = NotifCount + 1
WHERE UserId = ? AND GroupId = ?;`
 
  var params =[data.UserId, data.GroupId, data.UserId, data.GroupId]
  db.run(sql, params, function (err, result) {
      if (err){
          res.status(400).json({"error": err.message})
          return;
      }
      res.json({
          "message": "success",
          "data": data,
          "id" : this.lastID
      })
  });
})

app.post("/clear_notification_group/", (req, res, next) => {
  var errors=[]
  if (!req.body.UserId){
      errors.push("No Id Specified");
  }
  if (!req.body.GroupId){
    errors.push("No Group Id Specified");
  }
  if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
  }
  var data = {
      UserId : req.body.UserId,
      GroupId : req.body.GroupId
  }
  var sql =`
DELETE FROM GroupNotification
WHERE UserId = ? AND GroupId = ?;`
 
  var params =[data.UserId, data.GroupId]
  db.run(sql, params, function (err, result) {
      if (err){
          res.status(400).json({"error": err.message})
          return;
      }
      res.json({
          "message": "success",
          "data": data,
          "id" : this.lastID
      })
  });
})

app.get("/get_notifications_groups/:id", (req, res, next) => {
  var sql = `
SELECT * FROM GroupNotification
WHERE UserId = ?;`
  var params = [req.params.id]
  db.all(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      res.json({
          "message":"success",
          "data":row
      })
    });
});

app.post("/add_to_group/", (req, res, next) => {
  var errors=[]
  if (!req.body.Id){
      errors.push("No group Id Specified");
  }
  if (!req.body.FriendId){
    errors.push("No member Id Specified");
  }
  if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
  }
  var data = {
      UserId : req.body.UserId,
      FriendId : req.body.FriendId
  }
  var sql =`
INSERT INTO GroupMembership (GroupId, UserId, ContactTime) VALUES (?, ?, NULL);`
 
  var params =[data.ImageURL]
  db.run(sql, params, function (err, result) {
      if (err){
          res.status(400).json({"error": err.message})
          return;
      }
      res.json({
          "message": "success",
          "data": result,
          "id" : this.lastID
      })
  });
})

app.post("/create_group/", (req, res, next) => {
  var errors=[]
  if (!req.body.GroupName){
      errors.push("No Group Name Specified");
  }
  if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
  }
  var data = {
      GroupName : req.body.GroupName
  }
  var sql =`
INSERT INTO ChatGroup (GroupId, GroupName) VALUES
(COALESCE((SELECT MAX(GroupId) FROM ChatGroup),1000000) + 1, ?);`
 
  var params =[data.GroupName]
  db.run(sql, params, function (err, result) {
      if (err){
          res.status(400).json({"error": err.message})
          return;
      }
      res.json({
          "message": "success",
          "data": data,
          "id" : this.lastID+1000000
      })
  });
})

app.post("/invite_group/", (req, res, next) => {
  var errors=[]
  if (!req.body.GroupId){
      errors.push("No group Id Specified");
  }
  if (!req.body.UserId){
    errors.push("No User Id Specified");
  }
  if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
  }
  var data = {
      GroupId : req.body.GroupId,
      UserId : req.body.UserId
  }
  var sql =`
INSERT INTO GroupMembership (GroupId, UserId, ContactTime) VALUES (?, ?, NULL);`
 
  var params =[data.GroupId, data.UserId]
  db.run(sql, params, function (err, result) {
      if (err){
          res.status(400).json({"error": err.message})
          return;
      }
      res.json({
          "message": "success",
          "data": data,
          "id" : this.lastID
      })
  });
})

app.post("/accept_invite_group/", (req, res, next) => {
  var errors=[]
  if (!req.body.GroupId){
      errors.push("No group Id Specified");
  }
  if (!req.body.UserId){
    errors.push("No User Id Specified");
  }
  if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
  }
  var data = {
      GroupId : req.body.GroupId,
      UserId : req.body.UserId,
      ContactTime : Math.floor(new Date().getTime() / 1000)
  }
  var sql =`
UPDATE GroupMembership SET ContactTime = ? WHERE GroupId = ? AND UserId = ?;`
 
  var params =[data.ContactTime, data.GroupId, data.UserId]
  db.run(sql, params, function (err, result) {
      if (err){
          res.status(400).json({"error": err.message})
          return;
      }
      res.json({
          "message": "success",
          "data": data,
          "id" : this.lastID
      })
  });
})

app.post("/decline_invite_group/", (req, res, next) => {
  var errors=[]
  if (!req.body.GroupId){
      errors.push("No group Id Specified");
  }
  if (!req.body.UserId){
    errors.push("No User Id Specified");
  }
  if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
  }
  var data = {
      GroupId : req.body.GroupId,
      UserId : req.body.UserId,
  }
  var sql =`
DELETE FROM GroupMembership WHERE GroupId = ? AND UserId = ?;`
 
  var params =[data.GroupId, data.UserId]
  db.run(sql, params, function (err, result) {
      if (err){
          res.status(400).json({"error": err.message})
          return;
      }
      res.json({
          "message": "success",
          "data": data,
          "id" : this.lastID
      })
  });
})

app.post("/leave_group/", (req, res, next) => {
  var errors=[]
  if (!req.body.GroupId){
      errors.push("No group Id Specified");
  }
  if (!req.body.UserId){
    errors.push("No User Id Specified");
  }
  if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
  }
  var data = {
      GroupId : req.body.GroupId,
      UserId : req.body.UserId,
  }
  var sql =`
DELETE FROM GroupMembership WHERE GroupId = ? AND UserId = ?;`
 
  var params =[data.GroupId, data.UserId]
  db.run(sql, params, function (err, result) {
      if (err){
          res.status(400).json({"error": err.message})
          return;
      }
      res.json({
          "message": "success",
          "data": data,
          "id" : this.lastID
      })
  });
})

app.post("/invite_friend/", (req, res, next) => {
  var errors=[]
  if (!req.body.FriendId){
      errors.push("No Friend Id Specified");
  }
  if (!req.body.UserId){
    errors.push("No User Id Specified");
  }
  if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
  }
  var data = {
      FriendId : req.body.FriendId,
      UserId : req.body.UserId
  }
  var sql =`
INSERT INTO Friend (UserId, FriendId, ContactTime) VALUES (?, ?, NULL);`
 
  var params =[data.FriendId, data.UserId]
  db.run(sql, params, function (err, result) {
      if (err){
          res.status(400).json({"error": err.message})
          return;
      }
      res.json({
          "message": "success",
          "data": data,
          "id" : this.lastID
      })
  });
})

// app.post("/accept_invite_friend/", (req, res, next) => {
//   var errors=[]
//   if (!req.body.FriendId){
//       errors.push("No Friend Id Specified");
//   }
//   if (!req.body.UserId){
//     errors.push("No User Id Specified");
//   }
//   if (errors.length){
//       res.status(400).json({"error":errors.join(",")});
//       return;
//   }
//   var data = {
//       FriendId : req.body.FriendId,
//       UserId : req.body.UserId,
//       ContactTime : Math.floor(new Date().getTime() / 1000)
//   }
//   var sql =`
// INSERT INTO Friend (UserId, FriendId, ContactTime) VALUES (?, ?, ?);`
 
//   var params =[data.FriendId, data.UserId, data.ContactTime]
//   db.run(sql, params, function (err, result) {
//       if (err){
//           res.status(400).json({"error": err.message})
//           return;
//       }
//       res.json({
//           "message": "success",
//           "data": data,
//           "id" : this.lastID
//       })
//   });
// })

app.post("/accept_invite_friend/", (req, res, next) => {
  var errors=[]
  if (!req.body.FriendId){
      errors.push("No friend Id Specified");
  }
  if (!req.body.UserId){
    errors.push("No User Id Specified");
  }
  if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
  }
  var data = {
      FriendId : req.body.FriendId,
      UserId : req.body.UserId,
      ContactTime : Math.floor(new Date().getTime() / 1000)
  }
  var sql =`
UPDATE Friend SET ContactTime = ? WHERE FriendId = ? AND UserId = ?;`
 
  var params =[data.ContactTime, data.UserId, data.FriendId]
  db.run(sql, params, function (err, result) {
      if (err){
          res.status(400).json({"error": err.message})
          return;
      }
      res.json({
          "message": "success",
          "data": data,
          "id" : this.lastID
      })
  });
})

app.post("/decline_invite_friend/", (req, res, next) => {
  var errors=[]
  if (!req.body.FriendId){
      errors.push("No Friend Id Specified");
  }
  if (!req.body.UserId){
    errors.push("No User Id Specified");
  }
  if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
  }
  var data = {
      FriendId : req.body.FriendId,
      UserId : req.body.UserId,
  }
  var sql =`
DELETE FROM Friend WHERE UserId = ? AND FriendId = ?;`
 
  var params =[data.FriendId, data.UserId]
  db.run(sql, params, function (err, result) {
      if (err){
          res.status(400).json({"error": err.message})
          return;
      }
      res.json({
          "message": "success",
          "data": data,
          "id" : this.lastID
      })
  });
})

app.get("/list_received_invitations_friends/:id", (req, res, next) => {
  var sql = `
SELECT f1.UserId
FROM Friend f1
WHERE 
    f1.FriendId = ?
    AND f1.ContactTime IS NULL;`
  var params = [req.params.id]
  db.all(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      res.json({
          "message":"success",
          "data":row
      })
    });
});

app.get("/list_received_invitations_groups/:id", (req, res, next) => {
  var sql = `
SELECT g1.GroupId, cg.GroupName
FROM GroupMembership g1, ChatGroup cg
WHERE 
    g1.UserId = ?
    AND g1.GroupId = cg.GroupId
    AND g1.ContactTime IS NULL;`
  var params = [req.params.id]
  db.all(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      res.json({
          "message":"success",
          "data":row
      })
    });
});

app.get("/list_sent_invitations_friends/:id", (req, res, next) => {
  var sql = `
SELECT f1.FriendId
FROM Friend f1
WHERE 
    f1.UserId = ?
    AND f1.ContactTime IS NULL;`
  var params = [req.params.id]
  db.all(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      res.json({
          "message":"success",
          "data":row
      })
    });
});

app.get("/list_sent_invitations_friends/:id", (req, res, next) => {
  var sql = `
SELECT f1.FriendId
FROM Friend f1
WHERE 
    f1.UserId = ?
    AND f1.ContactTime IS NULL;`
  var params = [req.params.id]
  db.all(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      res.json({
          "message":"success",
          "data":row
      })
    });
});

app.get("/list_sent_invitations_groups/:id", (req, res, next) => {
  var sql = `
SELECT g1.UserId
FROM GroupMembership g1
WHERE 
    g1.GroupId = ?
    AND g1.ContactTime IS NULL;`
  var params = [req.params.id]
  db.all(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      res.json({
          "message":"success",
          "data":row
      })
    });
});

app.get("/get_messages_friend/:id/:friendId", (req, res, next) => {
  var sql = `
SELECT f1.*, u.ImageUrl
FROM FriendMessage as f1, User u
WHERE
    ((f1.SendId = ? AND f1.RecvId = ?)
    OR (f1.SendId = ? AND f1.RecvId = ?))
    AND u.UserId = f1.SendId
ORDER BY f1.MessageTime DESC;`
  var params = [req.params.id, req.params.friendId, req.params.friendId, req.params.id]
  db.all(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      res.json({
          "message":"success",
          "data":row
      })
    });
});

app.get("/get_messages_group/:groupId", (req, res, next) => {
  var sql = `
SELECT g1.*, u1.ImageURL 
FROM GroupMessage as g1, User as u1
WHERE g1.GroupId = ?
AND g1.SendId = u1.UserId
ORDER BY g1.MessageTime DESC;`
  var params = [req.params.groupId]
  db.all(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      res.json({
          "message":"success",
          "data":row
      })
    });
});

app.post("/store_message_friend/", (req, res, next) => {
  var errors=[]
  var messageText = ""
  var messageLoc = ""
  if (!req.body.SendId){
      errors.push("No Sender Specified");
  }
  if (!req.body.RecvId){
    errors.push("No Reciever Specified");
  }
  if (!req.body.MessageType){
    errors.push("No Message Type Specified");
  }
  if (req.body.MessageText){
    messageText = req.body.MessageText;
  }
  if (req.body.MessageLocation){
    messageLoc = req.body.MessageLocation;
  }
  if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
  }
  var data = {
      SendId : req.body.SendId,
      RecvId : req.body.RecvId,
      MessageType : req.body.MessageType,
      MessageText : messageText,
      MessageLoc : messageLoc,

      MessageTime: Math.floor(new Date().getTime() / 1000)
  }
  var sql =`
INSERT INTO FriendMessage (MessageId, SendId, RecvId, MessageType, MessageTime, MessageText, MessageLoc) VALUES
(COALESCE((SELECT MAX(MessageId) FROM FriendMessage),0) + 1, ?, ?, ?, ?, ?, ? )`
 
  var params =[data.SendId, data.RecvId, data.MessageType, data.MessageTime, data.MessageText, data.MessageLoc ]
  db.run(sql, params, function (err, result) {
      if (err){
          res.status(400).json({"error": err.message})
          return;
      }
      res.json({
          "message": "success",
          "data": data,
          "id" : this.lastID
      })
  });
})

app.post("/store_message_group/", (req, res, next) => {
  var errors=[]
  var messageText = ""
  var messageLoc = ""
  if (!req.body.SendId){
      errors.push("No Sender Specified");
  }
  if (!req.body.GroupId){
    errors.push("No Group Specified");
  }
  if (!req.body.MessageType){
    errors.push("No Message Type Specified");
  }
  if (req.body.MessageText){
    messageText = req.body.MessageText;
  }
  if (req.body.MessageLocation){
    messageLoc = req.body.MessageLocation;
  }
  if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
  }
  var data = {
      SendId : req.body.SendId,
      GroupId : req.body.GroupId,
      MessageType : req.body.MessageType,
      MessageText : messageText,
      MessageLoc : messageLoc,

      MessageTime: Math.floor(new Date().getTime() / 1000)
  }
  var sql =`
INSERT INTO GroupMessage (MessageId, SendId, GroupId, MessageType, MessageTime, MessageText, MessageLoc) VALUES
(COALESCE((SELECT MAX(MessageId) FROM GroupMessage),0) + 1, ?, ?, ?, ?, ?, ? )`
 
  var params =[data.SendId, data.GroupId, data.MessageType, data.MessageTime, data.MessageText, data.MessageLoc ]
  db.run(sql, params, function (err, result) {
      if (err){
          res.status(400).json({"error": err.message})
          return;
      }
      res.json({
          "message": "success",
          "data": data,
          "id" : this.lastID
      })
  });
});

// io.on("connection", (socket) => {
//   // ...
//   socket.on("private message", ({ content, to }) => {
//     const message = {
//       content,
//       from: socket.userID,
//       to,
//     };
//     socket.to(to).to(socket.userID).emit("private message", message);
//     messageStore.saveMessage(message);
//   });
//   // ...
// });

// Default response for any other request
app.use(function(req, res){
    res.status(404);
});


const httpServer = require("http").createServer();
const { uploadResource, saveGroupMessage, saveFriendMessage} = require("./database")
const fs = require('fs');

io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:8000",
  },
  maxHttpBufferSize: 1e8 // 100 MB,
});

const chatNamespace = io.of("/chat");

chatNamespace.on("connection", (socket) => {
  socket.on("join chat", (room) => {
    console.log(`Socket joined ${room}`);
    if(room){
      socket.join(room);
    } else{
      console.log("Bad Room", room);
    }
  })

  socket.on("send message", (roomid, chatRoom, message ) => {
    console.log(chatRoom, message)

    if(roomid){
      switch(message.type){
        case 'Text':
          if (chatRoom.friendId) {
            saveFriendMessage(message, chatRoom.name);
          } else if (chatRoom.groupId) {
            saveGroupMessage(message, chatRoom.groupId);
          }
          socket.to(roomid).emit("get message", chatRoom, message);
          break;
        case 'Media':{
          const url = uploadResource(message.filename, message.timestamp, message.content)
          message.content = url;
          if (chatRoom.friendId) {
            saveFriendMessage(message, chatRoom.name);
          } else if (chatRoom.groupId) {
            saveGroupMessage(message, chatRoom.groupId)
          }
          io.of("/chat").to(roomid).emit("get message", chatRoom, message);
          break;
        }
        case 'File':{
          const url = uploadResource(message.filename, message.timestamp, message.content)
          message.content = url;
          if (chatRoom.friendId) {
            saveFriendMessage(message, chatRoom.name)
          } else if (chatRoom.groupId) {
            saveGroupMessage(message, chatRoom.groupId)
          }
          io.of("/chat").to(roomid).emit("get message", chatRoom, message);
          break;  
        }
        case 'Code':{
          console.log(roomid)
          if (chatRoom.friendId) {
            saveFriendMessage(message, chatRoom.name)
          } else if (chatRoom.groupId) {
            saveGroupMessage(message, chatRoom.groupId)
          }
          socket.to(roomid).emit("get message", chatRoom, message);
          break;  
        }
      }
    }
  });

  socket.on("leave chat room", (roomid) => {
    console.log(`leaving room ${roomid}`);
    
    if(roomid){
      socket.leave(roomid);
    }
  });
  
  socket.on("disconnect", () => {
    console.log("Chat Disconnected");
  });
});

const voiceNamespace = io.of("/voice");
const voiceSessionMap = new Map();

voiceNamespace.on("connection", (socket) => {
  socket.on("join private voice", async (roomid, user, callback) => {
    console.log("Joining Private Room", roomid);
    socket.join(roomid);
    let roomFriends = voiceSessionMap.get(roomid);
    if(roomFriends){
      roomFriends.push({name: user.name, friendid: user.name, pictureUri: user.pictureUri, socketId: socket.id});
    } else{
      roomFriends = [{name: user.name, friendid: user.name, pictureUri: user.pictureUri, socketId: socket.id}];
    }
    voiceSessionMap.set(roomid, roomFriends);
    io.of("/voice").to(roomid).emit("update friends", roomid, roomFriends);
    callback(roomFriends);
  });
  socket.on("send voice chat", async (roomid, data) => {
    console.log("Send", roomid);
    socket.to(roomid).emit("get voice chat", data);
  });
  socket.on("disconnect", () => 
  {
    for (let [roomid, value] of voiceSessionMap.entries()) {
      for(let user of value){
        if(user.socketId === socket.id){
          const newFriends = value.filter((item) => item.socketId !== socket.id);
          voiceSessionMap.set(roomid, value.filter((item) => item.socketId !== socket.id));
          socket.to(roomid).emit("update friends", roomid, newFriends);
          break;
        }
      }
    }
  });
});

const codeNamespace = io.of("/code");
const codeSessionMap = new Map();

codeNamespace.on("connection", (socket) => {
  socket.on("start code session", async (roomid, file, callback) => {
    console.log("Code Session", roomid, file.name);
    if(roomid){

      codeSession = codeSessionMap.get(roomid);
      if(codeSession){
        callback("CodeSession Exists");
        return;
      }

      if(file){
        const file_name = `${roomid}:${file.name}`;
        fs.writeFileSync(__dirname + `/codeSessions/${file_name}`, file.data, {encoding: null});
        codeSessionMap.set(roomid, {file_name: file_name, hostid: socket.id});
        socket.join(roomid);
        callback("Started");
      } else{
        console.log("No file");
        callback("No file");
      }
    } else{
      console.log("No roomid");
      callback("No roomid");
    }
    
  });

  socket.on("join code session", async (roomid, callback) => {
    console.log("Code Session", roomid);

    if(roomid){
      if(callback){
        const codeSession = codeSessionMap.get(roomid);

        if(codeSession){
          let _file = fs.readFileSync(__dirname + `/codeSessions/${codeSession.file_name}`)
          if(_file){
            socket.join(roomid);
            callback("joined", {name: codeSession.file_name.substr(codeSession.file_name.indexOf(":")+1), data: _file});
          } else{
            console.log("No file");
            callback("No file");
          }
        } else{
          console.log("No codesession");
          callback("CodeSession DNE");
        }
      } else{
        socket.join(roomid);
      }
    } else{
      console.log("No roomid");
      callback("No roomid");
    }
  });

  socket.on("send selection change", async (roomid, file, start, end, user) => {
    socket.to(roomid).emit("get selection change", file, start, end, user);
  });

  socket.on("send file change", (roomid, file, changes) => {
    console.log(roomid, file, changes)
    socket.to(roomid).emit("get file change", file, changes);
  });

  socket.on("readOnly", (roomid, readOnly) => {
    socket.to(roomid).emit("readOnly", readOnly);
  });

  socket.on("send whiteboardchange", (roomid, change, data) => {
    console.log(roomid, change,data )
    io.of("/code").to(roomid).emit("get whiteboardchange", roomid, change, data);
  });

  socket.on("disconnect", () => {
    console.log("Code Session Disconnected");

    for (let [roomid, value] of codeSessionMap.entries()) {
      if(value.hostid == socket.id){
        console.log("Closing Host Room");
        socket.to(roomid).emit("End Session");
        codeSessionMap.delete(roomid);
        fs.unlink(__dirname + `/codeSessions/${value.file_name}`, (err) => {
          if (err) throw err //handle your error the way you want to;
          console.log('file was deleted');//or else the file will be deleted
        });
        break;
      }
    }
  });
});

io.listen(3000);
