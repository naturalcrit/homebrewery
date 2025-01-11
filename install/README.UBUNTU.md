# Ubuntu Installation Instructions

## Before Installing

These instructions assume that you are installing to a completely new, fresh Ubuntu installation. As such, some steps will not be necessary if you are installing to an existing Ubuntu instance.

## Installation instructions

1. Install Ubuntu.

2. Install wget (`apt install -y wget`). This may already be installed, depending on your exact Ubuntu version.

3. Download the installation script (`wget https://raw.githubusercontent.com/naturalcrit/homebrewery/master/install/ubuntu/install.sh`).

4. Make the downloaded file executable (`chmod +x install.sh`).

5. Run the script (`sudo ./install.sh`). This will automatically download all of the required packages, install both them and HomeBrewery, configure the system and finally start HomeBrewery.

**NOTE:** At this time, the script **ONLY** installs HomeBrewery. It does **NOT** install the NaturalCrit login system, as that is currently a completely separate project.

---

### Testing

These installation instructions have been tested on the following Ubuntu releases:

  - *ubuntu-24.04.1-desktop-amd64*
  - *ubuntu-22.04.5-desktop-amd64*
  - *ubuntu-20.04.6-desktop-amd64*

## Final Notes

While this installation process works successfully at the time of writing (December 19, 2021), it relies on all of the Node.JS packages used in the HomeBrewery project retaining their cross-platform capabilities to continue to function. This is one of the inherent advantages of Node.JS, but it is by no means guaranteed and as such, functionality or even installation may fail without warning at some point in the future.

Earlier versions of Ubuntu may requier an alternate Mongo setup, see https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/ for assistance.

Regards,  
G  
December 19, 2021
