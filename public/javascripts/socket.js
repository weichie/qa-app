var socket = io.connect();

socket.emit('chat message', 'hello');