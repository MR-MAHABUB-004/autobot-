module.exports.config = {
  name: "td",
  version: "1.0.0",
  permission: 0,
  credits: "IMRAN",
  description: "Get unique truth/dare challenges with user mentions",
  prefix: false,
  premium: false,
  category: "Fun",
  usages: "[truth/dare]",
  cooldowns: 7
};

const axios = require("axios");
const emojis = ["✨", "🎲", "🔥", "😈", "💫", "⚡"];

module.exports.run = async ({ api, event, args, Users }) => {
  const { threadID, senderID } = event;
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  
  if (!args[0]) {
    return api.sendMessage(
      `${randomEmoji} Please choose "truth" or "dare"\nExample: truthdare truth`,
      threadID
    );
  }

  const type = args[0].toLowerCase();
  const name = await Users.getNameUser(senderID);
  
  try {
    const apiUrl = `https://masterapi.fun/api/${type}`;
    const response = await axios.get(apiUrl);
    
    if (!response.data || !response.data.question) {
      throw new Error("Invalid API response");
    }

    const challenge = response.data.question;
    const formattedMsg = `╭───♡︎⋅🄷🄴🅁🄴'🅂⋅♡︎───⦁\n│  ⤷👤 | 𝗨𝘀𝗲𝗿: ${name}\n│  ⤷🎯 | 𝗧𝘆𝗽𝗲: ${type.toUpperCase()}\n│\n│  ⤷📜 | ${challenge}\n╰───⋅♡︎───────⦁`;

    api.sendMessage(formattedMsg, threadID, () => {}, event.messageID);

  } catch (error) {
    console.error(error);
    api.sendMessage(
      `${randomEmoji} Failed to get ${type}. Please try again later.`,
      threadID
    );
  }
};