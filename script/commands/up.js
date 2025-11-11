module.exports.config = {
	name: "up",
	version: "1.1.2",
	permssion: 0,
	prefix: true,
	premium: false,
	credits: "Mirai Team",
	description: "𝗩𝗶𝗲𝘄 𝗱𝗲𝘁𝗮𝗶𝗹𝗲𝗱 𝘀𝘆𝘀𝘁𝗲𝗺 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻",
	category: "𝗦𝗬𝗦𝗧𝗘𝗠",
	cooldowns: 5,
	dependencies: {
		"systeminformation": "",
		"pidusage": ""
	}
};

function byte2mb(bytes) {
	const units = ['𝗕𝘆𝘁𝗲𝘀', '𝗞𝗕', '𝗠𝗕', '𝗚𝗕', '𝗧𝗕', '𝗣𝗕', '𝗘𝗕', '𝗭𝗕', '𝗬𝗕'];
	let l = 0, n = parseInt(bytes, 10) || 0;
	while (n >= 1024 && ++l) n = n / 1024;
	return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
}

module.exports.run = async function ({ api, event }) {
	const si = global.nodemodule["systeminformation"];
	const timeStart = Date.now();

	try {
		const pid = await global.nodemodule["pidusage"](process.pid);
		const [
			cpuInfo,
			tempInfo,
			loadInfo,
			timeInfo,
			diskInfo,
			memLayoutInfo,
			memInfo,
			osInfo
		] = await Promise.all([
			si.cpu(),
			si.cpuTemperature(),
			si.currentLoad(),
			si.time(),
			si.diskLayout(),
			si.memLayout(),
			si.mem(),
			si.osInfo()
		]);

		const uptime = timeInfo.uptime;
		const hours = Math.floor(uptime / 3600).toString().padStart(2, '0');
		const minutes = Math.floor((uptime % 3600) / 60).toString().padStart(2, '0');
		const seconds = Math.floor(uptime % 60).toString().padStart(2, '0');

		const memUsed = memInfo.total - memInfo.available;
		const memUsagePercent = ((memUsed / memInfo.total) * 100).toFixed(1);

		let diskDisplay = [];
		diskInfo.forEach((disk, i) => {
			diskDisplay.push(
				`🖇️ 𝗗𝗶𝘀𝗸 ${i + 1} - ${disk.name}\n` +
				`► 𝗦𝗶𝘇𝗲: ${byte2mb(disk.size)}\n` +
				`► 𝗧𝘆𝗽𝗲: ${disk.interfaceType}\n` +
				`► 𝗧𝗲𝗺𝗽: ${disk.temperature || '𝗡/𝗔'}${disk.temperature ? '°𝗖' : ''}`
			);
		});

		const msg = [
			"╔═══════════ ⋆⋅☆⋅⋆ ═══════════╗",
			`  🔍 𝗦𝗬𝗦𝗧𝗘𝗠 𝗠𝗢𝗡𝗜𝗧𝗢𝗥 🔍`,
			"╚═══════════ ⋆⋅☆⋅⋆ ═══════════╝",
			"",
			"🖥️ 𝗖𝗣𝗨 𝗗𝗘𝗧𝗔𝗜𝗟𝗦",
			`► 𝗠𝗼𝗱𝗲𝗹: ${cpuInfo.manufacturer} ${cpuInfo.brand} @ ${cpuInfo.speedMax}𝗚𝗛𝘇`,
			`► 𝗖𝗼𝗿𝗲𝘀: ${cpuInfo.physicalCores} (${cpuInfo.cores} 𝗍𝗁𝗋𝖾𝖺𝖽𝗌)`,
			`► 𝗧𝗲𝗺𝗽: ${tempInfo.main ? tempInfo.main + '°𝗖' : '𝗡/𝗔'}`,
			`► 𝗟𝗼𝗮𝗱: ${loadInfo.currentLoad.toFixed(1)}%`,
			`► 𝗡𝗼𝗱𝗲 𝗨𝘀𝗮𝗴𝗲: ${pid.cpu.toFixed(1)}%`,
			"",
			"📊 𝗠𝗘𝗠𝗢𝗥𝗬 𝗨𝗦𝗔𝗚𝗘",
			`► 𝗧𝗼𝘁𝗮𝗹: ${byte2mb(memInfo.total)}`,
			`► 𝗨𝘀𝗲𝗱: ${byte2mb(memUsed)} (${memUsagePercent}%)`,
			`► 𝗙𝗿𝗲𝗲: ${byte2mb(memInfo.available)}`,
			`► 𝗡𝗼𝗱𝗲: ${byte2mb(pid.memory)}`,
			"",
			...diskDisplay,
			"",
			"🌐 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢",
			`► 𝗢𝗦: ${osInfo.platform} ${osInfo.distro} (${osInfo.build})`,
			`► 𝗨𝗽𝘁𝗶𝗺𝗲: ${hours}:${minutes}:${seconds}`,
			"",
			`🏓 𝗣𝗜𝗡𝗚: ${Date.now() - timeStart}𝗺𝘀`,
			"╚════════════════════════════╝"
		].join("\n");

		return api.sendMessage(msg, event.threadID, event.messageID);
	}
	catch (e) {
		console.error("𝗘𝗿𝗿𝗼𝗿:", e);
		return api.sendMessage("❌ 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗿𝗲𝘁𝗿𝗶𝗲𝘃𝗲 𝘀𝘆𝘀𝘁𝗲𝗺 𝗱𝗮𝘁𝗮", event.threadID);
	}
};