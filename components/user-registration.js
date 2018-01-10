const Debug = require('debug')('botkit:user_registration')

module.exports = function userRegistration (controller) {
  /* Handle event caused by a user logging in with oauth */
  controller.on('oauth:success', (payload) => {
    Debug('Got a successful login!', payload)

    if (!payload.identity.team_id) {
      Debug('Error: received an oauth response without a team id', payload)
    }

    controller.storage.teams.get(payload.identity.team_id, (err, team) => {
      if (err) {
        Debug('Error: could not load team from storage system:', payload.identity.team_id, err)
      }

      let newTeam = false

      if (!team) {
        team = { // eslint-disable-line
          id: payload.identity.team_id,
          createdBy: payload.identity.user_id,
          url: payload.identity.url,
          name: payload.identity.team
        }

        newTeam = true
      }

      team.bot = { // eslint-disable-line
        token: payload.bot.bot_access_token,
        user_id: payload.bot.bot_user_id,
        createdBy: payload.identity.user_id,
        app_token: payload.access_token
      }

      const TestBot = controller.spawn(team.bot)

      TestBot.api.auth.test({}, (botErr, botAuth) => {
        if (botErr) {
          Debug('Error: could not authenticate bot user', botErr)
        } else {
          team.bot.name = botAuth.user // eslint-disable-line

          // add in info that is expected by Botkit
          TestBot.identity = botAuth

          TestBot.identity.id = botAuth.user_id
          TestBot.identity.name = botAuth.user

          TestBot.team_info = team

          // Replace this with your own database!

          controller.storage.teams.save(team, (saveErr) => {
            if (saveErr) {
              Debug('Error: could not save team record:', err)
            } else if (newTeam) {
              controller.trigger('create_team', [TestBot, team])
            } else {
              controller.trigger('update_team', [TestBot, team])
            }
          })
        }
      })
    })
  })

  controller.on('create_team', (bot, team) => {
    Debug('Team created:', team)

    // Trigger an event that will establish an RTM connection for this bot
    controller.trigger('rtm:start', [bot.config])

    // Trigger an event that will cause this team to receive onboarding messages
    controller.trigger('onboard', [bot, team])
  })

  controller.on('update_team', (bot, team) => {
    Debug('Team updated:', team)

    // Trigger an event that will establish an RTM connection for this bot
    controller.trigger('rtm:start', [bot])
  })
}
