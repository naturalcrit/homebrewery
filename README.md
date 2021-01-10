# The Homebrewery
The Homebrewery is a tool for making authentic looking [D&D content](https://dnd.wizards.com/products/tabletop-games/rpg-products/rpg_playershandbook) using [Markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet). It is distributed under the terms of the [MIT License](./license).

## Quick Start
The easiest way to get started using the Homebrewery is to use it [on our website](https://homebrewery.naturalcrit.com). The code is open source, so feel free to clone it, tinker with it. If you want to make changes to the code, you can run your own local version for testing by following the installation instructions below.

### Installation
First, install three programs that the Homebrewery requires to run and retrieve updates

1. install [node](https://nodejs.org/en/)
1. install [mongodb](https://www.mongodb.com/try/download/community) (Community version)

    For easiest installation, follow these steps:
    1. In the installer, uncheck the option to run as a service
    1. You can install MongoDB Compass if you want a GUI to view your database documents
    1. Go to the C drive and create a folder called "data"
    1. Inside the "data" folder, create a new folder called "db"
    1. Open a command prompt or other terminal and navigate to your mongodb install folder (c:program files\mongo\server\4.4\bin)
    1. In the command prompt, run "mongod", which will start up your local database server
    1. While MongoD is running, open a second command prompt and navigate to the mongodb install folder
    1. In the second command prompt, run "mongo", which allows you to edit the database
    1. Type `use homebrewery` to create the homebrewery database. You should see `switched to db homebrewery`
    1. Type `db.brews.insert({"title":"test"})` to create a blank document. You should see `WriteResult({ "nInserted" : 1 })`
    1. Search in Windows for "Advanced system settings" and open it
    1. Click "Environment variables", find the "path" variable, and double-click to open it
    1. Click "New" and paste in the path to the mongodb "bin" folder
    1. Click "OK", "OK", "OK" to close all the windows
1. install [git](https://git-scm.com/downloads) (select the option that allows Git to run from the command prompt)

Second, set up the MongoDB database 

Third, download a copy of the repository. Once you have git you can do so with
```
git clone https://github.com/naturalcrit/homebrewery.git
```

Fourth, you will need to add the environment variable `NODE_ENV = local` to allow the project to run locally.

You can set this temporarily in your shell of choice:
* Windows Powershell: `$env:NODE_ENV="local"`
* Windows CMD: `set NODE_ENV=local`
* Linux / OSX: `export NODE_ENV=local`

Fifth, you will need to install the Node dependencies, compile the app, and run it using the two commands:

1. `npm install`
1. `npm start`

You should now be able to go to [http://localhost:8000](http://localhost:8000) in your browser and use the Homebrewery offline.

### Running the application via Docker

Please see the docs here: [README.DOCKER.md](./README.DOCKER.md)

### Running the application on FreeBSD or FreeNAS

Please see the docs here: [README.FreeBSD.md](./README.FREEBSD.md)

### Standalone PHB Stylesheet
If you just want the stylesheet that is generated to make pages look like they are from the Player's Handbook, you will find it in the [phb.standalone.css](./phb.standalone.css) file.

If you are developing locally and would like to generate your own, follow the above steps and then run `npm run phb`.

## Issues, Suggestions, and Bugs
If you run into any issues using The Homebrewery or have suggestions for improvement, please submit an issue [on GitHub](/issues). You can also get help for issues on the subreddit [r/homebrewery](https://www.reddit.com/r/homebrewery)

## Changelog

You can check out the [changelog](./changelog.md).

## License

This project is licensed under the [MIT license](./license). Which means you are free to use The Homebrewery in any way that you want, except for claiming that you made it yourself.

If you wish to sell or in some way gain profit for what's created on this site, it's your responsibility to ensure you have the proper licenses/rights for any images or resources used.
