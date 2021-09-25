# Local Install on MacOS with MongoDB
This will walk through the steps to getting Homebrewery running locally on your computer without needing internet access to create and save brews.  It provides steps on how to get set up with either a **production** environment (if you just want to make brews) or a **development** environment (if you want to submit code changes to project).  Finally, it will provide instruction on how to update to the lastest release over time.  This will be written with no assumption of technical skill as I have very little myself.

## Step 1: Install [Homebrew](https://brew.sh)
Homebrew is a *package manager* for macOS and Linux, and we will use it to install NodeJS, MongoDB, and git.  You likely will need to be an Administrator on your machine.

- Go to [Homebrew's website](https://brew.sh) and copy the bit of code under "Install Homebrew".
- Open the Terminal  (`cmd` + `spacebar` and search "Terminal")
- Paste in the code and hit `Enter`.  It may ask for your user password to make the needed changes.  If at any point you get an error prompt advising the program was blocked because it is from the internet, go to System Preferences in the Apple menu, go to Privacy & Security, and click the "Allow Anyway" button, then try the previous step again.
- When done installing, enter in the Terminal `brew update`.

## Step 2: Install [Node.js](https://nodejs.dev/download/package-manager/)

- In the same Terminal window, type `brew install node`.  This should install NodeJS without any further input.  

## Step 3: Install [MongoDB](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)
MongoDB will be your database for storing any information passed to Homebrewery such as your brews.  This is how brews are stored on the Homebrewery website unless a user decides to use their Google Drive account.

### MacOS Catalina, Big Sur, or newer
In the terminal: 
- create a folder to store the Mongo data:  `sudo mkdir -p /System/Volumes/Data/data/db`
- set the permissions on that folder:  `sudo chown -R `\`id -un\`` /System/Volumes/Data/data/db`
- use Homebrew to add MongoDB:  `brew tap mongodb/brew`  followed by `brew install mongodb-community@5.0`  (as of Sep 2021)
- start MongoDB as a background process: `brew services start mongodb-community@5.0`

You should see `Successfully started 'mongodb-community'...`.   MongoDB will always run as a background process going forward, and restart when you restart your computer.  You could change this by substituting `brew services start...` with `brew services run...` which will terminate Mongo when you turn off of your computer (and will need to be run again when you need it).  

### Setting up "Aliases" (optional)
Aliases allow you to create shortcuts in the terminal, and the below is a totally optional method of creating shortcuts to better manage your Mongo database service.  

- In Finder, navigate to your "home" directory (generally is the folder with your username and a house icon)
- Reveal hidden system files and folders by hitting `shift` `cmd` `.` and you'll see those items appear, greyed out. 
- If there is a `.zshrc` file already, open it...if there isn't, open a text editor (TextEdit will work) and create a file just named `.zshrc` and click okay when it warns you that such files are used by the system.
- add the following lines to the file and save it.
```
alias mongod-run="brew services run mongodb-community@5.0"
alias mongod-start="brew services start mongodb-community@5.0"
alias mongod-status="brew services list"
alias mongod-stop="brew services stop mongodb-community@5.0"
alias mongod-restart="brew services restart mongodb-community@5.0"
```
- In the Terminal, run `source ~/.zshrc`
- Now you should be able to run the shortcuts.  In the Terminal, run `brew services status` and after hitting Enter you should get a list of services running and their status (if you started your MongoDB service it should be listed).

## Step 4: Create Homebrewery Database
In the Terminal:
- type `mongosh` and you will get a result indicating you've opened Mongo
- type `use homebrewery` to create a database for Homebrewery
- type `db.brews.insert({"title":"test"})` and you will insert a new document titled "test" into the "brews" collection, in the Homebrewery database.
- type db.brews.find().pretty() to display a list of the documents in the "brews" collection...you should get one result back, the document you just created.

You can exit out of the mongo shell ('mongosh') by typing `.exit`.  Your Mongo service will still be running in the background.

## Step 5: Set Environment Variables
This step allows Homebrewery to work offline.

- first check to see if the env variable is already set, type in the terminal: `echo $NODE_ENV`...we are looking to find if "local" is the result...likely nothing will appear.
- 


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
h. [MoncefBelyamani - Which shell am I using?](https://www.moncefbelyamani.com/which-shell-am-i-using-how-can-i-switch/)
i. [TechPP - Setting $PATH variable in MacOS](https://techpp.com/2021/09/08/set-path-variable-in-macos-guide/)

## Glossary
- package manager: manages the installation and updates of 'packages' such as utility programs like Homebrew and NodeJS, or more familiar programs like Firefox or Chrome.