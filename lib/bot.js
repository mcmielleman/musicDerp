var discord = require("discord.js");
var bot = new discord.Client();
bot.quickSend = function(msg) {
	bot.sendMessage(bot.commandChannel,msg,{"tts":false},e => {
		if (e) throw e;
	});
}
module.exports = bot;
