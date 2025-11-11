module.exports.config = {
  name: "pingall",
  version: "1.0.1",
  permission: 1,
  credits: "IMRAN",
  description: "Mention all group members one by one with name",
  prefix: true,
  category: "group",
  usages: "[text]",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
  try {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const botID = api.getCurrentUserID();
    const message = args.length ? args.join(" ") : "Hey";

    // Get group info
    const threadInfo = await api.getThreadInfo(threadID);
    const members = threadInfo.participantIDs.filter(id => id !== botID && id !== senderID);

    if (members.length === 0) {
      return api.sendMessage("No members found to mention!", threadID, event.messageID);
    }

    for (const memberID of members) {
      const userInfo = threadInfo.userInfo.find(u => u.id === memberID);
      const name = userInfo?.name || "User";
      await new Promise(resolve => setTimeout(resolve, 1500)); // delay between mentions
      api.sendMessage({
        body: `${message} ${name}`,
        mentions: [{
          tag: name,
          id: memberID
        }]
      }, threadID);
    }

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ An error occurred!", event.threadID);
  }
};