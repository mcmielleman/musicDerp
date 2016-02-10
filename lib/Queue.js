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
    if (!s) {
      console.log("tried to add undefined to queue, skipping");
      return
    }
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
    this.list.splice(i,0,s);
  }

  this.insertNext = function(s) {
    if (!this.list[0]) {
      this.list.splice(0,0,s);
    }
    this.list.splice(1,0,s);
  }

  this.niceString = function (limit) {
    var str = "Queue:";
    for (var i = 0;i<this.list.length;i++) {
      str += `\n${i}. ${this.list[i].getShortTitle()} ${this.list[i].timeString()} added by ${this.list[i].requester}`
      if (!!limit && i >= limit) {
        str += "\nand more!";
        break;
      }
    }
    return str;
  }
  this.getHistory = function() {
    var str = "History:"
    for (var i = 0;i<this.history.length;i++) {
      str += `\n${i+1}. ${this.history[i].getShortTitle()} ${this.history[i].timeString()} added by ${this.history[i].requester}`
    }
    return str;
  }

  this.clear = function () {
    var oldList = this.list;
    this.list = [oldList[0]];
    return oldList;
  }
}
