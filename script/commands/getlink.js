module.exports.config = {
  name: "getlink",
  version: "1.0.0",
  permission: 2,
  credits: "nayan",
  description: "Get the URL of a downloaded video, audio, or image from a replied message.",
  prefix: false,
  premium: false,
  category: "User",
  usages: "Reply to an audio/video/image and use this command",
  cooldowns: 5
};

module.exports.languages = {
  "vi": {
    "invalidFormat": "❌ Tin nhắn bạn phản hồi phải là một audio, video, ảnh nào đó"
  },
  "en": {
    "invalidFormat": "❌ You need to reply to a message containing an audio, video, or picture"
  }
};

module.exports.run = async ({ api, event, args, Threads, Users, getText }) => {
  if (event.type !== "message_reply") {
    return api.sendMessage(getText("invalidFormat"), event.threadID, event.messageID);
  }
  if (!event.messageReply.attachments || event.messageReply.attachments.length === 0) {
    return api.sendMessage(getText("invalidFormat"), event.threadID, event.messageID);
  }
  if (event.messageReply.attachments.length > 1) {
    return api.sendMessage(getText("invalidFormat"), event.threadID, event.messageID);
  }
  return api.sendMessage(event.messageReply.attachments[0].url, event.threadID, event.messageID);
};
