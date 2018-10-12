const _ = require('lodash');
const uuidv4 = require('uuid/v4');
var onUsers = [];

//랜덤 유저 뽑는 함수 유틸로 따로 뽑기

function getRandomClient(users, hashString) {
  const randomIndex = parseInt((parseInt(hashString) || hashString.charCodeAt(0) || hashString.length) % users.length);
  return users[randomIndex];
}

module.exports = io => {
  console.log('socket connect, current on users: \n', onUsers, '\n');
  console.log('\n전체 rooms: \n', io.of('/').adapter.rooms, '\n 클라이언트의 수: \n' + Object.keys(io.of('/').adapter.rooms).length + '\n');

  io.of('/').on('connection', socket => {
    socket.on('login user', user => {
      if (Object.keys(user).length) {
        onUsers.push({
          socketId: socket.id,
          user
        });
      }
      console.log(`log in user ${_.find(onUsers, client => client.socketId === socket.id).user.email}`);
      console.log('current on users: \n', onUsers, '\n');
      console.log('\n전체 rooms: \n', io.of('/').adapter.rooms, '\n 클라이언트의 수: \n' + Object.keys(io.of('/').adapter.rooms).length + '\n');
    });

    socket.on('logout user', () => {
      console.log('log out user')
      if (onUsers.map(client => client.socketId).includes(socket.id)) {
        onUsers.splice(_.findIndex(onUsers, client => client.socketId === socket.id), 1);
      }
      // console.log(`log out user ${Object.keys(_.find(onUsers, client => client.socketId === socket.id)).length ? _.find(onUsers, client => client.socketId === socket.id).user.email : null}`);
      console.log('current on users: \n', onUsers, '\n');
      console.log('\n전체 rooms: \n', io.of('/').adapter.rooms, '\n 클라이언트의 수: \n' + Object.keys(io.of('/').adapter.rooms).length + '\n');
    });

    socket.on('disconnect', data => {
      console.log('disconnect user \n' + socket.id)
      // console.log(`disconnect user ${Object.keys(_.find(onUsers, client => client.socketId === socket.id)).length ? _.find(onUsers, client => client.socketId === socket.id).user.email : null}`);
      if (onUsers.map(client => client.socketId).includes(socket.id)) {
        onUsers.splice(_.findIndex(onUsers, client => client.socketId === socket.id), 1);
      }
      console.log('current on users: \n', onUsers, '\n');
      console.log('\n전체 rooms: \n', io.of('/').adapter.rooms, '\n 클라이언트의 수: \n' + Object.keys(io.of('/').adapter.rooms).length + '\n');
    });

    socket.on('find someone to match', user => {
      const hostUserIndex = _.findIndex(onUsers, client => client.socketId === socket.id);
      console.log(`${onUsers[hostUserIndex].user.email} find someone to combat`);
      onUsers.splice(hostUserIndex, 1);

      const combatRoomKey = uuidv4();
      socket.join(combatRoomKey);
      socket.leave(socket.id);
      socket.to(combatRoomKey).emit('waiting for player');

      if (onUsers.length) {
        console.log('request user info to clients')
        socket.broadcast.emit('requst user info', { hostSocketId: socket.id, hostUser: user, combatRoomKey });
      } else {
        io.of('/').to(combatRoomKey).emit('no one is here');
        console.log('no one is here');
        socket.leave(combatRoomKey);
        socket.join(socket.id);
      }
      console.log('current on users: \n' + onUsers + '\n');
      console.log('\n전체 rooms: \n', io.of('/').adapter.rooms, '\n 클라이언트의 수: \n' + Object.keys(io.of('/').adapter.rooms).length + '\n');
    });

    socket.on('response user info', ({hostUser, combatRoomKey, guestSocketId, hostSocketId }) => {
      console.log('current on users: \n', onUsers, '\n');
      console.log('\n전체 rooms: \n', io.of('/').adapter.rooms, '\n 클라이언트의 수: \n' + Object.keys(io.of('/').adapter.rooms).length + '\n');

      const randomClient = getRandomClient(onUsers, combatRoomKey);

      if (randomClient.socketId === guestSocketId) {
        const guestUser = randomClient.user;
        console.log(`response from client and pick randomly ${guestUser.email}`);
        io.of('/').to(guestSocketId).emit('will you join?', {hostUser, combatRoomKey, guestSocketId, hostSocketId, guestUser});
        console.log(`invite ${randomClient.user.email}`);
        io.of('/').to(combatRoomKey).emit('waiting for guest to accept', { guestUser });
      }
    });

    socket.on('accept combat', ({hostUser, combatRoomKey, hostSocketId, guestUser}) => {
      // console.log(`${guestUser.email} accept invitation`);
      socket.join(combatRoomKey);
      // socket.leave(guestSocketId);
      socket.leave(socket.id);
      onUsers.splice(_.findIndex(onUsers, client => client.socketId === socket.id), 1);
      const combatRoom = io.of('/').adapter.rooms[combatRoomKey];
      const participants = Object.keys(combatRoom).length;

      console.log('current on users: \n', onUsers, '\n');
      console.log('\n전체 rooms: \n', io.of('/').adapter.rooms, '\n 클라이언트의 수: \n' + Object.keys(io.of('/').adapter.rooms).length + '\n');
      // console.log(`참여자 수 : ${participants}명, ${hostUser.email}, ${guestUser.email}`);
      io.of('/').to(combatRoomKey).emit('join guest', {hostUser, combatRoomKey});
    });
  });
};
