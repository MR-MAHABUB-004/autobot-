module.exports.config = {
	name: "pending",
	version: "1.0.5",
	credits: "ryuko",
	prefix: false,
	premium: false,
	permission: 2,
	description: "approve groups",
	category: "admin",
	cooldowns: 5
};

module.exports.languages = {
	"bangla": {
		"invaildNumber": "%1 একটি ভুল নম্বর",
		"cancelSuccess": "%1 টি থ্রেড বাতিল করা হয়েছে",
		"notiBox": "✅ গ্রুপ সফলভাবে অ্যাপ্রুভ করা হয়েছে ✅\n\n━━━━━━━━━━━━━━━━━━\n👑 অ্যাপ্রুভ করেছেন: %1\n🔗 ফেসবুক: https://facebook.com/%2\n━━━━━━━━━━━━━━━━━━\n\n⚙️ এখন সমস্ত প্রিমিয়াম বট ফিচার আনলক করা হয়েছে!\n🎉 উপভোগ করুন IMRANBOT 🤖 এর সম্পূর্ণ ক্ষমতা!",
		"approveSuccess": "%1 টি থ্রেড সফলভাবে অ্যাপ্রুভ হয়েছে",
		"cantGetPendingList": "pending তালিকা আনতে ব্যর্থ",
		"returnListPending": "অ্যাপ্রুভ করার জন্য মোট গ্রুপ সংখ্যা: %1 টি\n\n%2",
		"returnListClean": "pending তালিকায় কোনো গ্রুপ নেই"
	},
	"english": {
		"invaildNumber": "%1 is not a valid number",
		"cancelSuccess": "Refused %1 thread(s)",
		"notiBox": "✅ 𝗚𝗿𝗼𝘂𝗽 𝗔𝗽𝗽𝗿𝗼𝘃𝗲𝗱 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆! ✅\n\n━━━━━━━━━━━━━━━━━━\n👑 𝗔𝗽𝗽𝗿𝗼𝘃𝗲𝗱 𝗕𝘆: %1\n🔗 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸: https://facebook.com/%2\n━━━━━━━━━━━━━━━━━━\n\n⚙️ 𝗔𝗹𝗹 𝗽𝗿𝗲𝗺𝗶𝘂𝗺 𝗯𝗼𝘁 𝗳𝗲𝗮𝘁𝘂𝗿𝗲𝘀 𝗮𝗿𝗲 𝗻𝗼𝘄 𝘂𝗻𝗹𝗼𝗰𝗸𝗲𝗱!\n🎉 𝗘𝗻𝗷𝗼𝘆 𝘁𝗵𝗲 𝗳𝘂𝗹𝗹 𝗽𝗼𝘄𝗲𝗿 𝗼𝗳 𝗜𝗠𝗥𝗔𝗡𝗕𝗢𝗧 🤖",
		"approveSuccess": "Approved successfully %1 thread(s)",
		"cantGetPendingList": "Can't get the pending list",
		"returnListPending": "The total number of groups to approve is: %1 thread(s)\n\n%2",
		"returnListClean": "There is no group in the pending list"
	}
};

module.exports.handleReply = async function({ api, event, handleReply, getText }) {
	if (String(event.senderID) !== String(handleReply.author)) return;
	const { body, threadID, messageID } = event;
	let count = 0;

	const senderID = event.senderID;
	const senderInfo = await api.getUserInfo(senderID);
	const senderName = senderInfo[senderID]?.name || "Unknown";

	if ((isNaN(body) && body.indexOf("c") === 0) || body.indexOf("cancel") === 0) {
		const index = (body.slice(1, body.length)).split(/\s+/);
		for (const singleIndex of index) {
			if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > handleReply.pending.length)
				return api.sendMessage(getText("invaildNumber", singleIndex), threadID, messageID);
			api.removeUserFromGroup(api.getCurrentUserID(), handleReply.pending[singleIndex - 1].threadID);
			count += 1;
		}
		return api.sendMessage(getText("cancelSuccess", count), threadID, messageID);
	} else {
		const index = body.split(/\s+/);
		for (const singleIndex of index) {
			if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > handleReply.pending.length)
				return api.sendMessage(getText("invaildNumber", singleIndex), threadID, messageID);
			api.sendMessage(
				getText("notiBox", senderName, senderID),
				handleReply.pending[singleIndex - 1].threadID
			);
			count += 1;
		}
		return api.sendMessage(getText("approveSuccess", count), threadID, messageID);
	}
};

module.exports.run = async function({ api, event, getText, botid }) {
	const { threadID, messageID } = event;
	const commandName = this.config.name;
	let msg = "", index = 1;

	try {
		const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
		const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
		const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);

		for (const single of list) msg += `${index++}. ${single.name} (${single.threadID})\n`;

		if (list.length !== 0) {
			return api.sendMessage(getText("returnListPending", list.length, msg), threadID, (error, info) => {
				global.client.handleReply.get(botid).push({
					name: commandName,
					messageID: info.messageID,
					author: event.senderID,
					pending: list
				});
			}, messageID);
		} else {
			return api.sendMessage(getText("returnListClean"), threadID, messageID);
		}
	} catch (e) {
		return api.sendMessage(getText("cantGetPendingList"), threadID, messageID);
	}
};