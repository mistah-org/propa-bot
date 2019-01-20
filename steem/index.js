const es = require("event-stream")
const steem = require("steem")
const dsteem = require("dsteem")

const memo_template = `Quiero ayudar a todos los hispanohablantes a votar su comentario. Tengo más de 23,000 Steem Power, no era mucho, pero tal vez mis votos tengan algún significado para alguien.

 Lo que debe hacer es...
1. Mire el video tema del día publicado en www.steemit.com/@fatimajunio

2. Haga un comentario como un reflejo de lo que comprende

3. Si puede hacer un comentario de video sobre el tema es mejor para recibir votos más grandes. Puedes usar @dtube o youtube o @dsound.

Te invito a unirte también a nuestro chat Discord.
https://discord.gg/vzHFNd6
`;

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
) => {
  console.log('sending memo to: ', postAuthor);
    
  const transf = {
    from: bot,
    to: postAuthor,
    amount: '0.001 STEEM',
    memo: memo_template,
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