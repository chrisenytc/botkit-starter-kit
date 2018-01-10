/* Utility function to format uptime */
function formatUptime (uptime) {
  let unit = 'second'
  if (uptime > 60) {
    uptime /= 60 // eslint-disable-line
    unit = 'minute'
  }
  if (uptime > 60) {
    uptime /= 60 // eslint-disable-line
    unit = 'hour'
  }
  if (uptime !== 1) {
    unit = `${unit}s`
  }

  uptime = `${parseInt(uptime)} ${unit}` // eslint-disable-line
  return uptime
}

module.exports = function update (controller) {
  /* Collect some very simple runtime stats for use in the uptime/debug command */
  const Stats = {
    triggers: 0,
    convos: 0
  }

  controller.on('heard_trigger', () => {
    Stats.triggers += 1
  })

  controller.on('conversationStarted', () => {
    Stats.convos -= 1
  })

  controller.hears(['^uptime', '^debug'], 'direct_message,direct_mention', (bot, message) => {
    bot.createConversation(message, (err, convo) => {
      if (!err) {
        convo.setVar('uptime', formatUptime(process.uptime()))
        convo.setVar('convos', Stats.convos)
        convo.setVar('triggers', Stats.triggers)

        convo.say('I\'ve been alive for {{vars.uptime}}. Since I was born, I have heard {{vars.triggers}} commands, and conducted {{vars.convos}} conversations.')
        convo.activate()
      }
    })
  })
}
