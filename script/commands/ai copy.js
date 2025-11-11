module.exports.config = {
  name: "ai", // Command name
  version: "1.0.0", // Command version
  permission: 0, // Permission level
  credits: "Nayan", // Creator of the code
  description: "Chat with AI (GPT-3)", // Command description
  prefix: false, // Use prefix (true/false)
  premium: false, // Enable premium feature (true/false)
  category: "user", // Command category
  usages: "ai [your query]", // Command usage
  cooldowns: 5 // Cooldown in seconds
};

module.exports.run = async ({ api, event, args, Users }) => {
  const axios = require("axios");

  const uid = event.senderID;
  const name = await Users.getNameUser(uid);
  const query = args.join(" ");

  if (!query) {
    return api.sendMessage("Please provide a query for the AI.", event.threadID, event.messageID);
  }

  try {
    const apiList = await axios.get('https://raw.githubusercontent.com/MOHAMMAD-NAYAN-07/Nayan/main/api.json');
    const apiUrl = apiList.data.api;
      //help ok

    const response = await axios.get(`${apiUrl}/nayan/gpt3?prompt=${encodeURIComponent(query)}`);
    const aiReply = response.data.response || 'I am unable to process your request at the moment.';

    api.sendMessage(aiReply, event.threadID, event.messageID);
  } catch (error) {
    console.error("Error while processing GPT request:", error);
    api.sendMessage("There was an error while trying to contact the AI.", event.threadID, event.messageID);
  }
};
