const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "imagine",
  version: "1.0.0",
  permission: 0,
  credits: "Nayan",
  description: "Generate images from prompts using an external API",
  prefix: false,
  premium: false,
  category: "Image",
  usages: "imagine <prompt>",
  cooldowns: 10
};

module.exports.run = async ({ api, event, args }) => {
  const prompt = args.join(" ");
  if (!prompt) {
    return api.sendMessage("⚠️ Please provide a prompt.\nUsage: imagine <prompt>", event.threadID, event.messageID);
  }

  try {
    const apis = await axios.get('https://raw.githubusercontent.com/MOHAMMAD-NAYAN-07/Nayan/main/api.json');
    const apiUrl = apis.data.api;
    const res = await axios.get(`${apiUrl}/nayan/img?prompt=${encodeURIComponent(prompt)}`);
    const imageUrls = res.data.imageUrls;

    if (!imageUrls || imageUrls.length === 0) {
      return api.sendMessage("❌ No images found.", event.threadID, event.messageID);
    }

    let imgData = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const path = __dirname + `/cache/${i + 1}.jpg`;
      const imageBuffer = (await axios.get(imageUrls[i], { responseType: 'arraybuffer' })).data;
      fs.writeFileSync(path, Buffer.from(imageBuffer, 'utf-8'));
      imgData.push(fs.createReadStream(path));
    }

    api.sendMessage({
      body: `🔍 Imagine Result\n\n📝 Prompt: ${prompt}\n#️⃣ Images: ${imageUrls.length}`,
      attachment: imgData
    }, event.threadID, async () => {
      // Clean up cached images after sending
      for (let i = 0; i < imageUrls.length; i++) {
        const path = __dirname + `/cache/${i + 1}.jpg`;
        if (fs.existsSync(path)) fs.unlinkSync(path);
      }
    });

  } catch (error) {
    console.error(error);
    api.sendMessage("⚠️ An error occurred while generating the image.", event.threadID, event.messageID);
  }
};
