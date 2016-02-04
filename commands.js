const ytdl = require("ytdl-core");
const options = require("./options.json");
const request = require("superagent");
const discord = require("discord.js");

function err(e) {	//so i don't have to type it everytime
	if (e) {
		throw e;
	}
}

//queue
var queue = [];

function addToQueue(bot,m) {
	var queueIsEmpty = false;
	if (queue[0] === undefined) {
		queueIsEmpty = true;
	}
	bot.reply(m,"i added " + m.songInfo.title + " to the queue!")
	queue.push(m);
	console.log(`added song ${m.songInfo.title} {${m.songInfo.timeLength.m}:${m.songInfo.timeLength.s}} to the queue`);
	if (queueIsEmpty) { 	//if the added song is the first in queue, play it
		playSong(bot,m);
	}
}

function playSong(bot,msg) {
	if (bot.voiceConnection === null) {
		bot.reply(msg,"im not in a voice channel!, make me join one with " + options.commandPrefix + self.summon.name,{"tts":false},err);
		return
	}
	if (!msg.enhanced) {
		throw new Error("entered a not enhanced msg in playSong function");
	}
	var connection = bot.voiceConnection;
	
	var stream = ytdl(msg.songInfo.url,"audioonly");
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
function enhanceMessage(msg,callback) {		//adding msg.songInfo so i can get that once and be done. async
	var songUrl = msg.content.split(" ")[1];
	msg.enhanced = true;
	msg.songInfo = {};
	msg.songInfo.url = songUrl;
	try {
		ytdl.getInfo(songUrl,(e,info) => {
			err(e);
			msg.songInfo.title = info.title;
			msg.songInfo.timeLength = {
				"m":Math.floor(info.length_seconds/60),
				"s":info.length_seconds - (Math.floor(info.length_seconds/60)*60)
			}
			callback(msg);
		});
	} catch (e) {
		err(e);
	}
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
		"description":"command to use for testing of new features, not usefull for end-user",
		"exec":(bot,msg) => {

		}
	},
	"add":{
		"name":"add",
		"description":"adds a song to the queue",
		"exec":(bot,msg) => {
			enhanceMessage(msg,(m) => {
				addToQueue(queue,m);
			});	
		}
	},
	"addpl":{
		"name":"plist",
		"description":"adds all the songs of a playlist to thea queue",
		"exec":(bot,msg) => {
			if (!options.youtubeAPIKey) {
				bot.reply(msg,"No youtube api key specified in the options file, can't get playlist");
				return
			}
			//https://www.youtube.com/playlist?list=PLBHuR7fUesrt3MiAu5wwUDHlcJOBbmPwX
			var apiKey = options.youtubeAPIKey;
			var playlistURL = msg.content.split(" ")[1];
			var pid;
			playlistURL.split("?")[1].split("&").forEach((val,i) => {
				if (val.startsWith("list=")) {
					pid = val.substring(5);
				}
			});
			console.log(pid);
			var requestURL = "https://www.googleapis.com/youtube/v3/playlistItems" + `?part=contentDetails&maxResults=50&playlistId=${pid}&key=${apiKey}`
			var playList = request.get(requestURL).end((error,res) => {
				err(error);
				if (!res.ok) {
					bot.reply(msg,"there was an error while getting the playlist information");
				}
				var videoArr = res.body.items;

				for (var i = 0;i<videoArr.length;i++) {
					var videoId = videoArr[i].contentDetails.videoId;
					var msgId = `{msg.id}-${i}`;
					var queueMsg = {
						"content":`add https://www.youtube.com/watch?v=${videoId}`,
						"author":msg.author,
						"channel":msg.channel,
						"id":`${msg.id}-${i}`
					}
					enhanceMessage(queueMsg,(qm) => {
						addToQueue(bot,qm);
					});
				}

			});
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