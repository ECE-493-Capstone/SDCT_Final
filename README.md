# Setup
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

1. This setup requires the previous installation of docker.
2. This setup will attempt to install the npm dependencies (This may pose some problems)
3. If using Manual this setup will require the previous installation of Nodejs and Sqlite3
4. Thi
