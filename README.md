# Requirements
1. Visual Studio Code is installed
2. Nodejs is installed
3. Python3 is installed
  i. Required python modules (The extension will attempt to install them however may fail, this will affect the capability of VoiceChat):
    `pyaudio
    python-socketio
    pygame
    setuptools
    requests `
4. Ipv6 Connectivity

# Frontend

## Setup with vsix
1. Go to the Extensions view.
2. Click Views and More Actions...
3. Select Install from VSIX...

Please refer here for any further questions: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#packaging-extensions

## Setup without vsix
1. Download this repository and go into the SDCT folder
2. Run 'npm install'
3. Run 'npm run compile'
4. Copy SDCT/src/python into the out folder
5. Run 'npm run install:all'
6. Run the extension using the debugger

* If the `npm run compile` does not work please add `"skipLibCheck": true` to tsconfig.json `compilerOptions`

## To package extension as vsix
1. Install vsce(https://code.visualstudio.com/api/working-with-extensions/publishing-extension#packaging-extensions)
2. Run 'vsce package'

# Backend

## Requirements
1. This setup requires the previous installation of docker.
2. This setup will attempt to install the npm dependencies (This may pose some problems)
3. If using Manual this setup will require the previous installation of Nodejs and Sqlite3
4. Port 8000 and 3000 are available for use.

## Setup
Follow these instructions to setup the SDCT Backend server

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

1. Ip in SDCT is hardcoded to our backend server. This will need to be changed if you want to run your own server.
