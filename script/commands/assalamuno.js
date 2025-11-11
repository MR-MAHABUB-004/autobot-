module.exports.config = {
  name: "salamreply",
  version: "1.0.0",
  permission: 0,
  credits: "IMRAN",
  description: "Replies to Islamic greetings",
  prefix: false,
  premium: false,
  category: "auto-reply",
  usages: "",
  cooldowns: 2
};

module.exports.handleEvent = async ({ api, event }) => {
  const message = event.body?.toLowerCase();
  if (!message) return;

  const salamList = [
    "আসসালামু আলাইকুম ওয়া রহমতুল্লাহ",
    "assalamu alaikum wa rahmatullah",
    "আসসালামু আলাইকুম",
    "assalamu alaikum",
    "السلام عليكم ورحمة الله"
  ];

  const matched = salamList.some(salam => message.includes(salam.toLowerCase()));
  if (matched) {
    const styledResponse = `༺•☬ 𝗪𝗔𝗟𝗜𝗞𝗨𝗠-𝗔𝗦𝗦𝗔𝗟𝗔𝗠 ☬•༻ 🕌🤲`;

    return api.sendMessage(styledResponse, event.threadID, event.messageID);
  }
};

module.exports.run = async () => {
  // No run logic needed
};
