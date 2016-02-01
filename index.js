const discord = require("discord.js");
var command = require("./commands.js");
try {
	var options = require("./options.json");
} catch (e) {
	console.log("no options file, did you replace options.json.example with options.json?");
	console.log("error:");
	console.log(e);
}

//so i don't have to type it everytime
function err(e) {
	if (e) {
		console.log(e);
	}
}

var bot = new discord.Client();

//bot.on("debug", (m) => console.log("[debug]", m)); 
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
	}
}

bot.login(options.discordAccount.email,options.discordAccount.password,(e) => {
	err(e);
	console.log("logged in!");
});