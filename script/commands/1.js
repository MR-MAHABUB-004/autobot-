const fs = require('fs');

module.exports.config = {
  name: "mim",
  version: "1.0.2",
  permission: 0,
  credits: "IMRAN",
  prefix: false,
  description: "Fun response command",
  category: "no prefix",
  premium: false,
  usages: "😒",
  cooldowns: 5
};

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, messageID, body } = event;
  const triggers = ["mim", "পেত্নী", "গাধা"];
  
  try {
    if (body && triggers.some(trigger => 
      body.toLowerCase().startsWith(trigger.toLowerCase())
    )) {
      // Array of possible responses
      const responses = [
        "মিম এখন চিপায় আছে যা বালার আমাকে বলেন",
        "পেত্নী এখন তেঁতুল গাছের ওপরে",
        "মিম এখন ইমরান এর সাথে বিজি আছে"
      ];
      
      // Randomly select a response from the array
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Send the message
      await api.sendMessage(randomResponse, threadID, messageID);
      
      // Add a reaction with error handling
      await api.setMessageReaction("🥱", messageID, (err) => {
        if (err) console.error("Reaction error:", err);
      }, true);
    }
  } catch (error) {
    console.error("Error in handleEvent:", error);
  }
};

module.exports.run = function() {};
