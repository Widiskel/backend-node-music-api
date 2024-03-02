# OPEN MUSIC API

Open music api created using node js and postgre SQL as db that served using docker.

## Instruction
- Clone project and ```cd``` into it
- run ```npm install```
- run ```docker compose up``` to deploy db service on docker container
- run ```cp .env.backup .env```
- if any error adjust the ```.env```
- run ```npm run migrate``` to migrate the db
- run ```npm run start``` to start the back end service