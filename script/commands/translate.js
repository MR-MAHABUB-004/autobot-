module.exports.config = {
  name: "trans", // Command name
  version: "1.0.1", // Command version
  permission: 0, // Permission level
  credits: "Ryuko Developer", // Creator
  description: "Translate text to another language", // Command description
  prefix: false, // Use prefix
  premium: false, // Premium command
  category: "Without Prefix", // Command category
  usages: "translate <language_code> <text>", // Usage example
  cooldowns: 5, // Cooldown in seconds
  dependencies: {
    "request": ""
  }
};

module.exports.run = async ({ api, event, args, Threads, Users, getText }) => {
  const request = global.nodemodule["request"];

  const targetLang = args[0];
  const textToTranslate = args.slice(1).join(" ");

  if (!targetLang && event.type !== "message_reply")
    return api.sendMessage(
      `❌ | Please specify the language code and text to translate.\n\nExample: translate fr Hello, how are you?`,
      event.threadID,
      event.messageID
    );

  let queryText, language;

  if (event.type === "message_reply") {
    queryText = event.messageReply.body;
    language = targetLang || global.config.language;
  } else {
    queryText = textToTranslate;
    language = targetLang || global.config.language;
  }

  const url = encodeURI(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${language}&dt=t&q=${queryText}`);

  request(url, (error, response, body) => {
    if (error)
      return api.sendMessage("❌ | An error occurred while translating. Please try again.", event.threadID, event.messageID);

    try {
      const data = JSON.parse(body);
      let translatedText = '';
      data[0].forEach(item => {
        if (item[0]) translatedText += item[0];
      });

      const detectedLang = (data[2] === data[8][0][0]) ? data[2] : data[8][0][0];

      api.sendMessage(
        `🌐 | Translation Successful!\n\n` +
        `> From: ${detectedLang.toUpperCase()}\n` +
        `> To: ${language.toUpperCase()}\n\n` +
        `➤ ${translatedText}`,
        event.threadID,
        event.messageID
      );
    } catch (e) {
      api.sendMessage("❌ | Failed to process translation.", event.threadID, event.messageID);
    }
  });
};
