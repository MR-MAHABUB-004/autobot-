const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "remini",
  version: "1.0.0",
  permission: 0,
  credits: "IMRAN",
  description: "Enhance an image using Remini API",
  prefix: true,
  category: "image",
  usages: "reply to an image",
  cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
  const { messageReply, threadID, messageID } = event;

  if (
    !messageReply ||
    !messageReply.attachments ||
    messageReply.attachments.length === 0 ||
    messageReply.attachments[0].type !== "photo"
  ) {
    return api.sendMessage("📸 𝗣𝗹𝗲𝗮𝘀𝗲 𝗿𝗲𝗽𝗹𝘆 𝘁𝗼 𝗮 𝗽𝗵𝗼𝘁𝗼 𝘁𝗼 𝗲𝗻𝗵𝗮𝗻𝗰𝗲 𝗶𝘁!", threadID, messageID);
  }

  const imageUrl = messageReply.attachments[0].url;
  const apiKey = "6c9542b5-7070-48cb-b325-80e1ba65a451";
  const outputPath = path.join(__dirname, "cache", `remini_${Date.now()}.jpg`);

  // ⏳ Send waiting message
  const waitingMsg = await api.sendMessage("⏳ 𝗘𝗻𝗵𝗮𝗻𝗰𝗶𝗻𝗴 𝘁𝗵𝗲 𝗶𝗺𝗮𝗴𝗲 \n✨ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗯𝗲 𝗽𝗮𝘁𝗶𝗲𝗻𝘁 ✨", threadID, messageID);

  try {
    const response = await axios({
      method: "GET",
      url: `https://kaiz-apis.gleeze.com/api/remini?url=${encodeURIComponent(imageUrl)}&stream=true&apikey=${apiKey}`,
      responseType: "stream"
    });

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: "✅ 𝗜𝗺𝗮𝗴𝗲 𝗘𝗻𝗵𝗮𝗻𝗰𝗲𝗱 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆!🪄",
        attachment: fs.createReadStream(outputPath)
      }, threadID, () => {
        fs.unlinkSync(outputPath);
        api.unsendMessage(waitingMsg.messageID);
      });
    });

    writer.on("error", () => {
      fs.unlinkSync(outputPath);
      api.sendMessage("❌ 𝗢𝗼𝗽𝘀! 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝘀𝗮𝘃𝗲 𝘁𝗵𝗲 𝗲𝗻𝗵𝗮𝗻𝗰𝗲𝗱 𝗶𝗺𝗮𝗴𝗲.", threadID, messageID);
    });
  } catch (err) {
    console.error("Remini API Error:", err.message || err);
    api.sendMessage("❌ 𝗔𝗻 𝗲𝗿𝗿𝗼𝗿 𝗼𝗰𝗰𝘂𝗿𝗿𝗲𝗱 𝘄𝗵𝗶𝗹𝗲 𝗽𝗿𝗼𝗰𝗲𝘀𝘀𝗶𝗻𝗴 𝘁𝗵𝗲 𝗶𝗺𝗮𝗴𝗲.\n📡 𝗖𝗵𝗲𝗰𝗸 𝗔𝗣𝗜 𝗼𝗿 𝗶𝗺𝗮𝗴𝗲 𝗹𝗶𝗻𝗸.", threadID, messageID);
  }
};