const dotenv = require("dotenv")
const es = require("event-stream")
const steem = require("steem")
const dsteem = require("dsteem")
const steemFx = require ("./steem")
const constants = require ("./constants")

// Environment Init
dotenv.config()
if (!process.env.ACCOUNT || !process.env.POSTING_KEY
  || !process.env.TAGS || !process.env.TEMPLATE_LANGUAGE) {
  throw new Error('ENV variable missing')
}

let POSTING_KEY = process.env.POSTING_KEY
let ACCOUNT = process.env.ACCOUNT
let SIMULATE_ONLY = (process.env.SIMULATE_ONLY === "true")
let TEMPLATE_LANGUAGE = process.env.TEMPLATE_LANGUAGE.trim()
let TAGS = process.env.TAGS
let targetTags = TAGS.split(',').map(function(item) {
  return item.trim();
})
console.log('checking for tags: ', targetTags)

// Steem Init
const client = new dsteem.Client('https://api.steemit.com')
let key = dsteem.PrivateKey.from(POSTING_KEY)

const mongoose = require('mongoose')
let AccountModel = require('./models/account')

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
mongoose.Promise = global.Promise
mongoose.connection
  .on('connected', () => {
  
    console.log('Mongoose connection open...');
    steem.api.streamTransactions(async function (err, transaction) {

      if (!transaction || !transaction.operations) return

      const operation = transaction.operations[0]
      const isCommentTx = (operation[0] === 'comment')

      const txData = operation[1]
      const isRootPost = (isCommentTx && txData.parent_author === '')

      // Limit to root posts only
      if (!isRootPost) return

      // is author in exclude list?
      let postAuthor = txData.author
      let isExcludeAuthor = constants.exempt_list.indexOf(postAuthor) >= 0
      let isSelf = (postAuthor === ACCOUNT)
      if (isExcludeAuthor || isSelf) return

      // get post data
      let permlink = txData.permlink
      let post = await steemFx.getPostData(postAuthor, permlink).catch(() =>
        console.error("Couldn't fetch post data with SteemJS")
      )

      // get tags
      let postTags
      try {
        postTags = JSON.parse(post.json_metadata).tags
      } catch (e) {
        console.error('Invalid root tags')
        return
      }

      // Check if contains spanish tags
      let containsTargetTag = false
      if (postTags) {
        let i;
        for (i = 0; i < targetTags.length; i++) {
          if (postTags.indexOf(targetTags[i]) >= 0) {
            containsTargetTag = true
            break;
          }
        }
      }
      if (!containsTargetTag) return

      console.log('author: ', postAuthor)
      console.log('permlink: ', permlink)

      let account = await AccountModel.find({
          account: postAuthor
        })
      if (account.length) return

      let msg = new AccountModel({
        account: postAuthor
      })
      let result = await msg.save()
      console.log('saved', result)

      if (SIMULATE_ONLY) {
        console.log('simulation only...')
        console.log('sending memo to post author: ', postAuthor)

      } else {
        console.log('sending memo...')
        // Send Comment
        steemFx.send_memo(client, key, postAuthor, ACCOUNT, TEMPLATE_LANGUAGE)
        .then(() => {
          console.error("Transfer done.")
        }).catch(() => {
          console.error("Couldn't transfer")
        })

      }

    });

  })  // end: mongo.connection on:connected
  .on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
  })  // end: mongo.connection on:error