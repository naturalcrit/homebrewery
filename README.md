# The Homebrewery
Create authentic looking D&D homebrews using only markdown. Check it out [here](http://homebrewery.naturalcrit.com).


### Getting started
1. Make sure you have [node](https://nodejs.org/en/)
1. Clone down the repo
1. In your terminal, head to the repo
1. Run `npm install` to get all the dependencies
1. Run `npm run libs`, this will compile and build all the needed libraries (this only has to be done once, unless you add more libs)
1. Run `npm run watch` to run the project locally. Should be accessible at `localhost:8000`
2. Any changes to files within the project will be detected and the project will automatically re-build

**Notes:** If you'd like to create and edit homebrews, you'll need to have MongoDB installed and running.

Have fun!

### Docker Image
You can use [Docker](https://docs.docker.com) to get up and running with NaturalCrit.

1. Install Docker
1. Clone the repo
1. In the terminal, go to the repo
1. Build the docker image `docker build -t naturalcrit .`
1. Run the docker container `docker run -dit -p 8000:8000 naturalcrit`
1. You can check out the website on your computer on port 8000
	1. You may have to use `docker-machine env` to get the IP address of your docker instance


### Changelog

You can check out the changelog [here](https://github.com/stolksdorf/homebrewery/blob/master/changelog.md)

### License

This project is licensed under [MIT](./license)
