const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "fluxv",
  version: "2.0.0",
  permission: 0,
  credits: "IMRAN",
  description: "Flux Image Generator",
  prefix: false,
  premium: false,
  category: "Image Generator",
  usages: "flux [prompt]",
  cooldowns: 15
};

module.exports.run = async ({ api, event, args }) => {
  const apiBase = "https://masterapi.fun";

  try {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("⚠️ Please provide a prompt to generate an image.", event.threadID);

    const waitMessage = await api.sendMessage("Generating image, please wait... 😘", event.threadID);
    api.setMessageReaction("⌛", event.messageID, () => {}, true);

    const response = await axios.get(`${apiBase}/api/flux`, {
      params: {
        prompt: prompt
      }
    });

    if (!response.data || !response.data.data) {
      throw new Error("Failed to retrieve image URL.");
    }

    const imageUrl = response.data.data;
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const fileName = path.join(__dirname, `flux_${Date.now()}.jpg`);
    fs.writeFileSync(fileName, Buffer.from(imageResponse.data, 'binary'));

    api.setMessageReaction("✅", event.messageID, () => {}, true);
    api.unsendMessage(waitMessage.messageID);

    api.sendMessage({
      body: `🖼️ Here's your image!`,
      attachment: fs.createReadStream(fileName)
    }, event.threadID, () => {
      fs.unlinkSync(fileName); // Delete file after sending
    });

  } catch (e) {
    console.error(e);
    api.sendMessage("❌ Error: " + e.message, event.threadID, event.messageID);
  }
};