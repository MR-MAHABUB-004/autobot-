module.exports.config = {
  name: "anime",
  version: "1.0.2",
  permission: 0,
  credits: "IMRAN",
  prefix: true,
  description: "Video command",
  category: "media",
  premium: false,
  usages: "anime",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const axios = require("axios")
    const request = require("request")
    const fs = require("fs-extra")
    const imran = await axios.get('https://imranapi.my.id/api/anime')
    const imu = imran.data.message;
    var msg = [];
    let video = `${imu}`;

    let videos = (await axios.get(`${video}`, {
        responseType: 'arraybuffer'
    })).data;
    fs.writeFileSync(__dirname + "/cache/video.mp4", Buffer.from(videos, "utf-8"));
    var allimage = [];
    allimage.push(fs.createReadStream(__dirname + "/cache/video.mp4"));

    return api.sendMessage({
        body: "☆《ANIME VIDEO》☆",
        attachment: allimage
    }, event.threadID, event.messageID);
}