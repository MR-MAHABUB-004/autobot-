const axios = require("axios");
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");

module.exports.config = {
  name: "album",
  version: "2.0.0",
  permission: 0,
  prefix: false,
  credits: "Nayan (Modified by Imran)",
  description: "Random video menu with reply system",
  category: "user",
  usages: "video2",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  const { threadID, senderID } = event;

  const menu =
    "====「 𝐕𝐈𝐃𝐄𝐎 」====\n━━━━━━━━━━━━━\n" +
    "𝟙. 𝐋𝐎𝐕𝐄 𝐕𝐈𝐃𝐄𝐎 💞\n" +
    "𝟚. 𝐂𝐎𝐔𝐏𝐋𝐄 𝐕𝐈𝐃𝐄𝐎 💕\n" +
    "𝟛. 𝐒𝐇𝐎𝐑𝐓 𝐕𝐈𝐃𝐄𝐎 📽\n" +
    "𝟜. 𝐒𝐀𝐃 𝐕𝐈𝐃𝐄𝐎 😔\n" +
    "𝟝. 𝐒𝐓𝐀𝐓𝐔𝐒 𝐕𝐈𝐃𝐄𝐎 📝\n" +
    "𝟞. 𝐒𝐇𝐀𝐈𝐑𝐈 🎤\n" +
    "𝟟. 𝐁𝐀𝐁𝐘 𝐕𝐈𝐃𝐄𝐎 😻\n" +
    "𝟠. 𝐀𝐍𝐈𝐌𝐄 𝐕𝐈𝐃𝐄𝐎 🌸\n" +
    "𝟡. 𝐇𝐔𝐌𝐀𝐈𝐘𝐔𝐍 𝐅𝐎𝐑𝐈𝐃 ❄\n" +
    "𝟙𝟘. 𝐈𝐒𝐋𝐀𝐌𝐈𝐊 𝐕𝐈𝐃𝐄𝐎 🤲\n\n" +
    "===「 𝟏𝟖+ 𝐕𝐈𝐃𝐄𝐎 」===\n━━━━━━━━━━━━━\n" +
    "𝟙𝟙. 𝐇𝐎𝐑𝐍𝐘 𝐕𝐈𝐃𝐄𝐎 🥵\n" +
    "𝟙𝟚. 𝐇𝐎𝐓 🔞\n" +
    "𝟙𝟛. 𝐈𝐓𝐄𝐌 🎬\n\n" +
    "📥 Reply with a number to get a video.";

  return api.sendMessage(menu, threadID, async (err, info) => {
    if (err) return console.error(err);
    const botID = await api.getCurrentUserID();
    const handleReplyList = global.client.handleReply.get(botID) || [];

    handleReplyList.push({
      name: module.exports.config.name,
      messageID: info.messageID,
      author: senderID,
    });

    global.client.handleReply.set(botID, handleReplyList);
  });
};

module.exports.handleReply = async function ({ api, event }) {
  const { threadID, senderID, body, messageReply } = event;
  const botID = await api.getCurrentUserID();
  const handleList = global.client.handleReply.get(botID) || [];

  const handler = handleList.find(
    (h) => h.messageID === messageReply?.messageID
  );
  if (!handler || handler.author !== senderID) return;

  async function linkanh(choice) {
    const apis = await axios.get(
      "https://raw.githubusercontent.com/MOHAMMAD-NAYAN-07/Nayan/main/api.json"
    );
    const n = apis.data.api;
    const options = {
      "1": "/video/love",
      "2": "/video/cpl",
      "3": "/video/shortvideo",
      "4": "/video/sadvideo",
      "5": "/video/status",
      "6": "/video/shairi",
      "7": "/video/baby",
      "8": "/video/anime",
      "9": "/video/humaiyun",
      "10": "/video/islam",
      "11": "/video/horny",
      "12": "/video/hot",
      "13": "/video/item",
    };
    const h = `${n}${options[choice]}`;
    return h || null;
  }

  const videoLink = await linkanh(body.trim());
  if (!videoLink)
    return api.sendMessage("❌ Invalid number. Please try again.", threadID);

  try {
    const response = await axios.get(videoLink);
    const data = response.data.data;
    const caption = response.data.nayan || "🎬 Here's your video!";
    const count = response.data.count || "N/A";

    const videoRes = await axios.get(data, { responseType: "arraybuffer" });
    const tempPath = path.join(
      __dirname,
      "cache",
      `video_${Date.now()}.mp4`
    );
    await fs.writeFile(tempPath, Buffer.from(videoRes.data));

    await api.sendMessage(
      {
        body: `${caption}\n\n¤《𝐓𝐎𝐓𝐀𝐋 𝐕𝐈𝐃𝐄𝐎: ${count}》¤`,
        attachment: fsSync.createReadStream(tempPath),
      },
      threadID,
      async () => {
        await fs.unlink(tempPath);
      }
    );

    // Clean reply listener
    const updatedList = handleList.filter(
      (item) => item.messageID !== handler.messageID
    );
    global.client.handleReply.set(botID, updatedList);
  } catch (err) {
    console.error("❌ Video fetch error:", err);
    return api.sendMessage(
      "⚠️ Failed to load video. Please try again later.",
      threadID
    );
  }
};