const fs = require('fs');

module.exports.config = {
  name: "no4",
  version: "1.0.1",
  permission: 0, // Typo fixed
  credits: "IMRAN", // Credit updated
  prefix: false,
  description: "Fun",
  category: "no prefix",
  premium: false,
  usages: "😒",
  cooldowns: 5
};

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, messageID, body } = event;
  const triggers = ["ইমরান", "admin", "koi imran"];

  if(body && triggers.some(trigger => body.startsWith(trigger))) {
    const msg = {
      body: "~ইমরান এখন ঘুমাচ্ছে🥀",
      attachment: fs.createReadStream(__dirname + '/IMRAN/imrangm.mp3') // Path corrected
    };
    api.sendMessage(msg, threadID, messageID);
    api.setMessageReaction("🥱", messageID, (err) => {}, true);
  }
};

module.exports.run = function() {};