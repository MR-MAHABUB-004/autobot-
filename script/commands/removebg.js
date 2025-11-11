const fs = require("fs");

const axios = require("axios");

const FormData = require("form-data");

module.exports.config = {

  name: "removebg",

  version: "1.0.0",

  permission: 0,

  credits: "Ryuko Developer",

  description: "Remove background from image",

  prefix: false,

  premium: false,

  category: "Tools",

  usages: "[image reply or url]",

  cooldowns: 5

};

module.exports.run = async ({ api, event }) => {

  const removebgApiKey = "32UhiSdHewR7yeV3kJojXdUt"; // Replace with your actual API key

  let imageUrl;

  if (event.type === "message_reply" && event.messageReply.attachments.length > 0) {

    const attachment = event.messageReply.attachments[0];

    if (attachment.type === "photo") {

      imageUrl = attachment.url;

    }

  } else if (event.body && event.body.startsWith("http")) {

    imageUrl = event.body.trim();

  } else {

    return api.sendMessage("Please reply to an image or provide a valid image URL.", event.threadID);

  }

  const form = new FormData();

  form.append("image_url", imageUrl);

  form.append("size", "auto");

  try {

    const response = await axios.post("https://api.remove.bg/v1.0/removebg", form, {

      responseType: "arraybuffer",

      headers: {

        ...form.getHeaders(),

        "X-Api-Key": removebgApiKey

      }

    });

    const outputPath = __dirname + "/nobg.png";

    fs.writeFileSync(outputPath, response.data);

    api.sendMessage({

      body: "Background removed!",

      attachment: fs.createReadStream(outputPath)

    }, event.threadID, () => fs.unlinkSync(outputPath));

  } catch (error) {

    console.error("Remove.bg Error:", error.response?.data || error.message);

    api.sendMessage("Failed to remove background. Please check the image and try again.", event.threadID);

  }

};