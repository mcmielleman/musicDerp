module.exports = function (song) {
	if (song.type !== "Song") {
		throw new Error("Entered song was not of type Song");
	}
	if (!bot.voiceConnection) {
		bot.quickSend("im not in a voice channel");
		return "novoice";
	}
	var stream = song.getStream();
	bot.voiceConnection.playRawStream(stream,{"volume":0.5},(e,intent) => {
		if (e) throw e;
		bot.quickSend(`now playing: ${song.title}`);
		intent.on("error", e => {
			throw e;
		});
		intent.on("end",() => {
			bot.emit("songEnd",song);
		});
	});
}
