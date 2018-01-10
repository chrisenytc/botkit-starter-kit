const Debug = require('debug')('botkit:onboarding')

module.exports = function onBoarding (controller) {
  controller.on('onboard', (bot) => {
    Debug('Starting an onboarding experience!')

    if (controller.config.studio_token) {
      bot.api.im.open({ user: bot.config.createdBy }, (err, directMessage) => {
        if (err) {
          Debug('Error sending onboarding message:', err)
        } else {
          controller.studio
            .run(bot, 'onboarding', bot.config.createdBy, directMessage.channel.id, directMessage)
            .catch((errPromise) => {
              Debug('Error: encountered an error loading onboarding script from Botkit Studio:', errPromise)
            })
        }
      })
    } else {
      bot.startPrivateConversation({ user: bot.config.createdBy }, (err, convo) => {
        if (err) {
          console.log(err) // eslint-disable-line
        } else {
          convo.say('I am a bot that has just joined your team')
          convo.say('You must now /invite me to a channel so that I can be of use!')
        }
      })
    }
  })
}
