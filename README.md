# The Homebrewery

[![Homebrewery](https://circleci.com/gh/naturalcrit/homebrewery/tree/master.svg?style=svg)](https://app.circleci.com/pipelines/github/naturalcrit/homebrewery?branch=master)

The Homebrewery is a tool for making authentic looking [D&D content][dnd-content-url]
using [Markdown][markdown-url]. It is distributed under the terms of the [MIT License](./license).

[dnd-content-url]: https://dnd.wizards.com/products/tabletop-games/rpg-products/rpg_playershandbook
[markdown-url]: https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet

## Quick Start
The easiest way to get started using The Homebrewery is to use it
[on our website][homebrewery-url]. The code is open source, so feel free to
clone it and tinker with it. If you want to make changes to the code, you can run
your own local version for testing by following the installation instructions
below.

[homebrewery-url]: https://homebrewery.naturalcrit.com

### Installation
First, install three programs that The Homebrewery requires to run and retrieve
updates:

1. install [node](https://nodejs.org/en/)
1. install [mongodb](https://www.mongodb.com/try/download/community) (Community version)

    For the easiest installation, follow these steps:
    1. In the installer, uncheck the option to run as a service.
    1. You can install MongoDB Compass if you want a GUI to view your database documents.
    1. Go to the C:\ drive and create a folder called "data".
    1. Inside the "data" folder, create a new folder called "db".
    1. Open a command prompt or other terminal and navigate to your MongoDB install folder (C:\Program Files\Mongo\Server\4.4\bin).
    1. In the command prompt, run "mongod", which will start up your local database server.
    1. While MongoD is running, open a second command prompt and navigate to the MongoDB install folder.
    1. In the second command prompt, run "mongo", which allows you to edit the database.
    1. Type `use homebrewery` to create The Homebrewery database. You should see `switched to db homebrewery`.
    1. Type `db.brews.insert({"title":"test"})` to create a blank document. You should see `WriteResult({ "nInserted" : 1 })`.
    1. Search in Windows for "Advanced system settings" and open it.
    1. Click "Environment variables", find the "path" variable, and double-click to open it.
    1. Click "New" and paste in the path to the MongoDB "bin" folder.
    1. Click "OK" three times to close all the windows.
1. install [git](https://git-scm.com/downloads) (select the option that allows Git to run from the command prompt).

Checkout the repo ([documentation][github-clone-repo-docs-url]):
```
git clone https://github.com/naturalcrit/homebrewery.git
```

[github-clone-repo-docs-url]: https://docs.github.com/en/free-pro-team@latest/github/creating-cloning-and-archiving-repositories/cloning-a-repository

Second, you will need to add the environment variable `NODE_ENV=local` to allow
the project to run locally.

You can set this temporarily in your shell of choice:
* Windows Powershell: `$env:NODE_ENV="local"`
* Windows CMD: `set NODE_ENV=local`
* Linux / macOS: `export NODE_ENV=local`

Third, you will need to install the Node dependencies, compile the app, and run
it using the two commands:

1. `npm install`
1. `npm start`

You should now be able to go to [http://localhost:8000](http://localhost:8000)
in your browser and use The Homebrewery offline.

### Running the application via Docker

Please see the docs here: [README.DOCKER.md](./README.DOCKER.md)

### Running the application on FreeBSD or FreeNAS

Please see the docs here: [README.FreeBSD.md](./README.FREEBSD.md)

### Standalone PHB Stylesheet
If you just want the stylesheet that is generated to make pages look like they
are from the Player's Handbook, you will find it in the
[phb.standalone.css](./phb.standalone.css) file.

If you are developing locally and would like to generate your own, follow the
above steps and then run `npm run phb`.

## Issues, Suggestions, and Bugs
If you run into any issues using The Homebrewery or have suggestions for
improvement, please submit an issue [on GitHub][repo-issues-url].
You can also get help for issues on the subreddit [r/homebrewery][subreddit-url]

[repo-issues-url]: https://github.com/naturalcrit/homebrewery/issues
[subreddit-url]: https://www.reddit.com/r/homebrewery

## Changelog

You can check out the [changelog](./changelog.md).

## License

This project is licensed under the [MIT license](./license), which means you
are free to use The Homebrewery in any way that you want, except for claiming
that you made it yourself.

If you wish to sell, or in some way gain profit for, what's created on this site,
it's your responsibility to ensure you have the proper licenses/rights for any
images or resources used.

## Contributing

You are welcome to contribute to the development and maintenance of the
project! There are several ways of doing that:
- At the moment, we have a huge backlog of [issues][repo-issues-url] and some
  of them are outdated, duplicates, or don't contain any useful info. To help, you can [mark duplicates][github-mark-duplicate-url], try to
  reproduce some complex or weird issues, try finding a workaround for a
  reported bug, or just mention our issue managers team to let them know about
  outdated issues via `@naturalcrit/issue-managers`.
- Our [subreddit][subreddit-url] is constantly growing and there are number of
  bug reports. Any help with sorting them out is very welcome.
- And of course you can contribute by fixing a bug or implementing a new
  feature by yourself, we are waiting for your
  [pull requests][github-pr-docs-url]!

Anyway, if you would like to get in touch with the team and discuss/coordinate
your contribution to the project, please join our [gitter chat][gitter-url].

[github-mark-duplicate-url]: https://docs.github.com/en/free-pro-team@latest/github/managing-your-work-on-github/about-duplicate-issues-and-pull-requests
[github-pr-docs-url]: https://docs.github.com/en/free-pro-team@latest/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request
[gitter-url]: https://gitter.im/naturalcrit/Lobby
