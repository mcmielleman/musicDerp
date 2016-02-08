const request = require("superagent");
const Song = require("./Song.js");
const ytdl = require("ytdl-core");

const apiKey = require("../options.json").youtubeAPIKey;

module.exports = function (pid,callback) {
  var reqURL = "https://www.googleapis.com/youtube/v3/playlistItems" + `?part=contentDetails&maxResults=50&playlistId=${pid}&key=${apiKey}`
  request
    .get(reqURL)
    .end((err,res) => {
      if (err) throw err;
      if (!res.ok) {
        bot.quickSend("there was an error while getting that playlist");
        return
      }
      callback(res.body);
    });
}
