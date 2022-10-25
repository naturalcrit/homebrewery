# FreeBSD/FreeNAS Installation Instructions

## Before Installing

These instructions assume that you are installing to a completely new, fresh FreeBSD/FreeNAS jail. As such, some steps will not be necessary if you are installing to an existing FreeBSD/FreeNAS install.

## Installation instructions

1. Create a new jail, with the appropriate network settings to access the internet.

2. Install wget (`pkg install -y wget`). On a fresh jail, you will be prompted to press 'Y' to set up `pkg`.

3. Download the installation script (`wget --no-check-certificate https://raw.githubusercontent.com/naturalcrit/homebrewery/master/install/freebsd/install.sh`). The parameter `--no-check-certificate` is required as we haven't set up any trusted certificates/authorities yet.

4. Make the downloaded file executable (`chmod +x install.sh`).

5. Run the script (`./install.sh`). This will automatically download all of the required packages, install both them and HomeBrewery, configure the system and finally start HomeBrewery.

**NOTE:** At this time, the script **ONLY** installs HomeBrewery. It does **NOT** install the NaturalCrit login system, as that is currently a completely separate project.

---

### Testing

These installation instructions have been tested on the following FreeBSD/FreeNAS platforms:

* FreeNAS-11.3-U5; Jail 11.4-RELEASE-p2

## Final Notes

While this installation process works successfully at the time of writing (December 28, 2020), it relies on all of the Node.JS packages used in the HomeBrewery project retaining their cross-platform capabilities to continue to function under FreeBSD. This is one of the inherent advantages of Node.JS, but it is by no means guaranteed and as such, functionality or even installation under FreeBSD may fail without warning at some point in the future.

Regards,  
G  
December 28, 2020
