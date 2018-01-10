const Debug = require('debug')('botkit:rtm_manager')

module.exports = function rtmManager (controller) {
  const ManagedBots = {}

  // The manager object exposes some useful tools for managing the RTM
  const Manager = {
    start (bot) {
      if (ManagedBots[bot.config.token]) {
        Debug('Start RTM: already online')
      } else {
        bot.startRTM((err, botInstance) => {
          if (err) {
            Debug('Error starting RTM:', err)
          } else {
            ManagedBots[botInstance.config.token] = botInstance.rtm
            Debug('Start RTM: Success')
          }
        })
      }
    },
    stop (bot) {
      if (ManagedBots[bot.config.token]) {
        if (ManagedBots[bot.config.token].rtm) {
          Debug('Stop RTM: Stopping bot')
          ManagedBots[bot.config.token].closeRTM()
        }
      }
    },
    remove (bot) {
      Debug('Removing bot from manager')
      delete ManagedBots[bot.config.token]
    },
    reconnect () {
      Debug('Reconnecting all existing bots...')
      controller.storage.teams.all((err, list) => {
        if (err) {
          throw new Error('Error: Could not load existing bots:', err)
        } else {
          for (let l = 0; l < list.length; l++) { // eslint-disable-line
            Manager.start(controller.spawn(list[l].bot))
          }
        }
      })
    }
  }

  // Capture the rtm:start event and actually start the RTM...
  controller.on('rtm:start', (config) => {
    Manager.start(controller.spawn(config))
  })

  //
  controller.on('rtm_close', (bot) => {
    Manager.remove(bot)
  })

  return Manager
}
