const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "women", // Command name
  version: "1.0.1", // Command version
  permission: 0, // Permission level
  credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭", // Creator of the code
  description: "hihihihi", // Command description
  prefix: false, // Use prefix
  premium: false, // Enable premium feature
  category: "Example", // Command category
  usages: "women", // Command usage
  cooldowns: 5 // Cooldown in seconds
};

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, messageID, body } = event;

  if (body && (body.toLowerCase().startsWith("women") || body.startsWith("☕"))) {
    const filePath = path.join(__dirname, "women_video.mp4");
    const url = "https://raw.githubusercontent.com/MR-IMRAN-60/JSON-STORE/main/wn.mp4";

    // Download the video if it doesn't exist
    if (!fs.existsSync(filePath)) {
      const response = await axios({
        method: "GET",
        url,
        responseType: "stream"
      });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    }

    const msg = {
      body: "hahaha Women 🤣",
      attachment: fs.createReadStream(filePath)
    };

    api.sendMessage(msg, threadID, messageID);
    api.setMessageReaction("☕", event.messageID, () => {}, true);
  }
};

module.exports.run = async ({ api, event }) => {
  // This command doesn't respond via prefix
};
