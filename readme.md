#MusicDerp
a bot that plays music in discord, 
based on [discord.js](http://hydrabolt.github.io/discord.js/)
**this bot is WIP so expect some crashes, when it  does crash, you can create a new issue on the github page, please provide instructions on how to recreate the crash**
##features

*  play song from youtube url
*  play youtube playlist from playlist url
*  print queue in chat
*  skip songs

##installation
MusicDerp is easiest to install on ubuntu or similar linux distro's, because i don't have windows i cannot provide installation instructions for windows. the following instructions should work for linux and mac
###dependencies:
--------------------
####node and npm:
download node and npm from [here](https://nodejs.org/en/). you can check that it's installed correctly by opening the terminal and typing `node -v`, it should be `version 5.5.0` or higher.
####ffmpeg
if you're running osx or ubuntu 15.x.x this will *probably* already be installed, but check to make sure. 
type `ffmpeg` in the terminal. if it's not installed, type `sudo apt-get install ffmpeg`. If you are on Ubuntu 14.04, install https://launchpad.net/~mc3man/+archive/ubuntu/trusty-media/

mac users can use brew to install ffmpeg
####python 2.7
this is needed for installing the libraries with npm, on linux, type `sudo apt-get install python2.7`. make sure u set  the `python` command to python 2.7, you can do this by adding this line to your `~/.bashrc`:
`export PYTHON=/usr/bin/python2.7`
####other
for linux, install build-essential: `sudo apt-get install build-essential`.

for OSX install Xcode command line tools

###MusicDerp installation
------------------------------
once you've installed all the dependencies, download this source, and put it in a nice place. run npm install in the folder where index.js and package.json are. if you are getting any errors with `node-gyp` while installing there's probably something wrong with your python install.
if the install ran succesfully:
rename `options.json.example` to `options.json` and fill in all the details, note: the youtube api key is optional but is required for the youtube playlist functionallity. 
to create a youtube api key, 
read [this](https://developers.google.com/youtube/v3/getting-started) and follow the instructions.
after you've done this try to run the bot with either: `node index.js` or `npm start`.