module.exports.config = {
  name: "teach",
  version: "0.0.3",
  permission: 0,
  credits: "IMRAN",
  description: "Teach SimSimi-like AI",
  prefix: "",  // Fixed the typo by using an empty string or you can remove this entirely if no prefix is needed
  premium: false,
  category: "AI",
  usages: "<question> = <answer>",
  cooldowns: 5
};

const axios = require('axios');

module.exports.run = async ({ api, event, args }) => {
    try {
        if (!args.length) {
            return api.sendMessage(`❌ Invalid format! Usage: ${this.config.prefix}teach <question> = <answer>`, event.threadID);
        }

        const input = args.join(" ");
        const [ask, ans] = input.split("=").map(str => str.trim());
        
        if (!ask || !ans) {
            return api.sendMessage(`⚠️ Invalid format! Separate question and answer with "="\nExample: ${this.config.prefix}teach hi = hello`, event.threadID);
        }

        if (ask.length > 100 || ans.length > 100) {
            return api.sendMessage("❌ Question and answer must be under 100 characters each.", event.threadID);
        }
        // 

        const teachingURL = `https://rubish-apihub.onrender.com/rubish/simma?teach=${encodeURIComponent(ask)}&senderID=100075122837809&reply=${encodeURIComponent(ans)}&apikey=rubish69`;
        const response = await axios.get(teachingURL);

        // Check for error in the response from API
        if (response.data.error) {
            return api.sendMessage(`❌ Teaching failed: ${response.data.error}`, event.threadID);
        }

        return api.sendMessage(
            `✅ Successfully taught!\n┏✦Question: ${ask}\n┗✦Answer: ${ans}`,
            event.threadID
        );

    } catch (error) {
        console.error('Teaching Error:', error);
        const errorMessage = error.response?.data?.error || error.message || "Unknown error occurred";
        return api.sendMessage(`❌ Teaching failed: ${errorMessage}`, event.threadID);
    }
};
