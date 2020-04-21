# The Homebrewery
The Homebrewery is a tool for making authentic looking [D&D content](https://dnd.wizards.com/products/tabletop-games/rpg-products/rpg_playershandbook) using [Markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet). It is distributed under the terms of the [MIT License](./license).

## Quick Start
The easiest way to get started using the Homebrewery is to use it [on our website](https://homebrewery.naturalcrit.com). The code is open source, so feel free to clone it, tinker with it. If you want to make changes to the code, you can run your own local version for testing by following the installation instructions below.

### Installation
First, install two programs that the Homebrewery requires to run.

1. install [node](https://nodejs.org/en/)
1. install [mongodb](https://www.mongodb.com/)

Second, download a copy of the repository. If you have git you can do so with
```
git clone https://github.com/naturalcrit/homebrewery.git
```

Third, you will need to add the environment variable `NODE_ENV = local` to allow the project to run locally.

You can set this temporarily in your shell of choice:
* Windows Powershell: `$env:NODE_ENV="local"`
* Windows CMD: `set NODE_ENV=local`
* Linux / OSX: `export NODE_ENV=local`

Fourth, you will need to install the program and run it using the two commands:

1. `npm install`
1. `npm start`

You should now be able to go to [http://localhost:8000](http://localhost:8000) in your browser and use the Homebrewery offline.

### Running the application via Docker

Please see the docs here: [README.DOCKER.md](./README.DOCKER.md)

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
