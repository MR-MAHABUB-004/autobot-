const fs = require('fs');
const path = require('path');

// JSON ফাইলটি লোড করা
const hints = JSON.parse(fs.readFileSync(path.join(__dirname, 'json', 'hints.json'), 'utf-8'));

module.exports.config = {
  name: "abcgame",
  version: "5.0.0",
  permission: 0,
  credits: "Nayan & Akash (Edited by ChatGPT)",
  description: "একক প্লেয়ার ABC শব্দ চ্যালেঞ্জ গেম (Auto Unsend + Timeout Answer)",
  prefix: false,
  premium: false,
  category: "Games",
  usages: "abcgame",
  cooldowns: 5
};

const gameSessions = new Map();
const categories = ["Animals", "Fruits", "Countries", "Professions"];
const letterMap = {
  'A': ['A'], 'B': ['B'], 'C': ['C'], 'D': ['D'], 'E': ['E'], 'F': ['F'], 'G': ['G'],
  'H': ['H'], 'I': ['I'], 'J': ['J'], 'K': ['K'], 'L': ['L'], 'M': ['M'], 'N': ['N'],
  'O': ['O'], 'P': ['P'], 'Q': ['Q'], 'R': ['R'], 'S': ['S'], 'T': ['T'], 'U': ['U'],
  'V': ['V'], 'W': ['W'], 'X': ['X'], 'Y': ['Y'], 'Z': ['Z']
};

const getRandomElement = arr => arr[Math.floor(Math.random() * arr.length)];

module.exports.handleReply = async function ({ api, event, handleReply, Users }) {
  if (handleReply.type !== "abcgame") return;

  const { threadID, senderID, body } = event;
  const session = gameSessions.get(threadID);
  if (!session || senderID !== session.player) return;

  const userWord = body.trim().toUpperCase();
  const { letter, category, usedWords, answer } = session;
  const userName = await Users.getNameUser(senderID);

  if (userWord.length < 2) {
    return api.sendMessage("📛 শব্দ কমপক্ষে ২ বর্ণের হতে হবে!", threadID);
  }

  if (usedWords.has(userWord)) {
    return api.sendMessage(`⚠️ \"${userWord}\" ইতিমধ্যে ব্যবহার হয়েছে!`, threadID);
  }

  const firstChar = userWord[0];
  if (!letterMap[letter].includes(firstChar)) {
    return api.sendMessage(`❌ \"${firstChar}\" নয়! \"${letter}\" দিয়ে শুরু করুন।`, threadID);
  }

  const validWords = hints[category][letter].validWords;
  if (!validWords.includes(userWord)) {
    return api.sendMessage(`❌ \"${userWord}\" গ্রহণযোগ্য নয় এই ক্যাটাগরি এবং অক্ষরে!`, threadID);
  }

  api.sendMessage(`✅ সঠিক উত্তর, ${userName}! 🎉\n\n🔚 গেম শেষ!`, threadID);
  gameSessions.delete(threadID);
};

module.exports.run = async ({ api, event, Users }) => {
  const { threadID, senderID } = event;
  if (gameSessions.has(threadID)) {
    return api.sendMessage("⚠️ এই চ্যাটে একটি গেম চলছে!", threadID);
  }

  const userName = await Users.getNameUser(senderID);
  const category = getRandomElement(categories);
  const letter = getRandomElement(Object.keys(letterMap));
  const hintData = hints[category]?.[letter];

  if (!hintData) {
    return api.sendMessage("❌ ডেটা লোড করতে ব্যর্থ!", threadID);
  }

  const hintText = hintData.hints.join(', ');
  const validWords = hintData.validWords;

  const session = {
    player: senderID,
    letter,
    category,
    usedWords: new Set(),
    answer: getRandomElement(validWords),
    startTime: Date.now()
  };

  gameSessions.set(threadID, session);

  api.sendMessage({
    body: `🎮 ${userName}, নতুন রাউন্ড শুরু!\n📌 ক্যাটাগরি: ${category}\n🔠 অক্ষর: ${letter} (${letterMap[letter].join(', ')})\n💡 হিন্ট: ${hintText}\n⏳ ৩০ সেকেন্ডের মধ্যে উত্তর দিন!`,
    mentions: [{ tag: userName, id: senderID }]
  }, threadID, async (err, info) => {
    if (err) return;

    const botID = await api.getCurrentUserID();
    const replyList = global.client.handleReply.get(botID) || [];
    replyList.push({
      name: module.exports.config.name,
      type: "abcgame",
      messageID: info.messageID,
      threadID,
      senderID
    });
    global.client.handleReply.set(botID, replyList);

    // অটো-আনসেন্ড এবং ফলাফল দেখানো
    setTimeout(() => {
      const current = gameSessions.get(threadID);
      if (current && current.player === senderID && current.startTime === session.startTime) {
        api.unsendMessage(info.messageID);
        api.sendMessage(`⌛ সময় শেষ! সঠিক উত্তর ছিল: ✅ ${session.answer}`, threadID);
        gameSessions.delete(threadID);
      }
    }, 30000);
  });
};
