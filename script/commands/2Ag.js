const axios = require('axios');
const fs = require('fs');
const dip = "https://www.noobs-api.rf.gd/dipto" 
const config = {
  name: "genix",
  version: "2.0.0",
  permission: 0,
  author: "Dipto",
  credits: "Dipto",
  description: "Genix Image to image best",
  category: "GEN",
  commandCategory: "Genix AI",
  usePrefix: true,
    premium: true,
  prefix: true,
  dependencies: {
    "axios": "",
    'fs':'',
  },
};
const onStart = async function ({ api, args, event, message }) {
  try {
  
    let prompt = args.join(' ') || "ghibli anime art";

    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return api.sendMessage("Please reply to an image.", event.threadID, event.messageID);
    }

    const url = event.messageReply.attachments[0].url;
    const wait = await api.sendMessage("wait baby <😘", event.threadID);
      const response = await axios.get(`${dip}/genix?url=${encodeURIComponent(url)}&prompt=${encodeURIComponent(prompt)}&model=9`);
      const link = response.data.data;

      const imageStream = (await axios.get(link, { responseType: 'stream' })).data;

      api.unsendMessage(wait.messageID);

      await api.sendMessage({ 
        body: "Here's your photo", 
        attachment: imageStream
      }, event.threadID, event.messageID);
  } catch (error) {
    console.error(`Failed to generate: ${error.message}`);
    api.sendMessage(`An error occurred: ${error.message}`, event.threadID, event.messageID);
  }
};
module.exports = {
  config,
  onStart,
  run: onStart,
};