const fs = require('fs');
const request = require('request');

module.exports.config = {
    name: "adminnoti",
    version: "1.0.0",
    permission: 2,
    credits: "IMRAN",
    description: "Send a notification to all groups",
    prefix: true,
    premium: false,
    category: "admin",
    usages: "adminnoti [message]",
    cooldowns: 5,
};

let cachedFiles = [];

const downloadAttachments = (attachments, messageText) => new Promise(async (resolve) => {
    let msgData = { body: messageText };
    let attachmentFiles = [];

    for (const item of attachments) {
        await new Promise(async (innerResolve) => {
            try {
                const response = await request.get(item.url);
                const fileExt = response.uri.pathname.split('.').pop();
                const filePath = `${__dirname}/cache/${item.filename}.${fileExt}`;

                response.pipe(fs.createWriteStream(filePath)).on("close", () => {
                    attachmentFiles.push(fs.createReadStream(filePath));
                    cachedFiles.push(filePath);
                    innerResolve();
                });
            } catch (error) {
                console.error(error);
            }
        });
    }

    msgData.attachment = attachmentFiles;
    resolve(msgData);
});

module.exports.handleReply = async function ({ api, event, handleReply, Users, Threads, botid }) {
    const moment = require("moment-timezone");
    const timeNow = moment.tz("Asia/Dhaka").format("DD/MM/YYYY - HH:mm:ss");
    const { threadID, messageID, senderID, body, attachments } = event;
    const senderName = await Users.getNameUser(senderID);
    const threadName = (await Threads.getInfo(threadID)).threadName || "Unknown";

    switch (handleReply.type) {
        case "sendnoti": {
            let replyText = 
`━━━━━━━━━━━━ ✦ 𝗨𝗦𝗘𝗥 𝗥𝗘𝗣𝗟𝗬 ✦ ━━━━━━━━━━━━

🧑 𝗡𝗮𝗺𝗲: ${senderName}
🏘️ 𝗚𝗿𝗼𝘂𝗽: ${threadName}
🕰️ 𝗧𝗶𝗺𝗲: ${timeNow}

🗨️ 𝗥𝗲𝗽𝗹𝘆:
『 ${body} 』

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✔️ 𝗧𝗵𝗲 𝗮𝗱𝗺𝗶𝗻 𝘄𝗶𝗹𝗹 𝗿𝗲𝘀𝗽𝗼𝗻𝗱 𝘀𝗵𝗼𝗿𝘁𝗹𝘆
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

            if (attachments.length > 0) {
                replyText = await downloadAttachments(attachments, replyText);
            }

            api.sendMessage(replyText, handleReply.threadID, (err, info) => {
                cachedFiles.forEach(file => fs.unlinkSync(file));
                cachedFiles = [];

                global.client.handleReply.get(botid).push({
                    name: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    messID: messageID,
                    threadID
                });
            });

            break;
        }

        case "reply": {
            let responseText = 
`━━━━━━━━━━━━ ✦ 𝗔𝗗𝗠𝗜𝗡 𝗥𝗘𝗣𝗟𝗬 ✦ ━━━━━━━━━━━━

🧑‍💼 𝗔𝗱𝗺𝗶𝗻: ${senderName}

💬 𝗥𝗲𝗽𝗹𝘆:
『 ${body} 』

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📩 𝗬𝗼𝘂 𝗰𝗮𝗻 𝗿𝗲𝗽𝗹𝘆 𝘁𝗼 𝗰𝗼𝗻𝘁𝗶𝗻𝘂𝗲 𝘁𝗵𝗲 𝗰𝗵𝗮𝘁
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

            if (attachments.length > 0) {
                responseText = await downloadAttachments(attachments, responseText);
            }

            api.sendMessage(responseText, handleReply.threadID, (err, info) => {
                cachedFiles.forEach(file => fs.unlinkSync(file));
                cachedFiles = [];

                global.client.handleReply.get(botid).push({
                    name: this.config.name,
                    type: "sendnoti",
                    messageID: info.messageID,
                    threadID
                });
            }, handleReply.messID);

            break;
        }
    }
};

module.exports.run = async function ({ api, event, args, botid, Users }) {
    const moment = require("moment-timezone");
    const timeNow = moment.tz("Asia/Dhaka").format("DD/MM/YYYY - HH:mm:ss");
    const { threadID, messageID, senderID, messageReply, type } = event;

    if (!args[0]) return api.sendMessage("⚠️ Please enter a message to send.", threadID);

    const senderName = await Users.getNameUser(senderID);
    const botID = await api.getCurrentUserID();
    const allThreads = global.data.allThreadID.get(botID) || [];

    let delivered = 0;
    let failed = 0;

    let announcementText = 
`━━━━━━━━━━━━ ✦ 𝗔𝗗𝗠𝗜𝗡 𝗡𝗢𝗧𝗜𝗖𝗘 ✦ ━━━━━━━━━━━━

🧑‍💼 𝗔𝗱𝗺𝗶𝗻: ${senderName}
🕰️ 𝗧𝗶𝗺𝗲: ${timeNow}

📩 𝗠𝗲𝘀𝘀𝗮𝗴𝗲:
『 ${args.join(" ")} 』

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔁 𝗥𝗲𝗽𝗹𝘆 𝘁𝗼 𝘁𝗵𝗶𝘀 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝘁𝗼 𝗿𝗲𝘀𝗽𝗼𝗻𝗱
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    if (type === "message_reply") {
        announcementText = await downloadAttachments(messageReply.attachments, announcementText);
    }

    for (const groupThread of allThreads) {
        try {
            api.sendMessage(announcementText, groupThread, (err, info) => {
                if (err) {
                    failed++;
                } else {
                    delivered++;

                    cachedFiles.forEach(file => fs.unlinkSync(file));
                    cachedFiles = [];

                    global.client.handleReply.get(botid).push({
                        name: this.config.name,
                        type: "sendnoti",
                        messageID: info.messageID,
                        messID: messageID,
                        threadID: groupThread
                    });
                }
            });
        } catch (e) {
            console.error(e);
        }
    }

    api.sendMessage(`✅ Message sent to ${delivered} groups\n❌ Failed to send in ${failed} groups`, threadID);
};