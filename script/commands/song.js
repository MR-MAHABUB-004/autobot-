const fs = require("fs");
const path = require("path");
const axios = require("axios");
const ytSearch = require("yt-search");
const https = require("https");

module.exports.config = {
  name: "song",
  version: "5.0.0",
  permission: 0,
  credits: "MR᭄﹅MAHABUB﹅メꪜ | Fixed by ChatGPT",
  description: "Search and download songs from YouTube (MP3 direct).",
  prefix: false,
  category: "media",
  usages: "song [music name]",
  cooldowns: 5,
  dependencies: {
    axios: "",
    ytSearch: "",
  },
};

function deleteAfterTimeout(filePath, timeout = 15000) {
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (!err) console.log(`✅ Deleted: ${filePath}`);
        else console.error(`❌ Delete error: ${filePath}`);
      });
    }
  }, timeout);
}

module.exports.run = async ({ api, event, args }) => {
  const query = args.join(" ");
  if (!query) {
    return api.sendMessage(
      "» উফফ! কি গান শুনতে চাস, তার ২/১ লাইন তো লেখবি নাকি 😾",
      event.threadID,
      event.messageID
    );
  }

  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  let searchingMessage;

  try {
    // 🔍 Searching
    searchingMessage = await api.sendMessage(
      `🔍 Searching for "${query}"... ⏳`,
      event.threadID
    );

    // 🔎 YouTube Search
    const result = await ytSearch(query);
    if (!result.videos.length)
      return api.editMessage(
        "⚠️ No results found. Try another song.",
        searchingMessage.messageID
      );

    const top = result.videos[0];
    const ytUrl = `https://youtu.be/${top.videoId}`;
    const title = top.title || "Unknown Title";

    await api.editMessage(
      `🎶 Found: ${title}\n⬇ Downloading...`,
      searchingMessage.messageID
    );

    // 🌐 Mahabub API Call
    const cdnUrl = `https://mahabub-ytmp3.vercel.app/api/cdn?url=${encodeURIComponent(
      ytUrl
    )}`;

    let data;
    try {
      const res = await axios.get(cdnUrl, { timeout: 15000 });
      data = res.data;
    } catch (err) {
      data = null;
      console.warn("⚠️ API timeout, fallback enabled.");
    }

    if (!data || !data.status || !data.cdna) {
      return api.editMessage(
        `⚠️ Failed to fetch MP3.\n🎧 Here's the YouTube link instead:\n${ytUrl}`,
        searchingMessage.messageID
      );
    }

    const audioLink = data.cdna;
    const safeFile = title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40);
    const ext = audioLink.includes(".mp3") ? "mp3" : "m4a";
    const filePath = path.join(cacheDir, `${safeFile}_${Date.now()}.${ext}`);

    // ⬇ Download Audio
    const file = fs.createWriteStream(filePath);
    await new Promise((resolve, reject) => {
      https
        .get(audioLink, (res) => {
          if (res.statusCode === 200) {
            res.pipe(file);
            file.on("finish", () => file.close(resolve));
          } else reject(new Error(`Download failed [${res.statusCode}]`));
        })
        .on("error", reject);
    });

    // 🎵 Send Audio
    await api.sendMessage(
      {
        body: `✅ Download Complete!\n🎧 Title: ${title}\n📥 Enjoy your song 🎶`,
        attachment: fs.createReadStream(filePath),
      },
      event.threadID,
      (err) => {
        if (!err) deleteAfterTimeout(filePath, 10000);
        else console.error("❌ Send message error:", err);
      },
      event.messageID
    );

    await api.editMessage(`✅ Sent: ${title}`, searchingMessage.messageID);
  } catch (err) {
    console.error("❌ Error:", err.message);
    if (searchingMessage?.messageID) {
      api.editMessage(`❌ Failed: ${err.message}`, searchingMessage.messageID);
    } else {
      api.sendMessage(
        `❌ Error: ${err.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
