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
  SEND_RANDOM_PROBLEM,
  MATCH_START,
  FIND_MATCH_PARTNER_END,
  KEY_UP,
  KEY_DOWN,
  MATCH_PARTNER_KEY_DOWN,
  MATCH_PARTNER_KEY_UP,
  SOLUTION_SUBMITTED,
  MATCH_PARTNER_SOLUTION_SUBMITTED,
  MATCH_TIMER,
  MATCH_PARTNER_WINNING,
  USER_WINNING,
  USER_GIVE_UP,
  MATCH_PARTNER_GIVE_UP,
  USER_SOCKET_INIT,
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

    socket.on(FIND_MATCH_PARTNER, (hostUser, prevCombatRoomKey) => {
      const hostUserIndex = _.findIndex(onUsers, client => client.socketId === socket.id);

      if (prevCombatRoomKey) socket.leave(prevCombatRoomKey);
      if (hostUserIndex > -1) onUsers.splice(hostUserIndex, 1);

      const combatRoomKey = uuidv4();
      socket.join(combatRoomKey);
      // socket.leave(socket.id);
      console.log('in find match partner', onUsers)
      if (onUsers.length) {
        const randomClient = getRandomClient(onUsers, combatRoomKey);
        const guestUser = randomClient.user;
        const guestSocketId = randomClient.socketId;
        console.log(guestSocketId)
        console.log('all rooms', io.of("/").adapter.rooms)
        io.of('/').to(guestSocketId).emit(SEND_MATCH_INVITATION, hostUser, combatRoomKey);
        io.of('/').to(combatRoomKey).emit(PENDING_MATCH_ACCEPTANCE, guestUser);
      } else {
        io.of('/').to(combatRoomKey).emit(MATCH_PARTNER_UNAVAILABLE);
        socket.leave(combatRoomKey);
        // socket.join(socket.id);
      }
    });

    socket.on(ACCEPT_MATCH_INVITATION, (combatRoomKey, matchPartner) => {
      socket.join(combatRoomKey);
      // socket.leave(socket.id);
      console.log(combatRoomKey, matchPartner)
      console.log(io.of('/').adapter.rooms)
      // const matchPartner = onUsers.splice(_.findIndex(onUsers, client => client.socketId === socket.id), 1)[0];
      io.of('/').to(combatRoomKey).emit(MATCH_PARTNER_ENTERED, matchPartner, combatRoomKey);
    });

    socket.on(REFUSE_MATCH_INVITATION, (combatRoomKey, guestUser) => {
      io.of('/').to(combatRoomKey).emit(MATCH_PARTNER_REFUSE_MATCH_INVITATION, combatRoomKey);
    });

    socket.on(FIND_MATCH_PARTNER_END, combatRoomKey => {
      socket.leave(combatRoomKey);
      // socket.join(socket.id);
    });

    socket.on(SEND_RANDOM_PROBLEM, (problem, combatRoomKey, matchId) => {
      // var time = problem.difficulty_level * 30 * 60 * 1000;
      var time = 1000 * 180;
      const min = 60 * 1000;

      if (time <= min * 3) {
        const secondIntervalId = setInterval(() => {
          // io.of('/').to(combatRoomKey).emit(MATCH_TIMER, time);
          if (time < 1000) {
            // io.of('/').to(combatRoomKey).emit(MATCH_TIMER, time); // 게임 종료
            clearInterval(secondIntervalId);
          }
          time -= 1000;
        }, 1000);

      } else {
        const firstIntervalId = setInterval(() => {
          if (time <= min * 3) {
            clearInterval(firstIntervalId);
            const secondIntervalId = setInterval(() => {
              // io.of('/').to(combatRoomKey).emit(MATCH_TIMER, time);
              if (time <= 1000) {
                clearInterval(secondIntervalId);
                // io.of('/').to(combatRoomKey).emit(MATCH_TIMER, time); // 게임 종료
              }
              time -= 1000;
            }, 1000);
          } else {
            time -= min;
            console.log(time, combatRoomKey)
            // io.of('/').to(combatRoomKey).emit(MATCH_TIMER, time);
          }
        }, min);
      }
      io.of('/').to(combatRoomKey).emit(MATCH_START, problem, matchId, time);
    });

    socket.on(KEY_DOWN, combatRoomKey => {
      socket.broadcast.to(combatRoomKey).emit(MATCH_PARTNER_KEY_DOWN, combatRoomKey);
    });

    socket.on(KEY_UP, combatRoomKey => {
      socket.broadcast.to(combatRoomKey).emit(MATCH_PARTNER_KEY_UP, combatRoomKey);
    });

    socket.on(SOLUTION_SUBMITTED, (testResult, countPassed, isPassedAll, combatRoomKey) => {
      socket.broadcast.to(combatRoomKey).emit(MATCH_PARTNER_SOLUTION_SUBMITTED, testResult, countPassed, isPassedAll);
    });

    socket.on(USER_WINNING, (matchResult, combatRoomKey) => {
      socket.broadcast.to(combatRoomKey).emit(MATCH_PARTNER_WINNING, matchResult);
      socket.leave(combatRoomKey);
      // socket.in(socket.id);
    });

    socket.on(USER_GIVE_UP, (combatRoomKey, user) => {
      console.log('on user give up')
      socket.broadcast.to(combatRoomKey).emit(MATCH_PARTNER_GIVE_UP);
      socket.leave(combatRoomKey);
      // socket.in(socket.id);
      if (checkOnUsers(user)) {
        onUsers.push({
         socketId: socket.id,
         user
       });
     }
    });

    socket.on(USER_SOCKET_INIT, (combatRoomKey, user) => {
      socket.leave(combatRoomKey);
      // socket.in(socket.id);
      if (checkOnUsers(user)) {
         onUsers.push({
          socketId: socket.id,
          user
        });
      }
      console.log('on Users \n', onUsers, '\n rooms!!!!! \n', io.of('/').adapter.rooms)
    });
  });
};


function checkOnUsers(user) {
  return onUsers.every(client => {
    console.log('in every', client.user, user)
    return client.user.email !== user.email
  });
}
