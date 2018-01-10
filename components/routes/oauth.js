const Debug = require('debug')('botkit:oauth')

module.exports = function oauth (webserver, controller) {
  const Handler = {
    login (req, res) {
      res.redirect(controller.getAuthorizeURL())
    },
    oauth (req, res) {
      const { code, state } = req.query // eslint-disable-line

      // We need to use the Slack API, so spawn a generic bot with no token
      const Slack = controller.spawn({})

      const opts = {
        client_id: controller.config.clientId,
        client_secret: controller.config.clientSecret,
        code
      }

      Slack.api.oauth.access(opts, (err, auth) => {
        if (err) {
          Debug('Error confirming oauth', err)
          return res.redirect('/login_error.html')
        }

        // What scopes did we get approved for?
        const Scopes = auth.scope.split(/,/) // eslint-disable-line

        // Use the token we got from the oauth
        // to call auth.test to make sure the token is valid
        // but also so that we reliably have the team_id field!
        return Slack.api.auth.test({ token: auth.access_token }, (errAuth, identity) => {
          if (errAuth) {
            Debug('Error fetching user identity', err)
            return res.redirect('/login_error.html')
          }

          // Now we've got all we need to connect to this user's team
          // spin up a bot instance, and start being useful!
          // We just need to make sure this information is stored somewhere
          // and handled with care!

          // In order to do this in the most flexible way, we fire
          // a botkit event here with the payload so it can be handled
          // by the developer without meddling with the actual oauth route.

          auth.identity = identity // eslint-disable-line
          controller.trigger('oauth:success', [auth])

          res.cookie('team_id', auth.team_id)
          res.cookie('bot_user_id', auth.bot.bot_user_id)
          return res.redirect('/login_success.html')
        })
      })
    }
  }


  // Create a /login link
  // This link will send user's off to Slack to authorize the app
  // See: https://github.com/howdyai/botkit/blob/master/readme-slack.md#custom-auth-flows
  Debug('Configured /login url')
  webserver.get('/login', Handler.login)

  // Create a /oauth link
  // This is the link that receives the postback from Slack's oauth system
  // So in Slack's config, under oauth redirect urls,
  // your value should be https://<my custom domain or IP>/oauth
  Debug('Configured /oauth url')
  webserver.get('/oauth', Handler.oauth)

  return Handler
}
