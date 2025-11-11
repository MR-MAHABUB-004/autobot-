const fs = require('fs'); // Make sure to require fs at the beginning

module.exports.config = {
  name: "💩",
  version: "1.0.0",
  permission: 0,
  credits: "ryuko",
  prefix: true,
  description: "guide",
  category: "system",
  premium: false,
  usages: "",
  cooldowns: 5,
};

module.exports.handleEvent = async ({ event, api, Threads, prefix }) => {
  const { threadID, messageID, body, senderID } = event;

  function out(data) {
    api.sendMessage(data, threadID, messageID);
  }

  const dataThread = await Threads.getData(threadID);
  const data = dataThread.data;
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};

  const arr = ["💩"];

  arr.forEach(i => {
    let str = i[0].toUpperCase() + i.slice(1);
    if (body === i.toUpperCase() || body === i || str === body) {
      const msg = {
        body: " ~🧚‍♀️𝄞⋆⃝তুমি গ্রুপে হাগু করলা কে⋆⃝🧚‍♂️",
        attachment: fs.createReadStream(__dirname + `/IMRAN/hagu.mp3`)
      };
      api.sendMessage(msg, threadID, messageID); // Send the message with the media
    }
  });
};

module.exports.run = async ({ event, api }) => {
  return api.sendMessage("no prefix commands", event.threadID);
};