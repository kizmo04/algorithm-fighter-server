const _ = require('lodash');
const uuidv4 = require('uuid/v4');
const {
  CONNECTION,
  USER_LOGIN,
  USER_LOGOUT,
  USER_DISCONNECTION,
  REFUSE,
  JOIN_OPPONENT,
  ACCEPTANCE,
  NO_OPPONENT,
  WAITING_TO_ACCEPT,
  INVITE,
  REQUEST_OPPONENT,
} = require('../constants/socketEventTypes');
var onUsers = [];

function getRandomClient(users, hashString) {
  const randomIndex = parseInt((parseInt(hashString) || hashString.charCodeAt(0) || hashString.length) % users.length);
  return users[randomIndex];
}

module.exports = io => {
  io.of('/').on(CONNECTION, socket => {
    socket.on(USER_LOGIN, user => {
      if (Object.keys(user).length) {
        onUsers.push({
          socketId: socket.id,
          user
        });
      }
    });

    socket.on(USER_LOGOUT, () => {
      if (onUsers.map(client => client.socketId).includes(socket.id)) {
        onUsers.splice(_.findIndex(onUsers, client => client.socketId === socket.id), 1);
      }
    });

    socket.on(USER_DISCONNECTION, data => {
      if (onUsers.map(client => client.socketId).includes(socket.id)) {
        onUsers.splice(_.findIndex(onUsers, client => client.socketId === socket.id), 1);
      }
    });

    socket.on(REQUEST_OPPONENT, (hostUser, prevCombatRoomKey) => {
      const hostUserIndex = _.findIndex(onUsers, client => client.socketId === socket.id);

      if (prevCombatRoomKey) socket.leave(prevCombatRoomKey);
      if (hostUserIndex > -1) onUsers.splice(hostUserIndex, 1);

      const combatRoomKey = uuidv4();
      socket.join(combatRoomKey);
      socket.leave(socket.id);

      if (onUsers.length) {
        const randomClient = getRandomClient(onUsers, combatRoomKey);
        const guestUser = randomClient.user;
        const guestSocketId = randomClient.socketId;
        io.of('/').to(guestSocketId).emit(INVITE, { hostUser, combatRoomKey });
        io.of('/').to(combatRoomKey).emit(WAITING_TO_ACCEPT, { guestUser });
      } else {
        io.of('/').to(combatRoomKey).emit(NO_OPPONENT);
        socket.leave(combatRoomKey);
        socket.join(socket.id);
      }
    });

    socket.on(ACCEPTANCE, ({ hostUser, combatRoomKey }) => {
      socket.join(combatRoomKey);
      socket.leave(socket.id);
      onUsers.splice(_.findIndex(onUsers, client => client.socketId === socket.id), 1);
      io.of('/').to(combatRoomKey).emit(JOIN_OPPONENT, { hostUser, combatRoomKey });
    });

    socket.on(REFUSE, ({combatRoomKey}) => {
      io.of('/').to(combatRoomKey).emit(REFUSE, combatRoomKey);
    });
  });
};
