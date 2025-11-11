const axios = require("axios");

module.exports.config = {
  name: "married",
  version: "3.1.0",
  permission: 0,
  credits: "IMRAN",
  description: "Generate married images (v2, v3, v4, v5) with reaction",
  prefix: true,
  category: "image",
  usages: "married [2|3|4|5] [@mention or reply]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  try {
    // ❤️ React to the command message
    try {
      api.setMessageReaction("❤️", event.messageID, true);
    } catch (e) {
      console.log("Reaction failed:", e.message);
    }

    // Select version
    let version;
    if (args[0] && ["2", "3", "4", "5"].includes(args[0])) {
      version = `marriedv${args[0]}`;
      args.shift();
    } else {
      const randomVersion = ["marriedv2", "marriedv3", "marriedv4", "marriedv5"];
      version = randomVersion[Math.floor(Math.random() * randomVersion.length)];
    }

    // Determine UIDs
    const uid1 = event.senderID;
    let uid2;

    if (event.type === "message_reply") {
      uid2 = event.messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
      uid2 = Object.keys(event.mentions)[0];
    } else {
      return api.sendMessage("⚠️ Please tag or reply to someone!", event.threadID, event.messageID);
    }

    // API URL
    const apiUrl = `https://love-api-imran.onrender.com/${version}?uid1=${uid1}&uid2=${uid2}`;
    const response = await axios.get(apiUrl, { responseType: "stream" });

    return api.sendMessage(
      {
        body: `✅ Here is your Married Image (${version.toUpperCase()}):`,
        attachment: response.data
      },
      event.threadID,
      event.messageID
    );
  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ Failed to generate married image. Try again later!", event.threadID, event.messageID);
  }
};
