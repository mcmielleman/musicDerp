var discord = require("discord.js");
var command = require("./lib/commands.js");
var Queue = require("./lib/Queue.js");
var play = require("./lib/play.js");

try {
	var options = require("./options.json");
} catch (e) {
	console.log("no options file, did you replace options.json.example with options.json?");
	process.exit(0);
}

global.bot = new discord.Client();	//initializing the bot, it is global so that the modules can acces the bot
bot.quickSend = function(msg) {			//adding a quikSend message so the bot doesn't have to
	bot.sendMessage(options.commandChannel,msg,{"tts":false},e => {
		if (e) throw e;
	});
}

if (typeof options.commandChannel !== "string" && options.commandChannel != undefined) {
	throw new TypeError("options.commandChannel is not a string");
}

//queue handling
global.queue = new Queue();
bot.on("songEnd",(song) => {
	play(queue.next());
});

//logging debug and warn messages to console, feel free to comment these 2 lines if you don't want those messages in console
bot.on("debug", (m) => console.log("[debug]", m));
bot.on("warn", (m) => console.log("[warn]", m));

//bot event listeners
bot.on("ready",() => {
	console.log("ready");
	bot.joinServer(options.discordInvite,(e,serv) => {	//when the bot is ready, make it join the specified server
		if (e) throw e;

		console.log("Joined server: " + serv.name);
		//now that the bot is on the server, it can check if the commandChannel is valid
		if (!options.commandChannel) {
			options.commandchannel = serv.channels.get("type","text");
		}

		bot.quickSend("hello");
	});
});

bot.on("message",messageHandler);
function messageHandler(msg){
	if (!msg.channel.id === options.commandChannel) {
	}
	var m = msg.content;
	if (!m.startsWith(options.commandPrefix)) {
		return
	}

	m = m.slice(options.commandPrefix.length);
	switch (true) {
		case m.startsWith(command.summon.name):
			command.summon.command(msg);
			break;
		case m.startsWith(command.add.name):
			command.add.command(msg);
			break;
		case m.startsWith(command.queue.name):
			command.queue.command(msg);
			break;
		case m.startsWith(command.plist.name):
			command.plist.command(msg);
			break;
	}
}
// Handle ECONNRESETs caused by skip
process.on('uncaughtException', function(e) {
  if (e.code == 'ECONNRESET') {
    // Yes, I'm aware this is really bad node code. However, the uncaught exception
    // that causes this error is buried deep inside either discord.js, ytdl or node
    // itself and after countless hours of trying to debug this issue I have simply
    // given up. The fact that this error only happens *sometimes* while attempting
    // to skip to the next video (at other times, I used to get an EPIPE, which was
    // clearly an error in discord.js and was now fixed) tells me that this problem
    // can actually be safely prevented using uncaughtException. Should this bother
    // you, you can always try to debug the error yourself and make a PR.
    console.log('Got an ECONNRESET! This is *probably* not an error. Stacktrace:');
    console.log(e.stack);
  } else {
    // Normal error handling
   	throw e;
  }
});

//start the bot
bot.login(options.discordAccount.email,options.discordAccount.password,(e) => {
	if (e) throw e;
	console.log("logged in!");
});
