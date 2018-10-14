const _ = require('lodash');
const uuidv4 = require('uuid/v4');
const {
  CONNECTION,
  USER_LOGIN,
  USER_LOGOUT,
  USER_DISCONNECTION,
  MATCH_PARTNER_UNAVAILABLE,
  MATCH_PARTNER_ENTERED,
  REFUSE_MATCH_INVITATION,
  ACCEPT_MATCH_INVITATION,
  PENDING_MATCH_ACCEPTANCE,
  SEND_MATCH_INVITATION,
  FIND_MATCH_PARTNER,
  MATCH_PARTNER_REFUSE_MATCH_INVITATION,
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

    socket.on(USER_DISCONNECTION, () => {
      if (onUsers.map(client => client.socketId).includes(socket.id)) {
        onUsers.splice(_.findIndex(onUsers, client => client.socketId === socket.id), 1);
      }
    });

    socket.on(FIND_MATCH_PARTNER, ({hostUser, prevCombatRoomKey}) => {
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
        io.of('/').to(guestSocketId).emit(SEND_MATCH_INVITATION, { hostUser, combatRoomKey });
        io.of('/').to(combatRoomKey).emit(PENDING_MATCH_ACCEPTANCE, guestUser);
      } else {
        io.of('/').to(combatRoomKey).emit(MATCH_PARTNER_UNAVAILABLE);
        socket.leave(combatRoomKey);
        socket.join(socket.id);
      }
    });

    socket.on(ACCEPT_MATCH_INVITATION, ({ hostUser, combatRoomKey }) => {
      socket.join(combatRoomKey);
      socket.leave(socket.id);
      onUsers.splice(_.findIndex(onUsers, client => client.socketId === socket.id), 1);
      io.of('/').to(combatRoomKey).emit(MATCH_PARTNER_ENTERED, { hostUser, combatRoomKey });
    });

    socket.on(REFUSE_MATCH_INVITATION, ({combatRoomKey, guestUser}) => {
      console.log('refuse match invitation' + combatRoomKey)
      io.of('/').to(combatRoomKey).emit(MATCH_PARTNER_REFUSE_MATCH_INVITATION, combatRoomKey);
    });
  });
};
