const axios = require("axios");

module.exports.config = {
  name: "zombie",
  version: "1.0.4",
  permission: 0,
  credits: "IMRAN",
  description: "Make a zombie effect on user image (stream)",
  prefix: false,
  category: "image",
  usages: "zombie [reply/mention]",
  cooldowns: 5,
  dependencies: {
    "axios": "^1.6.0"
  }
};

module.exports.run = async ({ api, event }) => {
  try {
    let imgurl;

    // reply image
    if (event.type === "message_reply" && event.messageReply.attachments[0]?.url) {
      imgurl = event.messageReply.attachments[0].url;
    }
    // mention image
    else if (Object.keys(event.mentions).length > 0) {
      const uid = Object.keys(event.mentions)[0];
      imgurl = `https://fb-avatar-imran.vercel.app/fbp?uid=${uid}`;
    }
    // self image
    else {
      imgurl = `https://fb-avatar-imran.vercel.app/fbp?uid=${event.senderID}`;
    }

    const apiUrl = `https://rubish-apihub.onrender.com/rubish/zombie?imgurl=${encodeURIComponent(imgurl)}&apikey=rubish69`;

    // Send waiting message first
    api.sendMessage("⏳ Please wait, applying zombie effect...", event.threadID, async (err, info) => {
      if (err) return console.error(err);

      try {
        // axios stream
        const response = await axios({
          url: apiUrl,
          method: "GET",
          responseType: "stream"
        });

        // Unsend waiting message
        api.unsendMessage(info.messageID);

        // Send completed message with image
        api.sendMessage(
          {
            body: "✅ Zombie effect applied successfully!",
            attachment: response.data
          },
          event.threadID,
          event.messageID
        );

      } catch (error) {
        console.error(error);
        api.sendMessage("❌ Failed to create zombie effect!", event.threadID, event.messageID);
      }
    });

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Failed to create zombie effect!", event.threadID, event.messageID);
  }
};