const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "sd",
  version: "1.1.0",
  permission: 0,
  credits: "IMRAN",
  description: "Search and download media (audio/video) from a URL or replied media.",
  prefix: false,
  premium: false,
  category: "Media",
  usages: "[reply media or provide URL]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const link = event.messageReply?.attachments?.[0]?.url || args.join(" ");
  if (!link) return api.sendMessage('[⚜️]➜ Please provide an image or video link.', event.threadID, event.messageID);

  try {
    const cleanedLink = link.trim().replace(/\s/g, '');
    if (!/^https?:\/\//.test(cleanedLink)) {
      return api.sendMessage('[⚜️]➜ Invalid URL: must start with http:// or https://', event.threadID, event.messageID);
    }

    const encodedUrl = encodeURIComponent(cleanedLink);
    const { data } = await axios.get(`http://65.109.80.126:20392/nayan/song?url=${encodedUrl}`);

    if (!data || data.length === 0) {
      return api.sendMessage(`[⚜️]➜ No results found for this media.`, event.threadID, event.messageID);
    }

    let msg = `Here are the results:\n\n`;
    data.forEach((item, index) => {
      msg += `${index + 1}. ${item.title}\nDuration: ${item.length}\n\n`;
    });
    msg += `Reply with a number (e.g., 1) to choose.`;

    const message = await api.sendMessage(msg, event.threadID, event.messageID);

    const botID = await api.getCurrentUserID();
    global.client.handleReply = global.client.handleReply || new Map();

    const handleReplyData = global.client.handleReply.get(botID) || [];
    handleReplyData.push({
      name: module.exports.config.name,
      messageID: message.messageID,
      author: event.senderID,
      results: data,
      originalLink: cleanedLink,
      type: "choose"
    });

    global.client.handleReply.set(botID, handleReplyData);

  } catch (error) {
    console.error(error);
    return api.sendMessage('[⚜️]➜ Error fetching data.', event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function ({ api, event }) {
  const botID = await api.getCurrentUserID();
  global.client.handleReply = global.client.handleReply || new Map();

  const handleReplyData = global.client.handleReply.get(botID) || [];
  const index = handleReplyData.findIndex(item => item.messageID === event.messageReply?.messageID);

  if (index === -1) return;

  const handleReply = handleReplyData[index];
  const reply = event.body.trim();
  api.unsendMessage(handleReply.messageID);

  // Clean up the used handleReply entry
  handleReplyData.splice(index, 1);
  global.client.handleReply.set(botID, handleReplyData);

  // Step 1: User selects media from list
  if (handleReply.type === "choose") {
    const choice = parseInt(reply);
    if (isNaN(choice) || choice < 1 || choice > handleReply.results.length) {
      return api.sendMessage("[⚜️]➜ Invalid choice. Please reply with a valid number.", event.threadID, event.messageID);
    }

    const selected = handleReply.results[choice - 1];
    const ytUrlEncoded = encodeURIComponent(selected.url);

    const message = await api.sendMessage(
      `You selected:\n${selected.title}\n\nReply with:\n1 ➜ Download Audio\n2 ➜ Download Video`,
      event.threadID,
      event.messageID
    );

    handleReplyData.push({
      name: module.exports.config.name,
      messageID: message.messageID,
      author: event.senderID,
      ytUrl: ytUrlEncoded,
      title: selected.title,
      type: "download"
    });

    global.client.handleReply.set(botID, handleReplyData);
  }

  // Step 2: Downloading selected media
  else if (handleReply.type === "download") {
    if (reply !== '1' && reply !== '2') {
      return api.sendMessage("[⚜️]➜ Please reply with 1 for audio or 2 for video.", event.threadID, event.messageID);
    }

    const type = reply === '1' ? "audio" : "video";
    try {
      const { data } = await axios.get(`https://nayan-video-downloader.vercel.app/ytdown?url=${handleReply.ytUrl}`);
      if (!data?.status || !data?.data) {
        return api.sendMessage("[⚜️]➜ Failed to fetch download URL.", event.threadID, event.messageID);
      }

      const downloadUrl = data.data.video;
      const fileName = `download_${Date.now()}.${type === 'audio' ? 'mp3' : 'mp4'}`;
      const filePath = path.join(__dirname, 'cache', fileName);

      const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, Buffer.from(response.data, 'binary'));

      api.sendMessage({
        body: `✅ Here is your ${type}:\n${handleReply.title}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        fs.unlinkSync(filePath);
      }, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("[⚜️]➜ Error while downloading media.", event.threadID, event.messageID);
    }
  }
};