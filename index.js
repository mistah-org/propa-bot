const dotenv = require("dotenv")
const es = require("event-stream")
const steem = require("steem")
const dsteem = require("dsteem")
const steemFx = require ("./steem")

// Environment Init
dotenv.config()
if (!process.env.ACCOUNT || !process.env.POSTING_KEY) throw new Error('ENV variable missing')

let POSTING_KEY = process.env.POSTING_KEY
let ACCOUNT = process.env.ACCOUNT
let SIMULATE_ONLY = (process.env.SIMULATE_ONLY === "true")
let TAGS = process.env.TAGS
let targetTags = TAGS.split(',').map(function(item) {
  return item.trim();
})
console.log('checking for tags: ', targetTags)

// Steem Init
const client = new dsteem.Client('https://api.steemit.com')
let key = dsteem.PrivateKey.from(POSTING_KEY)

steem.api.streamTransactions(async function (err, transaction) {

  if (!transaction || !transaction.operations) return

  const operation = transaction.operations[0]
  const isCommentTx = (operation[0] === 'comment')

  const txData = operation[1]
  const isRootPost = (isCommentTx && txData.parent_author === '')

  // Limit to root posts only
  if (!isRootPost) return

  // get post data
  let postAuthor = txData.author
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
  let containsSpTags = false
  if (postTags) {
    let i;
    for (i = 0; i < targetTags.length; i++) {
      if (postTags.indexOf(targetTags[i]) >= 0) {
        console.log('targetTags[i]', targetTags[i])
        containsSpTags = true
        break;
      }
    }
  }

  console.log('contains any of specified tags: ', containsSpTags)
  if (!containsSpTags) return

  console.log('author: ', postAuthor)
  console.log('permlink: ', permlink)

  if (SIMULATE_ONLY) {
    console.log('simulation only...')
    console.log('sending memos to post author: ', postAuthor)
  } else {
    console.log('sending memo...')
    // Send Comment
    steemFx.send_memo(client, key, postAuthor, ACCOUNT)
    .then(() => {
      console.error("Transfer done.")
    }).catch(() => {
      console.error("Couldn't transfer")
    })
  }

});
