const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");
var fs = require('fs')

const app = express();
//app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
const httpserver = http.Server(app);
const io = socketio(httpserver);

const gamedirectory = path.join(__dirname, "html");

app.use(express.static(gamedirectory));

httpserver.listen(9001);

var rooms = [];
var usernames = [];
var count = []
io.on('connection', function(socket){
  count++
  console.log('user connect '+count)
  socket.on("join", function(room, username){
    if (username != ""){
      rooms[socket.id] = room;
      usernames[socket.id] = username;
      socket.leaveAll();
      socket.join(room);
      io.in(room).emit("recieve", "Server : " + username + " has entered the chat.");
      
      socket.emit("join", room);
    }
  })
  socket.on("send", function(message){
    io.in(rooms[socket.id]).emit("recieve", usernames[socket.id] +" : " + message);
    console.log(socket)
  })
  socket.on("recieve", function(message){
    socket.emit("recieve", message);
  })
  socket.on('disconnect', function() { count--;console.log('user disconnect '+count) });
})


