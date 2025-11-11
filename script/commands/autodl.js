const fs = require("fs-extra");
const axios = require("axios");
const request = require("request");
const https = require("https");

module.exports.config = {
  name: "auto",
  version: "0.0.2",
  permission: 0,
  credits: "mahabub",
  description: "Auto video downloader",
  prefix: false,
  premium: false,
  category: "User",
  usages: "",
  cooldowns: 5
};

  module.exports.run: async function({ api, event, args }) {
    const threadID = event.threadID;
    const messageID = event.messageID;
    const message = (event.body || "").trim();

    // If no link, prompt user
    const linkMatch = message.match(/(https?:\/\/[^\s]+)/);
    if (!linkMatch) {
      return api.sendMessage("📥 Send the link to download the video 🎥", threadID, messageID);
    }

    const videoLink = linkMatch[0];
    api.setMessageReaction("♻️", messageID, () => {}, true);

    const isFacebook = videoLink.includes("facebook.com");

    const headers = isFacebook
      ? {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Accept": "*/*",
          "Referer": "https://www.facebook.com/"
        }
      : {
          "User-Agent": "Mozilla/5.0"
        };

    const httpsAgent = isFacebook
      ? new https.Agent({ family: 4 })
      : undefined;

    try {
      // Get API Base URL
      const jsonRes = await axios.get("https://raw.githubusercontent.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/main/APIURL.json");
      const apiBaseURL = jsonRes.data.Alldl;

      // Call video API
      const response = await axios.get(
        `${apiBaseURL}${encodeURIComponent(videoLink)}`,
        { headers, httpsAgent }
      );

      const { platform, title, hd, sd } = response.data;
      const downloadURL = hd || sd;

      if (!downloadURL) {
        api.setMessageReaction("⚠️", messageID, () => {}, true);
        return api.sendMessage("❌ Could not fetch video link from the provided URL.", threadID, messageID);
      }

      const filePath = "video.mp4";

      request({ url: downloadURL, headers })
        .pipe(fs.createWriteStream(filePath))
        .on("close", async () => {
          api.setMessageReaction("✔️", messageID, () => {}, true);
          await api.sendMessage({
            body: `✅ Downloaded!\n\n📌 Platform: ${platform || "Unknown"}\n🎬 Title: ${title || "No Title"}\n📥 Quality: ${hd ? "HD" : "SD"}`,
            attachment: fs.createReadStream(filePath)
          }, threadID, () => fs.unlinkSync(filePath));
        })
        .on("error", (err) => {
          console.error("File Write Error:", err);
          api.setMessageReaction("❌", messageID, () => {}, true);
          api.sendMessage("❌ Error fetching video file.", threadID, messageID);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });

    } catch (err) {
      console.error("API Error:", err.response?.data || err.message || err);
      api.setMessageReaction("❌", messageID, () => {}, true);
      api.sendMessage("❌ Failed to process video link.", threadID, messageID);
    }
  }
};



