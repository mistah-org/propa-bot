## How to use it

Create a `.env` to store your posting key, username, and other configurations.

```
ACCOUNT=STEEM_NAME
POSTING_KEY=POSTING_KEY_HERE
SIMULATE_ONLY=false
TAGS=testing
```

Change variables in `config.ts`

Starting the server for development `npm run dev`
> I did not use babel or any minify work flow

For production, I would suggest using PM2 Library. (Install with `npm install -g pm2`)

Then, run `pm2 start dist/index.js`
