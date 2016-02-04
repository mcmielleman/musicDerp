const discord = require("discord.js");
var command = require("./commands.js");
try {
	var options = require("./options.json");
} catch (e) {
	console.log("no options file, did you replace options.json.example with options.json?");
	console.log("error:");
	throw e;
}

function err(e) {	//so i don't have to type it everytime
	if (e) {
		throw e;
	}
}
var musicTextChannelIDisSet = false;
if (options.musicTextChannelID !== undefined && options.musicTextChannelID !== null && options.musicTextChannelID !== "") {
	var musicTextChannelIDisSet = true;
}

var bot = new discord.Client();

//bot.on("debug", (m) => console.log("[debug]", m)); //uncomment to show debug messages in console
bot.on("warn", (m) => console.log("[warn]", m));

bot.on("ready",(e) => {
	err(e);
	console.log("ready");
	bot.joinServer(options.discordInvite,(e,serv) => {
		err(e);
		console.log("Joined server: " + serv.name);
	});
});

bot.on("message",messageHandler);
function messageHandler(msg,e){
	err(e);
	var m = msg.content;

	if (musicTextChannelIDisSet) {
		if (msg.channel.id !== options.musicTextChannelID) {
			return
		}
	}
	if (!m.startsWith(options.commandPrefix)) {
		return
	}

	m = m.slice(1);
	switch (true) {
		case m.startsWith(command.summon.name):
			command.summon.exec(bot,msg);
			break;
		case m.startsWith(command.play.name):
			command.play.exec(bot,msg);
			break;
		case m.startsWith(command.stop.name):
			command.stop.exec(bot,msg);
			break;
		case m.startsWith(command.test.name):
			command.test.exec(bot,msg);
			break;
		case m.startsWith(command.add.name):
			command.add.exec(bot,msg);
			break;
		case m.startsWith(command.queue.name):
			command.queue.exec(bot,msg);
			break;
		case m.startsWith(command.addpl.name):
			command.addpl.exec(bot,msg);
			break;
	}
}

process.on('uncaughtException', function(e) {
  // Handle ECONNRESETs caused by `next` or `destroy`
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
   	err(e)
  }
});

bot.login(options.discordAccount.email,options.discordAccount.password,(e) => {
	err(e);
	console.log("logged in!");
});