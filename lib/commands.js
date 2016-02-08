const ytdl = require("ytdl-core");

const Song = require("./Song.js"); //song class
const play = require("./play.js");
const ytpl = require("./ytPlaylist.js");

const apiKey = require("../options.json").youtubeAPIKey;

module.exports = {
	summon:{	//summon command
		name:"summon",
		description:"makes the bot join your current voicechannel",
		command:function(msg) {
			var voiceChannel = msg.author.voiceChannel;
			if (!voiceChannel) {
				bot.quickSend("you are not in a voice channel");
				return
			}
			bot.joinVoiceChannel(voiceChannel,e => {
				if (e) {
					bot.quickSend("error with joining the voice channel");
					return
				}
			});
		}
	},
	add:{
		name:"add",
		description:"adds a song to the queue",
		command:function(msg) {
			if (!bot.voiceConnection) {
				bot.quickSend("im not in a voice channel");
				return
			}
			var url = msg.content.split(" ")[1];
			ytdl.getInfo(url,(e,info) => {
				if (e) {
					bot.quickSend("The song could not be added because of an error while getting it's information");
					return
				}
				var songToAdd = new Song(info.title,url,info.length_seconds,msg.author.username);
				if (queue.add(songToAdd)) {
					play(songToAdd);
				}
			});
		}
	},
	queue:{
		name:"queue",
		description:"prints the queue to the text channel",
		command:function () {
			bot.quickSend(queue.niceString(15));
		}
	},
	plist:{
		name:"plist",
		description:"add the first 50 videos of a playlist to the queue",
		command:function (msg) {
			if (!apiKey) {
				bot.quickSend("no youtube api key specified, cannot get playlists");
				return
			}
			var plistURL = msg.content.split(" ")[1];
			if (plistURL.indexOf("list=") === -1) {
				bot.quickSend("that is not a valid playlist url");
				return
			}
			var pid;
			plistURL.split("?")[1].split("&").forEach((val,i) => {
				if (val.startsWith("list=")) {
					pid = val.substring(5);
				}
			});
			ytpl(pid,(body) => {
				body.items.forEach((item,idx) => {
					var songLink = `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`;
					console.log("working on " + idx);
					ytdl.getInfo(songLink,(err,info) => {
						if (err) {
							if (err.toString().indexOf("Code 150") > -1) {
								bot.quickSend("a video was not available in the bot's country, skipping that one");
								return
							}
						}
						var s = new Song(info.title,songLink,info.length_seconds,msg.author.username);
						if (queue.add(s)) {
							play(s);
						}
					});
				});
			});
		}
	}
}
var self = module.exports;
