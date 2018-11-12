const cron = require("node-cron");
const Match = require("../models/Match");

module.exports = cron.schedule("0 0 3 * * 1", () => {
  try {
    Match.deleteMany({
      $and: [
        { winner_id: null },
        { created_at: { $gte: Date.now() - 604800016 } }
      ]
    });
  } catch (error) {}
});
