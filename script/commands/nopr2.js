const fs = require('fs');

module.exports.config = {
  name: "no2",
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
  const triggers = ["single", "korba", "pem korba"];

  if(body && triggers.some(trigger => body.startsWith(trigger))) {
    const msg = {
      body: "~আমার সাথে কেউ করে না😩",
      attachment: fs.createReadStream(__dirname + '/IMRAN/amarstkore.mp3') // Path corrected
    };
    api.sendMessage(msg, threadID, messageID);
    api.setMessageReaction("😹", messageID, (err) => {}, true);
  }
};

module.exports.run = function() {};