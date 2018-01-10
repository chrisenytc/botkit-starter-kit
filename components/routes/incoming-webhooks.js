const Debug = require('debug')('botkit:incoming-webhooks')

module.exports = function incomingWebHooks (webserver, controller) {
  Debug('Configured /slack/receive url')

  webserver.post('/slack/receive', (req, res) => {
    // NOTE: we should enforce the token check here

    // respond to Slack that the webhook has been received.
    res.status(200)

    // Now, pass the webhook into be processed
    return controller.handleWebhookPayload(req, res)
  })
}
