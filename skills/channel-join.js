const Debug = require('debug')('botkit:channel-join')

module.exports = function channelJoin (controller) {
  controller.on('bot_channel_join', (bot, message) => {
    controller.studio.run(bot, 'channel_join', message.user, message.channel, message).catch((err) => {
      Debug('Error: encountered an error loading onboarding script from Botkit Studio:', err)
    })
  })
}
