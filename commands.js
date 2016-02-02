const discord = require("discord.js");
const ytdl = require("ytdl-core");
const options = require("./options.json");

function err(e) {	//so i don't have to type it everytime
	if (e) {
		throw e;
	}
}

//queue
var queue = [];

function playSong(bot,msg) {
	if (bot.voiceConnection === null) {
		bot.reply(msg,"im not in a voice channel!, make me join one with " + options.commandPrefix + self.summon.name,{"tts":false},err);
		return
	}
	var connection = bot.voiceConnection;
	var songUrl = msg.content.split(" ").splice(1)[0];
	
	var stream = ytdl(songUrl,"audioonly");
	try {
		connection.playRawStream(stream,{"volume":0.3},(e,intent) => {
			err(e);
			console.log("playing " + msg.songInfo.title);
			bot.setStatus("online",msg.songInfo.title);
			bot.sendMessage(msg.channel,`now playing ${msg.songInfo.title} {${msg.songInfo.timeLength.m}:${msg.songInfo.timeLength.s}}`,err);
			intent.on("end",(e) => {
				queue.shift()
				var nextSong = queue[0];
				if (nextSong !== undefined) {
					playSong(bot,queue[0]);
				} else {
					bot.sendMessage(msg.channel,"I finished the queue.",err);
					bot.setStatus("online",null,err);
				}
			});
		});
	} catch (e) {
		console.log("error with playing stream");
	}
}
function enhanceMessage(msg,callback) {
	var songUrl = msg.content.split(" ").splice(1)[0];
	ytdl.getInfo(songUrl,(e,info) => {
		err(e);
		msg.songInfo = {};
		msg.songInfo.title = info.title;		//adding the song title to the message when it's added so i don't have to get them all when the queue command is called
		msg.songInfo.timeLength = {				//adding the length in minutes (m) and seconds (s) to the songInfo
			"m":Math.floor(info.length_seconds/60),
			"s":info.length_seconds - (Math.floor(info.length_seconds/60)*60)
		}
		callback(msg);
	});
}

//export
module.exports = {
	"summon":{
		"name":"summon",
		"description":"makes the bot join your current voicechannel",
		"exec":(bot,msg) => {
			var channel = msg.author.voiceChannel;
			if (channel == null) {
				bot.reply(msg,"You're not in a voice channel, Sir!",{"tts":false},err);
				return;
			}
			bot.joinVoiceChannel(channel,err);
		}
	},
	"play":{
		"name":"playNow",
		"description":"plays a youtube or other youtube-dl supported link",
		"exec":(bot,msg) => {
			queue.splice(1,0,msg);
			self.stop.exec(bot,msg);
		}
	},
	"stop":{
		"name":"skip",
		"description":"stops playing songs",
		"exec":(bot,msg) => {
			if (bot.voiceConnection) {
				bot.voiceConnection.stopPlaying();
			}
		}
	},
	"test":{
		"name":"test",
		"description":"play the included test file",
		"exec":(bot,msg) => {
			if (bot.voiceConnection == null) {
				bot.reply(msg,"im not in a voice channel!, make me join one with " + options.commandPrefix + self.summon.name,{"tts":false},err);
				return
			}
			var connection = bot.voiceConnection;
			var file = process.cwd() + "/test.mp3";
			connection.playFile(file,{"volume":0.3},(intent) => {
				bot.setStatus("online","test/intro",err);
				intent.on("end", () => {
					bot.setStatus("online",null,err);
				});
			});
			console.log("playing: test file");
		}
	},
	"add":{
		"name":"add",
		"description":"adds a song to the queue",
		"exec":(bot,msg) => {
			try {
					enhanceMessage(msg,(m) => {
						bot.reply(m,"i added " + m.songInfo.title + " to the queue!")
						queue.push(m);
						console.log(`added song ${m.songInfo.title} {${m.songInfo.timeLength.m}:${m.songInfo.timeLength.s}} to the queue`);
						if (queue[0].equals(m)) { 	//if the added song is the first in queue, play it
							playSong(bot,m);
						}
					});
			} catch (e) {
				bot.reply(msg,"That is not a valid url");
			}		
		}
	},
	"queue":{
		"name":"queue",
		"description":"prints the queue in chat",
		"exec":(bot,msg) => {
			var queueWithTitles = [];
			for (var i = 0;i<queue.length;i++) {
				var songInfo = queue[i].songInfo;
				var niceTitle = `${songInfo.title} {${songInfo.timeLength.m}:${songInfo.timeLength.s}} added by ${queue[i].author.username}`
				queueWithTitles.push(niceTitle);
			}
			var queueString = "Queue:\n" + queueWithTitles.join("\n");
			if (queue[0] === undefined) {
				bot.sendMessage(msg.channel,"the queue is empty",err);
			} else {
				bot.sendMessage(msg.channel,queueString,err);
			}
		}
	}

}
var self = module.exports;