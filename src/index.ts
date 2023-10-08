import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
const PORT = 8081;
const app = express();

const server = app.listen(PORT, () => {
  console.log(`running on ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());

interface TRoom {
  [key: string]: string[];
}

const rooms: TRoom = {};

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join room', (roomID: string) => {
    console.log(`roomID`, roomID);
    if (rooms[roomID]) {
      rooms[roomID].push(socket.id);
    } else {
      rooms[roomID] = [socket.id];
    }
    const otherUser = rooms[roomID].find((id) => id !== socket.id);
    if (otherUser) {
      socket.emit('other user', otherUser);
      socket.to(otherUser).emit('user joined', socket.id);
    }
  });

  socket.on('offer', (payload) => {
    io.to(payload.target).emit('offer', payload);
  });

  socket.on('answer', (payload) => {
    io.to(payload.target).emit('answer', payload);
  });

  socket.on('ice-candidate', (incoming) => {
    io.to(incoming.target).emit('ice-candidate', incoming.candidate);
  });

  // socket.on('chat message', (msg) => {
  //   io.emit('chat message', msg);
  // });

  // socket.on('writing', (msg) => {
  //   console.log('writing: ' + msg);
  // });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
