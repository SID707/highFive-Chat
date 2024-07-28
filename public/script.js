const chatform = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');


//get username and room from url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});



const socket = io();

//join chatroom
socket.emit('joinRoom', { username, room });


//get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});


//catch message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    //auto scroll down to new message
    chatMessages.scrollTop = chatMessages.scrollHeight;

});

//message submition when send btn clicked
chatform.addEventListener('submit', (e) => { //event parameter e added to stop submition of form as file later
    e.preventDefault();

    const mssg = e.target.elements.msg.value; //extracts text from the message text field

    socket.emit('chatmessage', mssg); //emitting message to server

    //clear input field
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus(); //returning focus after clearing text

});

//output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
        div.classList.add('message');
        div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
						<p class="text">
							${message.text}
						</p>`;
        document.querySelector('.chat-messages').appendChild(div);
}

//add roomname to dom sidebar
function outputRoomName(room) {
    roomName.innerText = room;
}

//add users to dom sidebar
function outputUsers(users) {
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}