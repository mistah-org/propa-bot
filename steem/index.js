const es = require("event-stream")
const steem = require("steem")
const dsteem = require("dsteem")
const memo = require("../memo")
const comment = require("../comment")

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

exports.post_comment = async (
  client,
  key,
  postAuthor,
  parent_permlink,
  bot,
  lang,
) => {
  console.log('sending memo to: ', postAuthor);
  console.log('memo template language: ', lang);

  //generate random permanent link for post
  const permlink = Math.random()
      .toString(36)
      .substring(2);

  const payload = {
    author: bot,
    title: '',
    body: comment.templates[lang],
    parent_author: postAuthor,
    parent_permlink: parent_permlink,
    permlink: permlink,
    json_metadata: '',
  };

  await client.broadcast
    .comment(payload, key)
    .then(
      function(result) {
        console.log('Included in block: ' + result.block_num)
        console.log(`Commented on @${postAuthor}/${permlink}`)
      },
      function(error) {
        console.error(error)
        throw error
      }
    )
  return
}