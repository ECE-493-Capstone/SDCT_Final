# Requirements
1. Visual Studio Code is installed
2. Nodejs is installed
3. Python3 is installed
   Required python modules (The extension will attempt to install them however may fail, this will affect the capability of VoiceChat):
    `pyaudio
    python-socketio
    pygame
    setuptools
    requests `
4. IPv6 Connectivity

# Frontend

## Setup with vsix
1. Go to the Extensions view.
2. Click Views and More Actions...
3. Select Install from VSIX...
4. Select the vsix in the SDCT folder

Please refer here for any further questions: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#packaging-extensions

## Setup without vsix
1. Download this repository and go into the SDCT folder
2. npm install typescript -g
3. Run 'npm install'
4. Run 'npm run compile'
5. Copy SDCT/src/python into the out folder
6. Run 'npm run install:all'
7. Run the extension using the debugger

* If the `npm run compile` does not work please add `"skipLibCheck": true` to tsconfig.json `compilerOptions`

## To package extension as vsix
1. Install vsce(https://code.visualstudio.com/api/working-with-extensions/publishing-extension#packaging-extensions)
2. Run 'vsce package'

## User Guide
Refer to the videos in the 'User_Guide' folder for a tutorial of all the functionalities.

# Backend

## Requirements
1. This setup requires docker to be installed.
2. This setup will attempt to install the npm dependencies (This may pose some problems)
3. If using Manual setup it will require the previous installation of Nodejs and Sqlite3
4. Port 8000 and 3000 are available for use.

## Setup
Follow these instructions to setup the SDCT Backend server. This is not required as there is already a instance running.

### Using Docker
1. Download this repository and go into the SDCT_Backend folder
2. Create 2 folders named `upload` and `codeSessions`
3. Run the database creator using `sudo bash dbSetup.sh`
4. Run `sudo docker build -t sdct_app .` to create the docker image
5. Run `sudo docker run -dp 8000:8000 -p 3000:3000 sdct_app` to create the docker container
6. Ready to Go

### Manual
1. Download this repository and go into the SDCT_Backend folder
2. Create 2 folders named `upload` and `codeSessions`
3. Run the database creator using `sudo bash dbSetup.sh`
4. Run `npm install`
5. Run `npm run start`
6. Ready to Go

# Limitations

1. IP in SDCT is hardcoded to our backend server. This will need to be changed if you want to run your own server.

# Known Bugs
1. Empty Messages will be sent and saved but not shown
2. Mp4 files will not play audio
3. Can add non-GitHub users
4. The whiteboard is capable of multiple users; however, it works best when only one user is drawing at a time.
5. The App may cause duplicate messages to appear if the backend has been restarted. This can be resolved by restarting VS Code.
6. The System will not delete the transferred code session files from participant machines.
7. File Editing is limited by VSCode Api and will sometimes not be perfectly synced. This is best fixed by typing slowly.

