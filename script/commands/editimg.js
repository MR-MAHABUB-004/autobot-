const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "editimg",
  version: "1.0.0",
  permission: 0,
  credits: "IMRAN",
  description: "AI image editing using prompt + image or attachment",
  prefix: true,
  category: "image",
  usages: "editimg [prompt] + reply image or link",
  cooldowns: 5,
  dependencies: { axios: "" }
};

module.exports.run = async ({ api, event, args }) => {
  let linkanh = event.messageReply?.attachments?.[0]?.url || null;
  const prompt = args.join(" ").split("|")[0]?.trim();

  // if link provided after the pipe
  if (!linkanh && args.length > 1) {
    linkanh = args.join(" ").split("|")[1]?.trim();
  }

  // graceful usage notice
  if (!linkanh || !prompt) {
    return api.sendMessage(
      `📸 𝙀𝘿𝙄𝙏•𝙄𝙈𝙂\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `⛔️ 𝙔𝙤𝙪 𝙢𝙪𝙨𝙩 𝙜𝙞𝙫𝙚 𝙗𝙤𝙩𝙝 𝙖 𝙥𝙧𝙤𝙢𝙥𝙩 𝙖𝙣𝙙 𝙖𝙣 𝙞𝙢𝙖𝙜𝙚!\n\n` +
      `✨ 𝑬𝒙𝒂𝒎𝒑𝒍𝒆:\n` +
      `▶️ editimg add cute girlfriend |\n\n` +
      `🖼️ 𝑶𝒓 𝑹𝒆𝒑𝒍𝒚 𝒕𝒐 𝒂𝒏 𝒊𝒎𝒂𝒈𝒆:\n` +
      `▶️ editimg add cute girlfriend`,
      event.threadID,
      event.messageID
    );
  }

  linkanh = linkanh.replace(/\s/g, "");
  if (!/^https?:\/\//.test(linkanh)) {
    return api.sendMessage(
      `⚠️ 𝙄𝙣𝙫𝙖𝙡𝙞𝙙 𝙞𝙢𝙖𝙜𝙚 𝙐𝙍𝙇!\n` +
      `🔗 𝙈𝙪𝙨𝙩 𝙨𝙩𝙖𝙧𝙩 𝙬𝙞𝙩𝙝 http:// 𝙤𝙧 https://`,
      event.threadID,
      event.messageID
    );
  }

  const apiUrl = `https://ai-image-edting.vercel.app/gen?prompt=${encodeURIComponent(
    prompt
  )}&image=${encodeURIComponent(linkanh)}`;

  try {
    const tempPath = path.join(
      __dirname,
      "cache",
      `edited_${event.senderID}.jpg`
    );
    const response = await axios({
      method: "GET",
      url: apiUrl,
      responseType: "stream"
    });

    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        {
          body:
            `✅ 𝙀𝘿𝙄𝙏•𝙄𝙈𝙂 𝙁𝙞𝙣𝙞𝙨𝙝𝙚𝙙!\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n` +
            `🔍 𝙋𝙧𝙤𝙢𝙥𝙩: “${prompt}”\n` +
            `🖼️ 𝙄𝙢𝙖𝙜𝙚 𝙩𝙖 𝙧𝙚𝙖𝙙𝙮! 𝙀𝙣𝙟𝙤𝙮 💖`,
          attachment: fs.createReadStream(tempPath)
        },
        event.threadID,
        () => fs.unlinkSync(tempPath),
        event.messageID
      );
    });

    writer.on("error", (err) => {
      console.error(err);
      api.sendMessage(
        "❌ 𝙁𝙖𝙞𝙡𝙚𝙙 𝙩𝙤 𝙨𝙖𝙫𝙚 𝙩𝙝𝙚 𝙞𝙢𝙖𝙜𝙚 𝙛𝙞𝙡𝙚.",
        event.threadID,
        event.messageID
      );
    });
  } catch (error) {
    console.error(error);
    return api.sendMessage(
      "❌ 𝙁𝙖𝙞𝙡𝙚𝙙 𝙩𝙤 𝙜𝙚𝙣𝙚𝙧𝙖𝙩𝙚 𝙞𝙢𝙖𝙜𝙚. 𝙏𝙧𝙮 𝙖𝙜𝙖𝙞𝙣 𝙡𝙖𝙩𝙚𝙧.",
      event.threadID,
      event.messageID
    );
  }
};