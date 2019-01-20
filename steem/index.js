const es = require("event-stream")
const steem = require("steem")
const dsteem = require("dsteem")
const memo = require("../memo")

// This function will get the content of the post
exports.getPostData = async (author, permlink) => {
  let data = await steem.api.getContentAsync(author, permlink)
  return data
}

exports.send_memo = async (
  client,
  key,
  postAuthor,
  bot,
  lang,
) => {
  console.log('sending memo to: ', postAuthor);
  console.log('memo template language: ', lang);

  const transf = {
    from: bot,
    to: postAuthor,
    amount: '0.001 STEEM',
    memo: memo.templates[lang]
  }


  await client.broadcast
    .transfer(transf, key)
    .then(
      function(result) {
        console.log('Included in block: ' + result.block_num)
        console.log(`Transferred to @${postAuthor}`)
      },
      function(error) {
        console.error(error)
        throw error
      }
    )
  return
}