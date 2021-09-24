# Local Install on MacOS with MongoDB
This will walk through the steps to getting Homebrewery running locally on your computer without needing internet access to create and save brews.  It provides steps on how to get set up with either a **production** environment (if you just want to make brews) or a **development** environment (if you want to submit code changes to project).  Finally, it will provide instruction on how to update to the lastest release over time.  This will be written with no assumption of technical skill as I have very little myself.

## Step 1: Install [Homebrew](https://brew.sh)
Homebrew is a *package manager* for macOS and Linux, and we will use it to install NodeJS, MongoDB, and git.  You likely will need to be an Administrator on your machine.

- Go to [Homebrew's website](https://brew.sh) and copy the bit of code under "Install Homebrew".
- Open the Terminal  (`cmd` + `spacebar` and search "Terminal")
- Paste in the code and hit `Enter`.  It may ask for your user password to make the needed changes.  If at any point you get an error prompt advising the program was blocked because it is from the internet, go to System Preferences in the Apple menu, go to Privacy & Security, and click the "Allow Anyway" button, then try the previous step again.
- When done installing, enter in the Terminal `brew update`.

## Step 2: Install [Node.js](https://nodejs.dev/download/package-manager/)
- In the same Terminal window, type `brew install node`


### Alternate NodeJS installation with [NVM](https://nodejs.dev/download/package-manager/)
Installing NodeJS with Homebrew allows for getting set up with Homebrewery using only a single package manager to set up the dependencies.  However, if you don't mind installing one more piece, you could install and manage NodeJS using NVM (Node Version Manager).

NVM allows the installation of multiple versions of NodeJS on your machine, and the ability to switch between those versions should you need an exact version for a specific project (and different versions for other projects).  This is handy if you are a developer and think you need more flexibility with NodeJS.  [Here is a walkthrough on that.](https://techstacker.com/run-multiple-node-versions-node-nvm/)

## Resources
Below is a list of resources that I found helpful in figuring this out-- Not one of them is a "silver bullet" in getting Homebrewery running on your machine, but together they help provide a path.

a. [Official MongoDB Installation docs](https://docs.mongodb.com/guides/server/install/) - be sure to choose MacOS option.
b. [GeeksForGeeks.com MongoDB/MacOS guide](https://www.geeksforgeeks.org/how-to-install-mongodb-on-macos/)
c. [Attacomsian.com Install MongoDB with Homebrew](https://attacomsian.com/blog/install-mongodb-macos) - "Homebrew" is not related to Homebrewery at all, just a way to install MongoDB.
d. [FreeCodeCamp.org Install MongoDB in 10 Minutes](https://www.freecodecamp.org/news/learn-mongodb-a4ce205e7739/)
e. [PhoenixNap.com Managing Environment Variables on MacOS](https://phoenixnap.com/kb/set-environment-variable-mac)
f. [Techstacker.com What is Homebrew and How to Install](https://techstacker.com/what-is-homebrew/)
g. [Techstacker.com What is NVM and How to Install](https://techstacker.com/run-multiple-node-versions-node-nvm/)

## Glossary
- package manager: manages the installation and updates of 'packages' such as utility programs like Homebrew and NodeJS, or more familiar programs like Firefox or Chrome.