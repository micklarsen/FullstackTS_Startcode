# Fullstack TS / Express startcode

1. Clone the project
2. Create your own .env file in the root (Example provided below)
3. Run `npm install`
4. Run `ts-node src/utils/makeTestFriend.ts` to create test users in DB
4. Run for development with `npm run dev` or `npm run dev:debug`
6. Have fun 🍻

```
# ** UNCOMMENT THIS WHEN DEPLOYED **
#NODE_ENV=production


# ** NETWORKING **
PORT=3001


# ** DATABASE CONNECTION **
CONNECTION=YOUR_(MONGO)_DATABASE_CONNECTION_STRING

DB_NAME=YOUR_DATABASE_NAME


# ** DEBUG / DEVELOPMENT **
DEBUG=www,app, makeTestFriend, FriendRoutesAuth


# CAREFUL WITH THIS ONE - USED FOR DEVELOPMENT
SKIP_AUTHENTICATION=1

```