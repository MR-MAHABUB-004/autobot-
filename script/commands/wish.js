const axios = require("axios");
const moment = require("moment-timezone");

module.exports.config = {
  name: "wish",
  version: "1.2.5",
  permission: 0,
  credits: "Imran",
  description: "Send a unique birthday wish with attachment",
  prefix: false,
  category: "fun",
  usages: "@mention or name",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "moment-timezone": ""
  }
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;

  // ✅ Safe check for mentions
  const mentionID = event.mentions && Object.keys(event.mentions).length > 0
    ? Object.keys(event.mentions)[0]
    : null;

  const uid = mentionID || senderID;

  // ✅ Wish name + tag fallback
  const wishTagName = mentionID && event.mentions[mentionID]
    ? event.mentions[mentionID]
    : (args.join(" ") || "প্রিয়");

  const displayName = mentionID ? `@${wishTagName}` : wishTagName;

  // ✅ Mention tag array
  let arraytag = [];
  if (mentionID && event.mentions[mentionID]) {
    arraytag.push({
      id: mentionID,
      tag: `@${wishTagName}`
    });
  }

  try {
    const userInfo = await api.getUserInfo(senderID);
    const senderName = userInfo[senderID]?.name || "কেউ একজন";
    const today = moment().tz("Asia/Dhaka").format("DD MMMM, YYYY");

    const wishMessage = `🎀┏━━━━━━━━━━━━━━┓🎀
🎉 𝓗𝓪𝓹𝓹𝔂 𝓑𝓲𝓻𝓽𝓱𝓭𝓪𝔂 𝓽𝓸 𝔂𝓸𝓾 🎉
┗━━━━━━━━━━━━━━┛

💝 জন্মদিনের অনেক অনেক শুভেচ্ছা ${displayName}!
🥳 আজকের দিনটা হোক দারুণ, রঙিন আর ভালোবাসায় ভরা।

📅 তারিখ: ${today}
🎁 শুভকামনায় — ${senderName} 💫`;

    const imageURL = "https://i.ibb.co/Zp6Pb2BF/1752179973688.png";
    const response = await axios({
      url: imageURL,
      method: "GET",
      responseType: "stream"
    });

    api.sendMessage({
      body: wishMessage,
      attachment: response.data,
      mentions: arraytag
    }, threadID, null, messageID);

  } catch (err) {
    console.error("Error:", err.message);
    api.sendMessage("😔 দুঃখিত, শুভেচ্ছা বার্তা পাঠানো সম্ভব হয়নি।", threadID, null, messageID);
  }
};