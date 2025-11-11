const moment = require("moment-timezone");
const os = require("os");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "admin",
  version: "2.0.0",
  permission: 0,
  credits: "⩸_ Imran _⩸",
  description: "Displays dynamic bot and owner information",
  prefix: true,
  premium: false,
  category: "Info",
  usages: "botinfo",
  cooldowns: 5
};

module.exports.run = async ({ api, event, Users }) => {
  const timeNow = moment().tz("Asia/Dhaka").format("MMMM Do YYYY, h:mm:ss A");
  const uptime = process.uptime();
  const hours = Math.floor(uptime / (60 * 60));
  const minutes = Math.floor((uptime % (60 * 60)) / 60);
  const seconds = Math.floor(uptime % 60);
  const userName = await Users.getNameUser(event.senderID);

  const message = `
✨《 𝐁𝐨𝐭 𝐀𝐧𝐝 𝐎𝐰𝐧𝐞𝐫 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 》🎀

🤖彡𝐵𝑜𝑡 𝑁𝑎𝑚𝑒 : 💫「𝐈𝐌𝐑𝐀𝐍」🩷🪽
👾彡𝐵𝑜𝑡 𝑃𝑟𝑒𝑓𝑖𝑥 : /
💙彡𝑂𝑤𝑛𝑒𝑟 : ⩸_ 𝐈𝐦𝐫𝐚𝐧 𝐀𝐡𝐦𝐞𝐝 _⩸
📝彡𝐴𝑔𝑒 : 『 ⩸_ 19 _⩸ 』
💕彡𝑅𝑒𝑙𝑎𝑡𝑖𝑜𝑛𝑆ℎ𝑖𝑝: ⩸____⩸
📱彡𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 : wa.me/+8801689903267
🌐彡𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 : ⬇️
👉 [𝗜𝗺𝗿𝗮𝗻 𝗔𝗵𝗺𝗲𝗱](https://www.facebook.com/Imran.Ahmed099)
✉️彡𝐌𝐞𝐬𝐬𝐞𝐧𝐠𝐞𝐫 : ⬇️
📩 [𝗠𝗲𝘀𝘀𝗮𝗴𝗲 𝗠𝗲](https://m.me/Imran.Ahmed099)

🗓彡𝐷𝑎𝑡𝑒 : ${moment().tz("Asia/Dhaka").format("MMMM Do YYYY")}
⏰彡𝑁𝑜𝑤 : ${timeNow}
📛彡𝐵𝑜𝑡 𝑈𝑝𝑡𝑖𝑚𝑒 : ${hours}h ${minutes}m ${seconds}s
🙋彡𝐹𝑜𝑟 𝑈𝑠𝑒𝑟 : ${userName}

💌彡𝐵𝑜𝑡 𝑅𝑒𝑎𝑑𝑦 𝑇𝑜 𝐻𝑢𝑚 𝑊𝑖𝑡ℎ 𝑌𝑜𝑢 😚🎶
`.trim();

  const imageURL = "https://i.ibb.co/j9wP3qwk/IMG-6474.jpg";
  const imgPath = path.join(__dirname, 'cache', 'admin_info.jpg');

  try {
    const response = await axios.get(imageURL, { responseType: "stream" });
    const writer = fs.createWriteStream(imgPath);
    response.data.pipe(writer);

    writer.on("finish", async () => {
      await api.sendMessage({
        body: message,
        attachment: fs.createReadStream(imgPath)
      }, event.threadID, () => fs.unlinkSync(imgPath));
    });

    writer.on("error", (err) => {
      throw new Error("Image download failed");
    });
  } catch (err) {
    console.error(err);
    api.sendMessage(message, event.threadID, event.messageID);
  }
};