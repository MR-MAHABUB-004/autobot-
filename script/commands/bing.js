const axios = require("axios");
const fs = require("fs-extra");
// dn
module.exports.config = {
  name: "bing",
  version: "1.0.0",
  permission: 0,
  credits: "IMRAN",
  description: "Search Bing image with a prompt",
  prefix: false,
  premium: false,
  category: "Image",
  usages: "bing <prompt>",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const prompt = args.join(" ");
  if (!prompt) return api.sendMessage("❌ Usage: bing <search term>", event.threadID, event.messageID);

  const rndm = [ '1CT6vA1F0M2g0Py7G97026c74Mdfeqjz33EymfA_r3xPMXLEu4VHoC38iG4aQ3QNQLM9Sg_cp9WbCBT_H_4op-0RSQxNxqUuUtl2PyUs0S6OEltTPi6EWugY8SicPmku6JYqHW_T-0-2xaf6_Dnu3c2STF7fhCMzFAFxIcgUoDkXwyvnC-H-CJ6dvu-SZorI65ZC52-PYRuxpMnt0DxbinAn2wnDg'

  ];
  const cookie = rndm[Math.floor(Math.random() * rndm.length)];

  // Step 1: Send "Please wait..." messages
  const waitMsg = await api.sendMessage("⏳ Please wait while fetching images...", event.threadID);

  try {
    const res = await axios.get(`https://bing-imran-v1.onrender.com/bing-img?prompt=${encodeURIComponent(prompt)}&cookie=${cookie}`);
    const data = res.data.result;
    if (!data || !data.length) {
      await api.unsendMessage(waitMsg.messageID);
      return api.sendMessage("❌ No results found.", event.threadID, event.messageID);
    }

    const imgData = [];
    for (let i = 0; i < data.length; i++) {
      const path = __dirname + `/cache/img${i}.jpg`;
      const img = (await axios.get(data[i], { responseType: "arraybuffer" })).data;
      fs.writeFileSync(path, Buffer.from(img, "utf-8"));
      imgData.push(fs.createReadStream(path));
    }

    // Step 2: Unsend "Please wait..." message before sending images
    await api.unsendMessage(waitMsg.messageID);

    await api.sendMessage({
      body: `📷 Bing Search Result\n\n🔎 Prompt: ${prompt}\n🖼️ Total Images: ${data.length}`,
      attachment: imgData
    }, event.threadID, event.messageID);

    // Clean up
    for (let i = 0; i < data.length; i++) {
      const path = __dirname + `/cache/img${i}.jpg`;
      if (fs.existsSync(path)) fs.unlinkSync(path);
    }
  } catch (e) {
    console.error(e);
    await api.unsendMessage(waitMsg.messageID);
    api.sendMessage("❌ An error occurred while fetching images.", event.threadID, event.messageID);
  }
};
