module.exports.config = {
  name: "avt", // Command name
  version: "1.0.0", // Command version
  permission: 0, // Permission level
  credits: "Nayan converted by Ryuko Developer", // Creator of the code
  description: "Get avatar images from user or box", // Command description
  prefix: false, // Use prefix
  premium: false, // Premium feature
  category: "User", // Command category
  usages: "avt [box|id|link|user]", // Command usage
  cooldowns: 5 // Cooldown in seconds
};

module.exports.run = async ({ api, event, args, Threads, Users }) => {
  const fs = require("fs");
  const axios = require("axios");
  const request = require("request");
  const path = __dirname + "/cache/1.png";
  const threadSetting = (await Threads.getData(String(event.threadID))).data || {};
  const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;
  const name = this.config.name;

  if (!args[0]) {
    return api.sendMessage(
      `[🔰] FB-AVATAR [🔰]\n\n[🔰]→ ${prefix}${name} box\n[🔰]→ ${prefix}${name} id [uid]\n[🔰]→ ${prefix}${name} link [link]\n[🔰]→ ${prefix}${name} user [@mention or blank]`,
      event.threadID,
      event.messageID
    );
  }

  const downloadImage = (url, callback) => {
    return request(encodeURI(url))
      .pipe(fs.createWriteStream(path))
      .on('close', callback);
  };

  if (args[0] === "box") {
    const threadID = args[1] || event.threadID;
    const threadInfo = await api.getThreadInfo(threadID);
    const imageSrc = threadInfo.imageSrc;

    if (!imageSrc) return api.sendMessage(`[🔰]→ Box "${threadInfo.threadName}" does not have an avatar.`, event.threadID, event.messageID);

    return downloadImage(imageSrc, () => {
      api.sendMessage({
        body: `[🔰]→ Avatar of box "${threadInfo.threadName}"`,
        attachment: fs.createReadStream(path)
      }, event.threadID, () => fs.unlinkSync(path), event.messageID);
    });
  }

  if (args[0] === "id") {
    const uid = args[1];
    if (!uid) return api.sendMessage(`[🔰]→ Please enter a UID to get avatar.`, event.threadID, event.messageID);

    const url = `https://graph.facebook.com/${uid}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    return downloadImage(url, () => {
      api.sendMessage({
        attachment: fs.createReadStream(path)
      }, event.threadID, () => fs.unlinkSync(path), event.messageID);
    });
  }

  if (args[0] === "link") {
    const link = args[1];
    if (!link) return api.sendMessage(`[🔰]→ Please enter a Facebook profile link.`, event.threadID, event.messageID);

    try {
      const tool = require("fb-tools");
      const uid = await tool.findUid(link);
      const url = `https://graph.facebook.com/${uid}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      return downloadImage(url, () => {
        api.sendMessage({
          attachment: fs.createReadStream(path)
        }, event.threadID, () => fs.unlinkSync(path), event.messageID);
      });
    } catch (e) {
      return api.sendMessage(`[🔰]→ User does not exist or UID could not be found.`, event.threadID, event.messageID);
    }
  }

  if (args[0] === "user") {
    let uid;

    if (!args[1]) {
      uid = event.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
      uid = Object.keys(event.mentions)[0];
    } else {
      return api.sendMessage(`[🔰]→ Incorrect usage. Use ${prefix}${name} to check command usage.`, event.threadID, event.messageID);
    }

    const url = `https://graph.facebook.com/${uid}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    return downloadImage(url, () => {
      api.sendMessage({
        attachment: fs.createReadStream(path)
      }, event.threadID, () => fs.unlinkSync(path), event.messageID);
    });
  }

  return api.sendMessage(`[🔰]→ Incorrect command. Use ${prefix}${name} to see all usage options.`, event.threadID, event.messageID);
};
