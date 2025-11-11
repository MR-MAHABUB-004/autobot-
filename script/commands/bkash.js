const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "bkash",
  version: "1.0.0",
  permission: 0,
  credits: "IMRAN",
  description: "An example command that calls a Nagad API and saves the file",
  prefix: false,
  premium: false,
  category: "Fun",
  usages: "nagad number-txid-amount",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const threadID = event.threadID;
  const messageID = event.messageID;

  // If no argument is given, send usage notice and react ❌
  if (!args[0]) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(
      "❌ Usage: example number-txid-amount\nExample: example 01912345678-ABC123XYZ-5000",
      threadID,
      messageID
    );
  }

  const parts = args[0].split("-");
  if (parts.length !== 4) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(
      "❌ Invalid format!\nUsage: example number-txid-amount\nExample: example 01912345678-ABC123XYZ-5000",
      threadID,
      messageID
    );
  }

  const [number, transaction, amountStr, chargeStr] = parts;
  const amount = parseFloat(amountStr);
  const charge = parseFloat(chargeStr);
  const total = amount + charge;

  const url = `https://masterapi.site/api/bkashf.php?number=${encodeURIComponent(number)}&transaction=${encodeURIComponent(transaction)}&amount=${amount}&total=${total}`;

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    const contentType = response.headers['content-type'];
    const extension = contentType.split('/')[1] || 'bin';
    const filePath = path.join(__dirname, `nagad_response.${extension}`);

    fs.writeFileSync(filePath, response.data);

    // React with ✅
    api.setMessageReaction("✅", messageID, () => {}, true);

    api.sendMessage({
      body: `✅ API Called Successfully!\n\nNumber: ${number}\nTransaction: ${transaction}\nAmount: ${amount}\nTotal: ${total}`,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
      fs.unlinkSync(filePath);
    }, messageID);

  } catch (error) {
    // React with ❌ on error
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage(
      `❌ API call failed:\n${error.message}`,
      threadID,
      messageID
    );
  }
};