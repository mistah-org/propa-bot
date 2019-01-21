## How to use it

Create a `.env` to store your posting key, username, and other configurations.

```
ACCOUNT=STEEM_ACCOUNT
MONGODB_URI=mongodb://<dbuser>:<dbpassword>@<host>:<port>/<db>
POSTING_KEY=posting_key_here
SIMULATE_ONLY=true
TAGS=testing
TEMPLATE_LANGUAGE=en
```

Starting the server for development `npm run dev`

For production, I would suggest using PM2 Library. (Install with `npm install -g pm2`)

Then, run `pm2 start index.js`
