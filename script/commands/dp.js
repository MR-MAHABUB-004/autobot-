const axios = require("axios");

module.exports.config = {

  name: "dp",

  version: "1.0.6",

  permission: 0,

  credits: "Imran",

  description: "Get stylish profile picture (dp1, dp2, dp3)",

  prefix: true,

  category: "image",

  usages: "dp [1|2|3] [@mention]",

  cooldowns: 5,

};

module.exports.run = async ({ api, event, args }) => {

  const { threadID, senderID, messageID, mentions } = event;

  // Determine dp version

  const versionArg = ["1", "2", "3", "4", "5"].includes(args[0]) ? args[0] : "1";

  const dpVersion = `dp${versionArg}`;

  // Determine user target

  const isMentioned = Object.keys(mentions).length > 0;

  const targetID = isMentioned ? Object.keys(mentions)[0] : senderID;

  const targetName = isMentioned ? mentions[targetID].replace("@", "") : "you";

  // API URL 

  const imageUrl = `https://love-api-nbcn.onrender.com/${dpVersion}?uid=${targetID}`;

  // Custom styled body message per version

  const styleMessage = {

    dp1: `💖 Here’s the Love Style DP of ${targetName} 💖`,

    dp2: `🎨 Art Style DP for ${targetName} — looking great! 🎨`,

    dp3: `✨ Fantasy Glow DP of ${targetName}! ✨`

  };

  try {

    const response = await axios({

      method: "GET",

      url: imageUrl,

      responseType: "stream"

    });

    api.sendMessage({

      body: styleMessage[dpVersion] || `📸 DP of ${targetName}`,

      attachment: response.data

    }, threadID, messageID);

  } catch (error) {

    console.error("❌ Error fetching DP:", error.message);

    api.sendMessage("❌ Couldn't fetch profile picture.", threadID, messageID);

  }

};