const wordfilter = require('wordfilter')

module.exports = function commands (controller) {
  controller.hears(['^say (.*)', '^say'], 'direct_message,direct_mention', (bot, message) => {
    if (message.match[1]) {
      if (!wordfilter.blacklisted(message.match[1])) {
        bot.reply(message, message.match[1])
      } else {
        bot.reply(message, '_sigh_')
      }
    } else {
      bot.reply(message, 'I will repeat whatever you say.')
    }
  })
}
