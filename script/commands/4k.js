const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "4k",
  version: "1.0.0",
  permission: 0, // All users
  credits: "IMRAN",
  description: "Enhance Photo",
  prefix: false,
  premium: false,
  category: "Image",
  usages: "reply to an image",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const cachePath = __dirname + "/cache/enhanced.jpg";
  const { threadID, messageID, messageReply } = event;

  const imageUrl = messageReply?.attachments?.[0]?.url || args.join(" ");
  if (!imageUrl) {
    return api.sendMessage("Please reply to a photo.", threadID, messageID);
  }

  try {
    const waitingMessage = await api.sendMessage("𝐏𝐥𝐞𝐚𝐬𝐞 𝐖𝐚𝐢𝐭 𝐁𝐚𝐛𝐲...😘", threadID);
    const response = await axios.get("https://yt-video-production.up.railway.app/upscale?imageUrl=" + encodeURIComponent(imageUrl));
    const enhancedImageUrl = response.data.imageUrl;

    const imageData = (await axios.get(enhancedImageUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(cachePath, Buffer.from(imageData, "binary"));

    api.sendMessage({
      body: "𝐈𝐦𝐚𝐠𝐞 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!",
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => fs.unlinkSync(cachePath), messageID);

    api.unsendMessage(waitingMessage.messageID);
  } catch (err) {
    api.sendMessage("Error processing image: " + err.message, threadID, messageID);
  }
};
