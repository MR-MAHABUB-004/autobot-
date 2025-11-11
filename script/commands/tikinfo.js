const axios = require("axios");
const fs = require("fs");

async function getBaseApiUrl() {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/itzaryan008/ERROR/refs/heads/main/raw/api.json");
    return res.data.apis;
  } catch {
    return null;
  }
}

module.exports.config = {
  name: "tikinfo",
  version: "1.0.0",
  permission: 0, // 0: all users
  credits: "ArYAN",
  description: "Get TikTok user info by username",
  prefix: false,
  premium: false,
  category: "📱 TikTok Tools",
  usages: "tikinfo <username>",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args, Threads, Users, getText }) => {
  const { threadID, messageID } = event;
  const username = args.join(" ");

  if (!username) {
    return api.sendMessage("⚠️ Please provide a valid TikTok username.\n\n📌 Usage: tikinfo username", threadID, messageID);
  }

  const base = await getBaseApiUrl();
  if (!base) {
    return api.sendMessage("❌ Failed to fetch API base URL.", threadID, messageID);
  }

  try {
    const res = await axios.get(`${base}/tikstalk`, {
      params: { username }
    });

    const data = res.data;
    const avatar = data.avatarLarger;
    const attachment = (await axios.get(avatar, { responseType: "stream" })).data;

    const message =
`👤 𝗧𝗶𝗸𝗧𝗼𝗸 𝗣𝗿𝗼𝗳𝗶𝗹𝗲 𝗜𝗻𝗳𝗼

🆔 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: ${data.username}
📛 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲: ${data.nickname}
❤️ 𝗟𝗶𝗸𝗲𝘀: ${data.heartCount}
👥 𝗙𝗼𝗹𝗹𝗼𝘄𝗲𝗿𝘀: ${data.followerCount}
🔁 𝗙𝗼𝗹𝗹𝗼𝘄𝗶𝗻𝗴: ${data.followingCount}
🎬 𝗩𝗶𝗱𝗲𝗼𝘀: ${data.videoCount}
🔗 𝗥𝗲𝗹𝗮𝘁𝗶𝗼𝗻: ${data.relation}`;

    api.sendMessage({ body: message, attachment }, threadID, messageID);
  } catch (err) {
    api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
  }
};