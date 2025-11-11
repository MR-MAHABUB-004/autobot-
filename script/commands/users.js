module.exports.config = {
  name: "user",
  version: "1.0.5",
  permission: 2,
  credits: "ryuko",
  prefix: true,
  premium: false,
  description: "ban or unblock users",
  category: "admin",
  usages: "[unban/ban/search] [id or text]",
  cooldowns: 5
};

module.exports.languages = {
  bangla: {
    reason: "reason",
    at: "at",
    allCommand: "all commands",
    commandList: "commands",
    banSuccess: "banned user : %1",
    unbanSuccess: "unbanned user %1",
    banCommandSuccess: "banned command with user : %1",
    unbanCommandSuccess: "unbanned command %1 with user: %2",
    errorReponse: "%1 can't do what you request",
    IDNotFound: "%1 ID you import doesn't exist in database",
    existBan: "user %1 has been banned before %2 %3",
    notExistBan: "user hasn't been banned before",
    missingCommandInput: "%1 you have to import the command you want to ban",
    notExistBanCommand: "user ID hasn't been banned before",
    returnResult: "this is your result : \n",
    returnNull: "there is no result with your input",
    returnList: "there are %1 banned user, here are %2 user\n\n%3",
    returnInfo: "here is some information about the user who you want to find :\nuser id and name : %1\n- banned? : %2 %3 %4\ncommand banned? : %5"
  },
  english: {
    reason: "reason",
    at: "at",
    allCommand: "all commands",
    commandList: "commands",
    banSuccess: "banned user : %1",
    unbanSuccess: "unbanned user %1",
    banCommandSuccess: "banned command with user : %1",
    unbanCommandSuccess: "unbanned command %1 with user: %2",
    errorReponse: "%1 can't do what you request",
    IDNotFound: "%1 ID you import doesn't exist in database",
    existBan: "user %1 has been banned before %2 %3",
    notExistBan: "user hasn't been banned before",
    missingCommandInput: "%1 you have to import the command you want to ban",
    notExistBanCommand: "user ID hasn't been banned before",
    returnResult: "this is your result : \n",
    returnNull: "there is no result with your input",
    returnList: "there are %1 banned user, here are %2 user\n\n%3",
    returnInfo: "here is some information about the user who you want to find :\nuser id and name : %1\n- banned? : %2 %3 %4\ncommand banned? : %5"
  }
};

module.exports.handleReaction = async () => {
  // Removed, no confirmation by reaction needed anymore
  return;
};

