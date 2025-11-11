const fs = require("fs-extra");
const pathFile = __dirname + "/autoreact/autoreact.txt";

module.exports.config = {
  name: "autoreact",
  version: "1.0.0",
  permission: 2,
  credits: "IMRAN",
  description: "Automatically reacts to new messages with random cute emojis.",
  prefix: false,
  category: "auto",
  usages: "autoreact [on|off]",
  cooldowns: 5,
  dependencies: {
    "fs-extra": ""
  }
};

// --- Event: add reaction to every message if enabled --
module.exports.handleEvent = async ({ api, event }) => {
  try {
    if (!fs.existsSync(pathFile)) fs.writeFileSync(pathFile, "false");
    const isEnabled = fs.readFileSync(pathFile, "utf-8").trim();
    if (isEnabled !== "true") return;

    // Added cute / soft emojis 🌸🐰🍓
    const reactions = [
      "💀", "🙄", "🤭", "🥺", "😶", "😝", "👿", "🤓", "🥶", "🗿",
      "😾", "🤪", "🤬", "🤫", "😼", "😶‍🌫️", "😎", "🤦", "💅",
      "👀", "☠️", "🧠", "👺", "🤡", "🤒", "🤧", "😫", "😇", "🥳", "😭",
      // 🌸 cute additions
      "🌸", "🐰", "🍓", "🐥", "🐱", "🐶", "🐼", "🐧", "🦄", "🦋",
      "💖", "💕", "💗", "💞", "💓", "💜", "💙", "🤍", "✨", "🌈",
      "🍭", "🍬", "🍩", "🥰", "😍", "🤩", "😻", "😊", "🤗"
    ];

    const randomReact = reactions[Math.floor(Math.random() * reactions.length)];
    api.setMessageReaction(randomReact, event.messageID, err => {
      if (err) console.error("Error sending reaction:", err);
    }, true);
  } catch (err) {
    console.error("Error in autoreact handleEvent:", err);
  }
};

// --- Command: turn autoreact on/off ---
module.exports.run = async ({ api, event, args }) => {
  try {
    if (!args[0]) {
      return api.sendMessage("Usage: autoreact [on|off]", event.threadID, event.messageID);
    }

    const option = args[0].toLowerCase();
    if (option === "on") {
      fs.writeFileSync(pathFile, "true");
      return api.sendMessage("🌟 Autoreact is now **ON**! ✨", event.threadID, event.messageID);
    }
    if (option === "off") {
      fs.writeFileSync(pathFile, "false");
      return api.sendMessage("🚫 Autoreact has been turned **OFF**.", event.threadID, event.messageID);
    }

    return api.sendMessage("⚠️ Invalid option! Use: autoreact [on|off]", event.threadID, event.messageID);
  } catch (err) {
    console.error("Error in autoreact run:", err);
    api.sendMessage("An unexpected error occurred.", event.threadID, event.messageID);
  }
};
