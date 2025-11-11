module.exports.config = {
  name: "love5",
  version: "1.0.2",
  permission: 0,
  credits: "IMRAN", // Original author
  description: "Combine two emojis into one",
  prefix: true,
  category: "love",
  usages: "mention",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "path": "",
    "jimp": ""
  }
};
module.exports.onLoad = async () => {
  const {
    resolve: _0x3af9f2
  } = global.nodemodule.path;
  const {
    existsSync: _0x4a1542,
    mkdirSync: _0xc1d16b
  } = global.nodemodule["fs-extra"];
  const {
    downloadFile: _0x4374c1
  } = global.utils;
  const _0x3b81a2 = __dirname + "/cache/canvas/";
  const _0xa57cb9 = _0x3af9f2(__dirname, "cache/canvas", "imran3.jpg");
  if (!_0x4a1542(_0x3b81a2 + "canvas")) {
    _0xc1d16b(_0x3b81a2, {
      'recursive': true
    });
  }
  if (!_0x4a1542(_0xa57cb9)) {
    await _0x4374c1("https://i.postimg.cc/jqJfbQpd/Love-is-Beautiful.jpg", _0xa57cb9);
  }
};
async function makeImage({
  one: _0x40807f,
  two: _0x45cca8
}) {
  const _0x5afcf9 = global.nodemodule["fs-extra"];
  const _0x1298ae = global.nodemodule.path;
  const _0x2cbaea = global.nodemodule.axios;
  const _0x647ec = global.nodemodule.jimp;
  const _0x570bc2 = _0x1298ae.resolve(__dirname, "cache", "canvas");
  let _0x2f95e9 = await _0x647ec.read(_0x570bc2 + "/imran3.jpg");
  let _0x5a89b4 = _0x570bc2 + ("/love_" + _0x40807f + '_' + _0x45cca8 + ".png");
  let _0x3e9cc3 = _0x570bc2 + ("/avt_" + _0x40807f + ".png");
  let _0x423db9 = _0x570bc2 + ("/avt_" + _0x45cca8 + ".png");
  let _0x457761 = (await _0x2cbaea.get("https://graph.facebook.com/" + _0x40807f + "/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662", {
    'responseType': "arraybuffer"
  })).data;
  _0x5afcf9.writeFileSync(_0x3e9cc3, Buffer.from(_0x457761, "utf-8"));
  let _0x17ecc9 = (await _0x2cbaea.get("https://graph.facebook.com/" + _0x45cca8 + "/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662", {
    'responseType': "arraybuffer"
  })).data;
  _0x5afcf9.writeFileSync(_0x423db9, Buffer.from(_0x17ecc9, "utf-8"));
  let _0x2866ae = await _0x647ec.read(await circle(_0x3e9cc3));
  let _0x13eb63 = await _0x647ec.read(await circle(_0x423db9));
  _0x2f95e9.composite(_0x2866ae.resize(316, 325), 142, 210).composite(_0x13eb63.resize(314, 325), 813, 210);
  let _0x3cdb98 = await _0x2f95e9.getBufferAsync("image/png");
  _0x5afcf9.writeFileSync(_0x5a89b4, _0x3cdb98);
  _0x5afcf9.unlinkSync(_0x3e9cc3);
  _0x5afcf9.unlinkSync(_0x423db9);
  return _0x5a89b4;
}
async function circle(_0x25246f) {
  const _0x21e8f8 = require("jimp");
  _0x25246f = await _0x21e8f8.read(_0x25246f);
  _0x25246f.circle();
  return await _0x25246f.getBufferAsync("image/png");
}
module.exports.run = async function ({
  event: _0x571a75,
  api: _0x910110,
  args: _0x529d23
}) {
  const _0x7c5a21 = global.nodemodule["fs-extra"];
  const {
    threadID: _0x480218,
    messageID: _0x36c9b3,
    senderID: _0x313f80
  } = _0x571a75;
  var _0x587f0b = Object.keys(_0x571a75.mentions)[0];
  let _0x27e620 = _0x571a75.mentions[_0x587f0b].replace('@', '');
  if (!_0x587f0b) {
    return _0x910110.sendMessage("Please tag 1 person", _0x480218, _0x36c9b3);
  } else {
    return makeImage({
      'one': _0x313f80,
      'two': _0x587f0b
    }).then(_0x10a521 => _0x910110.sendMessage({
      'body': "This " + _0x27e620 + " love you so much💔",
      'mentions': [{
        'tag': _0x27e620,
        'id': _0x587f0b
      }],
      'attachment': _0x7c5a21.createReadStream(_0x10a521)
    }, _0x480218, () => _0x7c5a21.unlinkSync(_0x10a521), _0x36c9b3));
  }
};