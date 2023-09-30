const http = require('http')
const querystring = require('querystring')
const vision = require('@google-cloud/vision')
const credentials = require('./credential.json')
const Discord = require("discord.js")
const { Client, GatewayIntentBits, Partials, DMChannel } = require("discord.js")
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction
  ]
})
// const CLIENT_ID = process.env['DISCORD_CLIENT_ID']
try {
  http.createServer(function(req, res) {
    res.write('OK')
    res.end()
  }).listen(8080)
  client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
  })

  client.on('messageCreate', async message => {
    if (message.author.bot) return
    console.log('msgCreate')
    const files = message.attachments
    const file = message.attachments.first()
    if (!file) return
    if (!file.height && !file.width) return

    const isDM = message.channel instanceof DMChannel
    if (!isDM) {
      var loading = await message.react('💬')
    }

    const visionclient = new vision.ImageAnnotatorClient({ credentials })
    var reply = ''
    for (const attachment of files) {
      const ImageURL = attachment[1].proxyURL
      const [result] = await visionclient.textDetection(ImageURL)
      // console.log(result)
      let text = ''
      try {
        text = result.textAnnotations[0].description
      } catch {
        text = ''
      } finally {
        reply += text + '\n\n'
      }
    }
    if (!isDM) {
      loading.remove()
    }
    try {
      await message.reply(reply)
      var done = await message.react('✅')
    } catch {
      var error = await message.react('😰')
    }
  })
  const token = process.env['DISCORD_TOKEN']
  client.login(token)
} catch (e) {
  console.log(e)
}
