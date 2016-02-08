var ytdl = require("ytdl-core");

module.exports = function (title,url,length_sec,requester) {
  this.title = title;
  this.url = url;
  this.length_sec = length_sec;
  this.requester = requester;
  this.type = "Song";
	this.id = Symbol();
  this.timeString = function() {
    return `{${Math.floor(this.length_sec/60)}:${this.length_sec - Math.floor(this.length_sec/60)*60}}`
  }
  this.getStream = function () {
    try {
      var stream = ytdl(this.url,{
        "filter":"audioonly"
      });
    } catch (e) {
      if (e) throw e;
    }
    return stream;
  }
  this.getShortTitle = function() {
    return (this.title.split(" ").slice(0,8).join(" ") + "...");
  }
}
