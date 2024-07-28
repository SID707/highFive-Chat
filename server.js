const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//setting static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'highFive Bot'; 

//run when client connects
io.on('connection', socket => {

socket.on('joinRoom', ({ username, room }) => {

    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    //Welcomes current user
    socket.emit('message', formatMessage(botName, 'Welcome To highFive!')); // socket.emit only lets the user see the message

    //broadcast when a user connects, broadcast lets others except the user see the message
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));

    //send users and room info to side bar
    io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)

    });

    });

    //listen for chat message
    socket.on('chatmessage', (mssg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, mssg));
    });

    //runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));

        //send users and room info to side bar
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

        }
    });

});

const PORT = process.env.PORT || 2000;

server.listen(PORT, () => console.log(`server running on port ${PORT}`));