module.exports.run = async ({ event, api, args, Users, getText, botid }) => {
  const { threadID, messageID } = event;
  const type = args[0];
  let targetID = String(args[1]);
  let reason = (args.slice(2).join(" ")) || null;
  const moment = require("moment-timezone");
  const time = moment.tz("Asia/Ho_Chi_minh").format("HH:mm:ss L");

  if (isNaN(targetID)) {
    const mention = Object.keys(event.mentions);
    if (mention.length > 0) {
      targetID = String(mention[0]);
      reason = args.slice(args.findIndex(arg => arg.includes(targetID)) + 1).join(" ") || null;
    } else {
      return api.sendMessage(getText("IDNotFound", type + " user - "), threadID, messageID);
    }
  }

  const nameTarget = global.data.userName.get(targetID) || await Users.getNameUser(targetID);

  try {
    switch (type) {
      case "ban":
      case "-b": {
        if (!global.data.allUserID.includes(targetID)) return api.sendMessage(getText("IDNotFound", "ban user - "), threadID, messageID);
        if (global.data.userBanned.has(targetID)) {
          const banData = global.data.userBanned.get(targetID) || {};
          return api.sendMessage(getText("existBan", targetID, banData.reason ? `${getText("reason")}: "${banData.reason}"` : "", banData.dateAdded ? `${getText("at")} ${banData.dateAdded}` : ""), threadID, messageID);
        }
        let data = (await Users.getData(targetID)).data || {};
        data.banned = true;
        data.reason = reason;
        data.dateAdded = time;
        await Users.setData(targetID, { data });
        global.data.userBanned.set(targetID, { reason: data.reason, dateAdded: data.dateAdded });
        return api.sendMessage(getText("banSuccess", `${targetID} - ${nameTarget}`), threadID, messageID);
      }

      case "unban":
      case "-ub": {
        if (!global.data.allUserID.includes(targetID)) return api.sendMessage(getText("IDNotFound", "unban user - "), threadID, messageID);
        if (!global.data.userBanned.has(targetID)) return api.sendMessage(getText("notExistBan"), threadID, messageID);
        let dataUnban = (await Users.getData(targetID)).data || {};
        dataUnban.banned = false;
        dataUnban.reason = null;
        dataUnban.dateAdded = null;
        await Users.setData(targetID, { data: dataUnban });
        global.data.userBanned.delete(targetID);
        return api.sendMessage(getText("unbanSuccess", `${targetID} - ${nameTarget}`), threadID, messageID);
      }

      case "banCommand":
      case "-bc": {
        if (!global.data.allUserID.includes(targetID)) return api.sendMessage(getText("IDNotFound", "command ban - "), threadID, messageID);
        if (!reason || reason.length == 0) return api.sendMessage(getText("missingCommandInput", "command ban - "), threadID, messageID);
        if (reason === "all") {
          const allCommandName = [...global.client.commands.keys()];
          reason = allCommandName.join(" ");
        }
        const commandNeedBan = reason.split(" ");
        let data = (await Users.getData(targetID)).data || {};
        data.commandBanned = [...new Set([...(data.commandBanned || []), ...commandNeedBan])];
        await Users.setData(targetID, { data });
        global.data.commandBanned.set(targetID, data.commandBanned);
        return api.sendMessage(getText("banCommandSuccess", `${targetID} - ${nameTarget}`), threadID, messageID);
      }

      case "unbanCommand":
      case "-ubc": {
        if (!global.data.allUserID.includes(targetID)) return api.sendMessage(getText("IDNotFound", "command unban - "), threadID, messageID);
        if (!global.data.commandBanned.has(targetID)) return api.sendMessage(getText("notExistBanCommand"), threadID, messageID);
        if (!reason || reason.length == 0) return api.sendMessage(getText("missingCommandInput", "command unban - "), threadID, messageID);
        if (reason === "all") {
          reason = global.data.commandBanned.get(targetID).join(" ");
        }
        const commandNeedUnban = reason.split(" ");
        let dataUnbanCmd = (await Users.getData(targetID)).data || {};
        dataUnbanCmd.commandBanned = (dataUnbanCmd.commandBanned || []).filter(cmd => !commandNeedUnban.includes(cmd));
        await Users.setData(targetID, { data: dataUnbanCmd });
        if (dataUnbanCmd.commandBanned.length > 0) global.data.commandBanned.set(targetID, dataUnbanCmd.commandBanned);
        else global.data.commandBanned.delete(targetID);
        return api.sendMessage(getText("unbanCommandSuccess",
          (dataUnbanCmd.commandBanned.length === 0 ? getText("allCommand") : `${getText("commandList")}: ${commandNeedUnban.join(", ")}`),
          `${targetID} - ${nameTarget}`), threadID, messageID);
      }

      case "search":
      case "-s": {
        const searchText = reason || "";
        const allUsers = (await Users.getAll(['userID', 'name'])).filter(u => u.name);
        const matchedUsers = allUsers.filter(u => u.name.toLowerCase().includes(searchText.toLowerCase()));
        let result = "";
        matchedUsers.forEach((u, i) => {
          result += `\n${i + 1}. ${u.name} - ${u.userID}`;
        });
        if (matchedUsers.length > 0) return api.sendMessage(getText("returnResult", result), threadID, messageID);
        else return api.sendMessage(getText("returnNull"), threadID, messageID);
      }

      case "list":
      case "-l": {
        let listBan = [];
        let i = 0;
        for (const idUser of global.data.userBanned.keys()) {
          if (i >= (parseInt(reason) || 10)) break;
          const userName = (await Users.getData(idUser)).name || "unknown";
          listBan.push(`${i + 1}/ ${idUser} - ${userName}`);
          i++;
        }
        return api.sendMessage(getText("returnList", global.data.userBanned.size || 0, listBan.length, listBan.join("\n")), threadID, messageID);
      }

      case "info":
      case "-i": {
        if (!global.data.allUserID.includes(targetID)) return api.sendMessage(getText("IDNotFound", "user info - "), threadID, messageID);
        let commandBanned = [];
        let reasonBan = null;
        let dateAdded = null;
        if (global.data.commandBanned.has(targetID)) commandBanned = global.data.commandBanned.get(targetID) || [];
        if (global.data.userBanned.has(targetID)) {
          const dataBanned = global.data.userBanned.get(targetID) || {};
          reasonBan = dataBanned.reason || null;
          dateAdded = dataBanned.dateAdded || null;
        }
        return api.sendMessage(getText("returnInfo",
          `${targetID} - ${nameTarget}`,
          global.data.userBanned.has(targetID) ? "yes" : "no",
          reasonBan ? `(${getText("reason")}: ${reasonBan})` : "",
          dateAdded ? `(${getText("at")}: ${dateAdded})` : "",
          commandBanned.length ? commandBanned.join(", ") : getText("allCommand")), threadID, messageID);
      }

      default:
        return api.sendMessage(getText("errorReponse", "user command - "), threadID, messageID);
    }
  } catch (error) {
    return api.sendMessage(getText("errorReponse", "user command - "), threadID, messageID);
  }
};
