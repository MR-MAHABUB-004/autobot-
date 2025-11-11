const axios = require("axios");

module.exports.config = {
  name: "bby",
  version: "2.2.0",
  permission: 0,
  credits: "IMRAN (Updated by ChatGPT)",
  description: "Chat with a Simsimi-like bot (reply + trigger words support)",
  prefix: false,
  premium: false,
  category: "Example",
  usages: "[your message]",
  cooldowns: 0
};

// Cute/funny replies for just "imu"
const cuteReplies = [
  "হ্যাঁ জানু 😘",
  "বলো বাবু 💖",
  "শুনছি জান 🥰",
  "কি হইছে বলো তো? 😏",
  "এই পাগল! কি চাও আবার? 🙈",
  "জান তুমি ডাকছো তাই আসলাম 😇",
  "বলো রে পাগল মেয়ে 💬",
  "তোমার জন্য সব সময় available 💕",
  "তুমি না ডাকলে কি আর শান্তি পাই! 😌",
  "কি বলবা বলো কিউটি 🐰"
];

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const botID = api.getCurrentUserID();

  const query = args.join(" ");

  // If the user just 
if (!query) {
    const reply = cuteReplies[Math.floor(Math.random() * cuteReplies.length)];

    return api.sendMessage(reply, threadID, (err, info) => {
      if (err) return;

      const handleReplyMap = global.client.handleReply;
      const botReplies = handleReplyMap.get(botID) || [];

      botReplies.push({
        name: "bby",
        messageID: info.messageID,
        author: senderID
      });

      handleReplyMap.set(botID, botReplies);
    }, messageID);
  }

  // For any other query, get response from Simsimi
  try {
    const response = await axios.get(`https://www.noobs-api.rf.gd/dipto/baby?text=${encodeURIComponent(query)}&senderID=100075122837809&font=1`);
    const reply = response.data.reply || "I didn't get that. Try asking something else!";

    api.sendMessage(reply, threadID, (err, info) => {
      if (err) return;

      const handleReplyMap = global.client.handleReply;
      const botReplies = handleReplyMap.get(botID) || [];

      botReplies.push({
        name: "bby",
        messageID: info.messageID,
        author: senderID
      });

      handleReplyMap.set(botID, botReplies);
    }, messageID);
  } catch (error) {
    console.error("API Error:", error.message);
    api.sendMessage("Something went wrong while contacting the bot service.", threadID, messageID);
  }
};
//
module.exports.handleReply = async ({ api, event }) => {
  const { threadID, messageID, senderID, body } = event;
  const botID = api.getCurrentUserID();

  try {
    const response = await axios.get(`https://www.noobs-api.rf.gd/dipto/baby?text=${encodeURIComponent(body)}&senderID=100075122837809&font=1`);
    const reply = response.data.reply || "I didn't get that. Try asking something else!";

    api.sendMessage(reply, threadID, (err, info) => {
      if (err) return;

      const handleReplyMap = global.client.handleReply;
      const botReplies = handleReplyMap.get(botID) || [];

      botReplies.push({
        name: "bby",
        messageID: info.messageID,
        author: senderID
      });

      handleReplyMap.set(botID, botReplies);
    }, messageID);
  } catch (error) {
    console.error("API Error:", error.message);
    api.sendMessage("Something went wrong while contacting the bot service.", threadID, messageID);
  }
};