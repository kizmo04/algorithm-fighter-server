const _ = require('lodash');
const uuidv4 = require('uuid/v4');

module.exports = io => {
  var onUsers = [];
  var usersToFindSomeone = {};
  var index = 1;

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

    const rooms = io.of("/").adapter.rooms;
    // let currentRoom = rooms[data.room];
    // console.dir(rooms)
    socket.on('find someone to match', user => {
      const hostUserIndex = _.findIndex(onUsers, client => client.socketId === socket.id);
      onUsers.splice(hostUserIndex, 1);
      // socket.leave('waiting');
      // socket.join(user.email);
      console.log('server find someone to match'+ socket.id, onUsers)
      const combatRoomKey = uuidv4();
      socket.join(combatRoomKey);
      socket.leave(socket.id);

      // io.to('waiting').emit('request user info', socket.id, user.email);
      // io.broadcast.emit('io broadcast', 'hey');
      // usersToFindSomeone[user.email] = user;
      console.log('클라이언트의 수: ', Object.keys(io.of('/').adapter.rooms).length);
      console.log(io.of('/').adapter.rooms);
      // socket.to(user.email).emit('waiting for player');
      socket.to(combatRoomKey).emit('waiting for player');
      if (onUsers.length) {
        socket.broadcast.emit('requst user info', { hostSocketId: socket.id, hostUser: user, combatRoomKey });
      } else {
        io.of('/').to(combatRoomKey).emit('no one is here');
      }
    });

    socket.on('response user info', ({hostUser, combatRoomKey, guestSocketId, hostSocketId}) => {
      // const waitingRooms = io.of('/waiting').adapter.rooms;
      // const roomKeys = Object.keys(waitingRooms);
      // onUsers[socket.id] = user;
      console.log('유저 정보 응답받음. 게스트의 정보: ', guestSocketId);
      console.log('on users: ', onUsers)
      console.log('전체 rooms: ', io.of('/').adapter.rooms)

      let pick = parseInt(combatRoomKey) || combatRoomKey.charCodeAt(0) || combatRoomKey.length;


      // const guestClient = _.find(onUsers, client => client.socketId === guestSocketId);
      if (onUsers[parseInt(pick % onUsers.length)].socketId === guestSocketId) {
        const guestUser = onUsers[parseInt(pick % onUsers.length)].user;
        io.of('/').to(guestSocketId).emit('will you join?', {hostUser, combatRoomKey, guestSocketId, hostSocketId, guestUser});
        io.of('/').to(combatRoomKey).emit('waiting for guest to accept', { guestUser });
      }
      // console.log('대기실 rooms: ', waitingRooms)
      // console.log('게스트 유저: ', guestUser);
      // console.log('socket.id: ', socket.id)
      // console.log('호스트 유저: ', hostUser);
      // if (guestUser.email !== hostUser.email) {
        // socket.join('');
        // socket.to(hostUser.email).emit('join guest', guestUser.email);
        // console.log(io.of('/').adapter.rooms)
        // 매치 document 생성하는 콜백 추가
        // users = [hostUser._id, guestUser._id]
        // match._id 를 기억해둘것. - 소켓 룸에?
      // } else {
        // socket.to(hostSocketId).emit('finding guest failure');
      // }


      // waiting namespace 에 있는 클라이언트들한테만 요청해서 받기.. 그중에서 순회해서 알맞는 조건의 상대방 찾기. 조건에 필요한 값은 요청할때 같이 보내주기

      // console.log('server response user info!' + socket.id, onUsers);
    });

    // socket.on('first', data => {
    //   console.log('connect', data);
    //   socket.join('waiting');
    // });
    // socket.on('find user', () => {
    //   const rooms = io.of('/').adapter.rooms;
    //   console.log('rooms keys', Object.keys(rooms))
    //   Object.keys(rooms).forEach(room => {
    //     // socket.to(room).emit('request user info');
    //   });
    // });

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
