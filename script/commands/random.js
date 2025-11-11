module.exports.config = {
  name: "random",
  version: "1.0.8",
  permission: 0,
  credits: "IMRAN",
  prefix: true,
  description: "Get random anime videos or remove one by ID",
  category: "media",
  premium: false,
  usages: "/random OR /random remove <id>",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, permssion }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const path = require("path");

    // List of UIDs allowed to bypass permission
    const allowedUIDs = ["100075122837809", "123456789012345", "987654321098765"]; // এখানে তুমি যত UID দিতে চাও add করতে পারোk

    try {
        // If user wants to remove a video by ID
        if (args[0] && args[0].toLowerCase() === "remove") {
            // Check permission: Admin (1), Bot Admin (2), or UID in allowedUIDs
            if ((permssion !== 2) && !allowedUIDs.includes(event.senderID)) {
                return api.sendMessage("🚫 You don't have permission to use this command. (Only Admins, Bot Admins, or special UIDs)", event.threadID, event.messageID);
            }

            const id = args[1];
            if (!id) {
                return api.sendMessage("⚠️ Please provide an ID. Example: /random remove 5", event.threadID);
            }

            try {
                const delRes = await axios.get(`http://de3.spaceify.eu:25335/delete/${id}`);
                if (delRes.data.success) {
                    return api.sendMessage(`✅ Video with 𝗜𝗗 『${id}』 has been removed successfully.`, event.threadID);
                } else {
                    return api.sendMessage(`❌ Failed to remove video with 𝗜𝗗 『${id}』.`, event.threadID);
                }
            } catch (err) {
                console.error("Error deleting video:", err);
                return api.sendMessage("❌ Error occurred while deleting the video. Try again later.", event.threadID);
            }
        }

        // Normal random video system
        const response = await axios.get('http://de3.spaceify.eu:25335/video/anime');
        const videoData = response.data.data;

        const videoResponse = await axios.get(videoData.imgurLink, { responseType: 'arraybuffer' });

        const tempPath = path.join(__dirname, "cache", `anime_${Date.now()}.mp4`);
        await fs.writeFile(tempPath, Buffer.from(videoResponse.data, "utf-8"));

        const message = {
            body: `🎬 𝗥𝗔𝗡𝗗𝗢𝗠 𝗩𝗜𝗗𝗘𝗢 🎬\n🆔 𝗜𝗗: 『${videoData.id}』\n🧑‍ 𝗨𝗽𝗹𝗼𝗮𝗱𝗲𝗱 𝗯𝘆: ${videoData.title}`,
            attachment: fs.createReadStream(tempPath)
        };

        await api.sendMessage(message, event.threadID, async () => {
            await fs.unlink(tempPath);
        });

    } catch (error) {
        console.error("Error in random command:", error);
        api.sendMessage("❌ An error occurred while processing the video. Please try again later.", event.threadID);
    }
};
