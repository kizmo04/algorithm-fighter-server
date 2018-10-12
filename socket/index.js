const _ = require('lodash');
const uuidv4 = require('uuid/v4');

module.exports = io => {
  var onUsers = [];

  io.of('/').on('connection', socket => {
    socket.on('connect user', user => {
      console.log(`connect ${socket.id}`, onUsers)
      onUsers.push({
        socketId: socket.id,
        user
      });
    });

    socket.on('disconnect', data => {
      onUsers.splice(_.findIndex(onUsers, client => client.socketId === socket.id), 1);
      console.log(`disconnecting ${socket.id}`, onUsers);
    });

    socket.on('find someone to match', user => {
      const hostUserIndex = _.findIndex(onUsers, client => client.socketId === socket.id);
      onUsers.splice(hostUserIndex, 1);

      console.log('server find someone to match'+ socket.id, onUsers)

      const combatRoomKey = uuidv4();
      socket.join(combatRoomKey);
      socket.leave(socket.id);

      console.log('클라이언트의 수: ', Object.keys(io.of('/').adapter.rooms).length);
      console.log(io.of('/').adapter.rooms);

      socket.to(combatRoomKey).emit('waiting for player');
      if (onUsers.length) {
        socket.broadcast.emit('requst user info', { hostSocketId: socket.id, hostUser: user, combatRoomKey });
      } else {
        io.of('/').to(combatRoomKey).emit('no one is here');
      }
    });

    socket.on('response user info', ({hostUser, combatRoomKey, guestSocketId, hostSocketId}) => {
      console.log('유저 정보 응답받음. 게스트의 정보: ', guestSocketId);
      console.log('on users: ', onUsers)
      console.log('전체 rooms: ', io.of('/').adapter.rooms)

      let pick = parseInt(combatRoomKey) || combatRoomKey.charCodeAt(0) || combatRoomKey.length;

      if (onUsers[parseInt(pick % onUsers.length)].socketId === guestSocketId) {
        const guestUser = onUsers[parseInt(pick % onUsers.length)].user;
        io.of('/').to(guestSocketId).emit('will you join?', {hostUser, combatRoomKey, guestSocketId, hostSocketId, guestUser});
        io.of('/').to(combatRoomKey).emit('waiting for guest to accept', { guestUser });
      }
    });

    socket.on('accept combat', ({hostUser, combatRoomKey, guestSocketId, hostSocketId, guestUser}) => {
      socket.join(combatRoomKey);
      socket.leave(guestSocketId);
      onUsers.splice(_.findIndex(onUsers, client => client.socketId === socket.id), 1);
      const combatRoom = io.of('/').adapter.rooms[combatRoomKey];
      const participants = Object.keys(combatRoom).length;
      console.log(`server in accept combat - guestUser: ${guestUser}, participants: ${participants}`);
      io.of('/').to(combatRoomKey).emit('join guest', {hostUser, combatRoomKey, guestSocketId, hostSocketId, guestUser, participants});
    });
  });
};
