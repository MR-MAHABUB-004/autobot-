const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "songx",
  version: "1.4",
  permission: 0,
  prefix: false,
  premium: false,
  credits: "Mostakim",
  Description: "Identify a song from a video/audio or link",
  category: "music",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  try {
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    let mediaUrl = args.join(" ").trim();

    // If user replied to a video/audio
    if (!mediaUrl && event.messageReply?.attachments?.length) {
      const att = event.messageReply.attachments[0];
      if (att.type === "video" || att.type === "audio") {
        mediaUrl = att.url;
      }
    }

    if (!mediaUrl) {
      return api.sendMessage(
        "❌ Please provide a video/audio URL or reply to a video/audio message.",
        event.threadID,
        event.messageID
      );
    }

    const apiUrl = `https://www.noobs-api.rf.gd/dipto/songFind?url=${encodeURIComponent(mediaUrl)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.track || !data.track.title) {
      return api.sendMessage("⚠️ No song match found.", event.threadID, event.messageID);
    }

    const t = data.track;

    const album =
      t.sections?.[0]?.metadata?.find((m) => m.title === "Album")?.text || "N/A";
    const release =
      t.sections?.[0]?.metadata?.find((m) => m.title === "Released")?.text || "N/A";

    let msg = `🎶 Song Identified\n\n`;
    msg += `• Title: ${t.title}\n`;
    msg += `• Artist(s): ${t.subtitle}\n`;
    msg += `• Album: ${album}\n`;
    msg += `• Released: ${release}\n`;
    msg += `• Genre: ${t.genres?.primary || "N/A"}`;

    // Find .m4a preview link
    let previewUrl = null;
    const actions = t.hub?.actions || [];
    for (const a of actions) {
      if (a.type === "uri" && a.uri.endsWith(".m4a")) {
        previewUrl = a.uri;
        break;
      }
    }

    if (!previewUrl && t.hub?.options?.length) {
      for (const opt of t.hub.options) {
        if (opt.actions) {
          const u = opt.actions.find(
            (ac) => ac.type === "uri" && ac.uri.endsWith(".m4a")
          );
          if (u) {
            previewUrl = u.uri;
            break;
          }
        }
      }
    }

    api.setMessageReaction("✅", event.messageID, () => {}, true);

    // Handle preview audio
    if (previewUrl) {
      const filePath = path.join(__dirname, `song_preview_${Date.now()}.m4a`);
      const writer = fs.createWriteStream(filePath);
      const response = await axios.get(previewUrl, { responseType: "stream" });
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          {
            body: msg,
            attachment: fs.createReadStream(filePath)
          },
          event.threadID,
          () => fs.unlinkSync(filePath), // Delete after sending
          event.messageID
        );
      });

      writer.on("error", (err) => {
        console.error("File write error:", err);
        api.sendMessage(
          msg + "\n\n(Audio preview failed to load 🎧)",
          event.threadID,
          event.messageID
        );
      });
    } else {
      return api.sendMessage(
        msg + "\n\n(No audio preview available 🎧)",
        event.threadID,
        event.messageID
      );
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    return api.sendMessage(
      "❌ Error while fetching song info or audio preview.",
      event.threadID,
      event.messageID
    );
  }
};
