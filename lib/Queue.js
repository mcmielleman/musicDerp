module.exports = function() {
  this.list = [];
  this.history = [];
  this.next = function() {
    var lastSong = this.list.shift();
    this.history.splice(0,0,lastSong);
    this.history = this.history.slice(0,10); //only remember the last 10 songs
    return this.list[0];
  }

  this.add = function(s) {
    if (s.type !== "Song") {
  		throw new Error("Entered song was not of type Song");
  	}

    var empty = !this.list[0];
    this.list.push(s);
    return empty;
  }

  this.insert = function (s,i) {
    if (i < 1) {
      throw new Error("cannot instert song at index 0 because that is the current song");
    }
  }

  this.currentSong = function() {
    return this.list[0];
  }

  this.niceString = function (limit) {
    var str = "Queue:";
    for (var i = 0;i<this.list.length;i++) {
      str += `\n${this.list[i].getShortTitle()} ${this.list[i].timeString()} added by ${this.list[i].requester}`
      if (!!limit && i >= limit) {
        str += "\nand more!";
        break;
      }
    }
    return str;
  }
}
