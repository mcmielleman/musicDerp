const discord = require("discord.js");
const ytdl = require("ytdl-core");

//so i don't have to type it everytime
function err(e) {
	if (e) {
		console.log(e);
		process.exit(1);
	}
}
var musicPath = require("./options.json").fullMusicPath;
var self = module.exports;
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
			bot.reply(msg,"Joined ya!");
		}
	},
	"play":{
		"name":"play",
		"description":"plays a youtube or other youtube-dl supported link",
		"exec":(bot,msg) => {
			if (bot.voiceConnection == null) {
				bot.reply(msg,"im not in a voice channel!, make me join one with $summon");
				return
			}
			var connection = bot.voiceConnection;
			var url = msg.content.split(" ").splice(1)[0];
			if (url === "https://www.youtube.com/watch?v=dQw4w9WgXcQ") {
				bot.sendMessage(msg.channel,"fuckoff guus",err);
			}
			var stream = ytdl(url,"audioonly");
			connection.playRawStream(stream,(e,intent) => {
				err(e);
				ytdl.getInfo(url,(er,info) => {
					err(er);
					var vidTitle = info.title;
					console.log("playing url with title: " + vidTitle);
					bot.setStatus("online",vidTitle,err);
				});
				intent.on("end",(e) => {
					bot.setStatus("online",null,err);
				});
			})

		}
	},
	"stop":{
		"name":"stop",
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
				bot.reply(msg,"im not in a voice channel!, make me join one with " + self.summon.name);
				return
			}
			var connection = bot.voiceConnection;
			var file = process.cwd() + "/test.mp3";
			connection.playFile(file).then(intent => {
				bot.setStatus("online","test/intro",err);
				intent.on("end", () => {
					bot.setStatus("online",null,err);
				});
			});
			console.log("playing: test file");
		}
	}
}