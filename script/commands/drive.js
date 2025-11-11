const axios = require('axios');

module.exports.config = {
  name: "drive",
  version: "1.0.0",
  permission: 0,
  credits: "IMRAN",
  description: "Uploads media and returns an elegant formatted link",
  prefix: true,
  category: "media",
  usages: "Link",
  cooldowns: 5,
  dependencies: {
    "axios": ""
  }
};

module.exports.run = async ({ api, event, args }) => {
  if (!args[0] && !event.messageReply?.attachments[0]?.url) {
    return api.sendMessage("🔗 Please provide or reply to a media link.", event.threadID, event.messageID);
  }

  const inputUrl = event.messageReply?.attachments[0]?.url || args[0];

  try {
    const res = await axios.get(`http://5.9.12.94:14751/drive?type=upload&url=${encodeURIComponent(inputUrl)}`);
    const { downloadURL: imgurLink, id } = res.data;

    // Elegant formatted message
    const successMessage = `
╭───◉ 𝗨𝗣𝗟𝗢𝗔𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟 ༻✦༺
│
│ ㋡ 𝗜𝗗: ${id}
│ 
│ ✦ 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝗟𝗶𝗻𝗸: ${imgurLink}
│   

╰───────────────◉
🔮 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗜𝗠𝗥𝗔𝗡-𝗔𝗣𝗜`;

    api.sendMessage(successMessage, event.threadID, event.messageID);
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = `
╭───◉ 𝗘𝗥𝗥𝗢𝗥 ༻✦༺
│
│ ☠ 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝘂𝗽𝗹𝗼𝗮𝗱 𝗺𝗲𝗱𝗶𝗮:
│   ${error.message}
│
╰───────────────◉`;
    api.sendMessage(errorMessage, event.threadID, event.messageID);
  }
};