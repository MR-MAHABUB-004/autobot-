const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "upscale",
  version: "1.0.1",
  permission: 0,
  credits: "Mahabub",
  description: "Reply to an image to upscale it",
  prefix: true,
  premium: false,
  category: "image",
  usages: "Reply to an image",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  try {
    if (
      event.type !== "message_reply" ||
      !event.messageReply.attachments[0] ||
      event.messageReply.attachments[0].type !== "photo"
    ) {
      return api.sendMessage("⚠️ Please reply to an image.", event.threadID, event.messageID);
    }

    const imageUrl = event.messageReply.attachments[0].url;

    api.sendMessage("⏳ Upscaling your image, please wait...", event.threadID, event.messageID);

    const upscaleApi = `http://veda.hidencloud.com:24611/upscale?url=${encodeURIComponent(imageUrl)}`;
    const res = await axios.get(upscaleApi);

    if (res.data?.status && res.data.result?.data?.downloadUrls?.length > 0) {
      const upscaledUrl = res.data.result.data.downloadUrls[0];

      // save file temporarily
      const tempPath = path.join(__dirname, `cache_${Date.now()}.jpg`);
      const writer = fs.createWriteStream(tempPath);

      const response = await axios.get(upscaledUrl, { responseType: "stream" });
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          {
            body: `✅ Image upscaled successfully!`,
            attachment: fs.createReadStream(tempPath)
          },
          event.threadID,
          () => fs.unlinkSync(tempPath), // delete after sending
          event.messageID
        );
      });

      writer.on("error", (err) => {
        console.error(err);
        api.sendMessage("❌ Failed to process upscaled image.", event.threadID, event.messageID);
      });
    } else {
      api.sendMessage("❌ Failed to upscale image.", event.threadID, event.messageID);
    }
  } catch (err) {
    console.error(err);
    api.sendMessage("⚠️ Error while upscaling image.", event.threadID, event.messageID);
  }
};