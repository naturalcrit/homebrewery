# Windows Installation Instructions

## Before Installing

These instructions assume that you are installing to a completely new, fresh Windows 10 installation. As such, some steps may not be necessary if you are installing to an existing Windows 10 instance.

## Installation instructions

1. Download the installation script from https://raw.githubusercontent.com/naturalcrit/homebrewery/master/install/windows/install.ps1.

2. Run Powershell as an Administrator.
  a. Click the Start menu or press the Windows key.
  b. Type `powershell` into the Search box.
  c. Right click on the Powershell app and select "Run As Administrator".
  d. Click YES in the prompt that appears.

3. Change the script execution policy.
  a. Run the Powershell command `Set-ExecutionPolicy Bypass -Scope Process`.
  b. Allow the change to be made - press Y at the prompt that appears.

4. Run the installation script.
  a. Navigate to the location of the script, e.g. `cd C:\Users\ExampleUser\Downloads`.
  b. Start the script - `.\install.ps1`

5. Once the script has completed, it will start the Homebrewery server. This will normally cause a Network Access prompt for NodeJS - if this appears, click "Allow".

**NOTE:** At this time, the script **ONLY** installs HomeBrewery. It does **NOT** install the NaturalCrit login system, as that is currently a completely separate project.

---

### Testing

These installation instructions have been tested on the following Ubuntu releases:

- *Windows 10 Home - OS Build 19045.2546*

## Final Notes

While this installation process works successfully at the time of writing (January 23, 2023), it relies on all of the Node.JS packages used in the HomeBrewery project retaining their cross-platform capabilities to continue to function. This is one of the inherent advantages of Node.JS, but it is by no means guaranteed and as such, functionality or even installation may fail without warning at some point in the future.

Regards,  
G  
January 23, 2023
