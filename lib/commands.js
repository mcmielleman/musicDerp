const ytdl = require("ytdl-core");

const Song = require("./Song.js"); //song class
const play = require("./play.js");
const ytpl = require("./ytPlaylist.js");

const options = require("../options.json");

module.exports = {
	summon:{	//summon command
		name:"summon",
		description:"makes the bot join your current voicechannel. arguments: none",
		run:function(msg) {
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
		description:"adds a song to the queue. arguments: url",
		run:function(msg) {
			if (!bot.voiceConnection) {
				bot.quickSend("im not in a voice channel");
				return
			}
			var url = msg.content.split(" ")[1];
			try {
				ytdl.getInfo(url,(e,info) => {
					if (e) {
						throw e;
					}
					var songToAdd = new Song(info.title,url,info.length_seconds,msg.author.username);
					if (queue.add(songToAdd)) {
						play(songToAdd);
					}
				});
			} catch (e) {
				bot.quickSend("The song could not be added because of an error while getting it's information");
				return
			}
		}
	},
	queue:{
		name:"queue",
		description:"prints the queue to the text channel. arguments: none",
		run:function () {
			bot.quickSend(queue.niceString(15));
		}
	},
	plist:{
		name:"plist",
		description:"add the first 50 videos of a playlist to the queue. arguments: url",
		run:function (msg) {
			if (!bot.voiceConnection) {
				bot.quickSend("im not in a voice channel");
				return
			}
			if (!options.youtubeAPIKey) {
				bot.quickSend("no youtube api key specified, cannot get playlists");
				return
			}
			var plistURL = msg.content.split(" ")[1];
			if (!plistURL) {
				bot.quickSend("please specify a playlist url");
				return
			}
			if (plistURL.indexOf("list=") === -1 || plistURL.indexOf("youtube") === -1) {
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
	},
	skip:{
		name:"skip",
		description:"skips to the next song. arguments: none",
		run:function() {
			try {
				bot.voiceConnection.stopPlaying();
			} catch (e) {
				bot.quickSend("im not playing anything rn");
			}
		}
	},
	help:{
		name:"help",
		description:"prints help to chat. arguments [command]",
		run:function(msg) {
			var args = msg.content.split(" ");
			if (args.length > 1) {
				for (var comm in module.exports) {
					if (module.exports[comm].name === args[1]) {
						bot.quickSend(`${options.commandPrefix}${module.exports[comm].name} : ${module.exports[comm].description}`);
						break;
					}
				}
				return
			}
			var helpMessage = `*type ${options.commandPrefix}${module.exports.help.name} (command) to get more info*\n**available commands:**`;
			for  (var com in module.exports) {
				helpMessage += `${options.commandPrefix}${module.exports[com].name}\n`;
			}
			bot.quickSend(helpMessage);
		}
	},
	repeat:{
		name:"repeat",
		description:"plays the current song again after the end of this song. arguments: [amountofrepeats]",
		run:function (msg) {
			var args = msg.content.split(" ");
			if (!parseInt(args[1])) {
				var repeats = 1;
			} else {
				var repeats = parseInt(args[1]);
			}
			for (var i = 0;i<repeats;i++) {
				queue.insertNext(queue.list[0]);
			}
		}
	},
	replay:{
		name:"replay",
		description:"plays the current song again at the end of the queue. arguments: [amountofreplays]",
		run:function (msg) {
			var args = msg.content.split(" ");
			if (!parseInt(args[1])) {
				var repeats = 1;
			} else {
				var repeats = parseInt(args[1]);
			}
			for (var i = 0;i<repeats;i++) {
				queue.add(queue.list[0]);
			}
		}
	},
	playLast:{
		name:"playlast",
		description:"Plays the song that was played before the current song. arguments: [positioninhistory]",
		run:function (msg) {
			if (!bot.voiceConnection) {
				bot.quickSend("im not in a voice channel");
				return
			}

			var args = msg.content.split(" ");
			if (!parseInt(args[1])) {
				args[1] = "1";
			}
			var hisPos = parseInt(args[1]) - 1;
			if (!queue.history[hisPos]) {
				bot.quickSend("that is not a position in the history");
				return
			}
			queue.insertNext(queue.history[hisPos]);
			if (bot.voiceConnection.playing) {
				bot.voiceConnection.stopPlaying();
			} else {
				play(queue.Next());
			}
		}
	},
	history:{
		name:"history",
		description:"prints the song history to chat. arguments: none",
		run:function () {
			bot.quickSend(queue.getHistory());
		}
	},
	clear:{
		name:"clear",
		description:"clears the queue. argumenten: none",
		run:function () {
			bot.quickSend(`Removed ${queue.clear().length} items`;
		}
	}
}
