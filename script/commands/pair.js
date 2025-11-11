module.exports.config = {
  name: "pair",
  version: "3.0.3",
  permission: 0,
  prefix: true,
  credits: "imran",
  description: "Pair system with opposite gender partner (1,2,3)",
  category: "Picture",
  cooldowns: 5,
  dependencies: {
    "axios": ""
  }
};

module.exports.run = async function ({ api, event, args }) {
  const axios = require("axios");
  const { threadID, messageID, senderID } = event;

  try {
    // Random odds
    const odds = Math.floor(Math.random() * 101) + "%";

    // Sender info
    const senderInfo = await api.getUserInfo(senderID);
    const senderName = senderInfo[senderID]?.name || "Unknown";
    const senderGender = senderInfo[senderID]?.gender; // 1 = Female, 2 = Male

    // Thread participants excluding sender
    const threadInfo = await api.getThreadInfo(threadID);
    const participants = threadInfo.participantIDs.filter(id => id != senderID);

    // Fetch all participants info safely
    let usersInfo = {};
    await Promise.all(participants.map(async uid => {
      const info = await api.getUserInfo(uid);
      usersInfo[uid] = info[uid];
    }));

    // Gender based filtering
    let maleList = [], femaleList = [];
    for (let uid of participants) {
      if (usersInfo[uid]?.gender === 2) maleList.push(uid);
      else if (usersInfo[uid]?.gender === 1) femaleList.push(uid);
    }

    // Pick a partner
    let partnerID;
    if (senderGender === 2 && femaleList.length > 0) partnerID = femaleList[Math.floor(Math.random() * femaleList.length)];
    else if (senderGender === 1 && maleList.length > 0) partnerID = maleList[Math.floor(Math.random() * maleList.length)];
    else partnerID = participants[Math.floor(Math.random() * participants.length)];

    const partnerInfo = await api.getUserInfo(partnerID);
    const partnerName = partnerInfo[partnerID]?.name || "Unknown";

    const mentions = [
      { id: senderID, tag: senderName },
      { id: partnerID, tag: partnerName }
    ];

    // Choose pair template
    const templates = ["pair1", "pair2", "pair3"];
    let selectedTemplate = templates[Math.floor(Math.random() * templates.length)];

    // User-specified template
    if (args[0] && ["1","2","3"].includes(args[0])) selectedTemplate = "pair" + args[0];

    // API call
    const url = `http://fi4.bot-hosting.net:22413/${selectedTemplate}?uid1=${senderID}&uid2=${partnerID}&name1=${encodeURIComponent(senderName)}&name2=${encodeURIComponent(partnerName)}`;

    const response = await axios.get(url, { responseType: "stream" });

    return api.sendMessage(
      {
        body: `✨ ${senderName} is paired with ${partnerName}!\n💞 Odds: ${odds}`,
        mentions: mentions,
        attachment: response.data
      },
      threadID,
      messageID
    );

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ Error: Couldn't generate pair image.", threadID, messageID);
  }
};