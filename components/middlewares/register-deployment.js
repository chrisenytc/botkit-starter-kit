const Request = require('axios')
const Querystring = require('querystring')
const Debug = require('debug')('botkit:register-deployment')

module.exports = function registerDeployment (webserver, controller) {
  let registeredThisSession = false

  controller.registerDeployWithStudio = function registerDeployWithStudio (host) { // eslint-disable-line
    if (!registeredThisSession && controller.config.studio_token) {
      // information about this instance of Botkit
      // send to Botkit Studio in order to display in the hosting tab
      const Instance = {
        url: host,
        version: controller.version(),
        ts: new Date()
      }

      const Opts = {
        baseURL: controller.config.studio_command_uri || 'https://studio.botkit.ai/api/v1',
        params: {
          access_token: controller.config.studio_token
        }
      }

      const Client = Request.create(Opts)

      return Client.post('/bots/phonehome', Querystring.stringify(Instance))
        .then(() => {
          registeredThisSession = true
        })
        .catch((err) => {
          Debug('Error registering instance with Botkit Studio', err)
        })
    }
  }

  if (webserver && controller.config.studio_token) {
    webserver.use((req, res, next) => {
      controller.registerDeployWithStudio(req.get('host'))
      next()
    })
  }
}
