const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const https = require("https");

function deleteAfterTimeout(filePath, timeout = 15000) {
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (!err) console.log(`🗑️ Deleted: ${filePath}`);
        else console.error(`❌ Delete error for ${filePath}:`, err);
      });
    }
  }, timeout);
}

module.exports = {
  config: {
    name: "song",
    aliases: ["music"],
    version: "4.1",
    prefix: false,
    author: "‎MR᭄﹅ MAHABUB﹅ メꪜ (Optimized by ChatGPT)",
    countDown: 5,
    role: 0,
    shortDescription: "Download MP3 using YouTube search",
    longDescription: "Search YouTube for a song and download MP3 via Mahabub CDN API",
    category: "media",
    guide: "{p}{n} <song name>",
  },

  onStart: async function ({ api, event, args }) {
    if (!args.length) {
      return api.sendMessage(
        "» উফফ! কি গান শুনতে চাস তার ২/১ লাইন তো লেখবি না 😾",
        event.threadID,
        event.messageID
      );
    }

    const songName = args.join(" ");
    let statusMsg;

    try {
      // 🔍 Notify searching
      statusMsg = await api.sendMessage(
        `🔍 Searching for "${songName}"...`,
        event.threadID
      );

      // 🎧 YouTube search
      const searchResults = await ytSearch(songName);
      if (!searchResults.videos.length)
        throw new Error("No results found on YouTube.");

      const top = searchResults.videos[0];
      const ytUrl = `https://youtu.be/${top.videoId}`;

      // 🌐 Fetch audio link from API
      const apiUrl = `https://mahabub-ytmp3.vercel.app/api/cdn?url=${encodeURIComponent(
        ytUrl
      )}`;
      const res = await axios.get(apiUrl);

      if (!res.data?.status || !res.data?.cdna)
        throw new Error("Audio link not found or API error.");

      const title = res.data.title || top.title || "Unknown Title";
      const audioUrl = res.data.cdna;

      // ✏️ Update searching message
      await api.editMessage(
        `🎵 Found: ${title}\n⬇️ Downloading...`,
        statusMsg.messageID
      );

      // 🗂 File setup
      const safeFile = title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
      const ext = audioUrl.includes(".mp3") ? "mp3" : "m4a";
      const filePath = path.join(__dirname, "cache", `${safeFile}.${ext}`);

      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      // ⬇️ Download audio
      const file = fs.createWriteStream(filePath);
      await new Promise((resolve, reject) => {
        https
          .get(audioUrl, (res) => {
            if (res.statusCode !== 200)
              return reject(
                new Error(`Download failed [${res.statusCode}]`)
              );
            res.pipe(file);
            file.on("finish", () => file.close(resolve));
          })
          .on("error", reject);
      });

      // 🎶 Send song to user
      await api.sendMessage(
        {
          body: `🎶 ${title}\n✅ Download completed!`,
          attachment: fs.createReadStream(filePath),
        },
        event.threadID,
        (err) => {
          if (err) console.error("❌ Send error:", err);
          else deleteAfterTimeout(filePath, 10000); // auto delete after 10s
        },
        event.messageID
      );

      // ✅ Update status message
      await api.editMessage(`✅ Sent: ${title}`, statusMsg.messageID);
    } catch (err) {
      console.error("❌ Song command error:", err.message);

      const errorText =
        err.message.includes("ENOTFOUND") || err.message.includes("ECONNREFUSED")
          ? "🌐 API সার্ভার ডাউন আছে, একটু পরে চেষ্টা করো!"
          : `❌ Failed: ${err.message}`;

      if (statusMsg?.messageID) {
        api.editMessage(errorText, statusMsg.messageID);
      } else {
        api.sendMessage(errorText, event.threadID, event.messageID);
      }
    }
  },
};
