const Fs = require('fs')
const Path = require('path')
const Http = require('http')
const Hbs = require('express-hbs')
const Express = require('express')
const BodyParser = require('body-parser')
const CookieParser = require('cookie-parser')
// const Debug = require('debug')('botkit:webserver')

module.exports = function run (controller) {
  const Router = Express()

  Router.use(CookieParser())
  Router.use(BodyParser.json())
  Router.use(BodyParser.urlencoded({ extended: true }))

  // Set up handlebars ready for tabs
  Router.engine('hbs', Hbs.express4({ partialsDir: `${__dirname}/../views/partials` }))
  Router.set('view engine', 'hbs')
  Router.set('views', `${__dirname}/../views/`)

  // Import express middlewares that are present in /components/express_middleware
  const NormalizedPath = Path.join(__dirname, 'middlewares')

  Fs.readdirSync(NormalizedPath).forEach((file) => {
    if (file === '.gitkeep') {
      return null
    }

    return require(`./middlewares/${file}`)(Router, controller) // eslint-disable-line
  })

  Router.use(Express.static('public'))

  const WebServer = Http.createServer(Router)

  WebServer.listen(process.env.PORT || 8000, null, () => {
    // eslint-disable-next-line
    console.log(`WebServer configured and listening at http://localhost:${process.env.PORT}` || 8000)
  })

  // Import all the pre-defined routes that are present in /components/routes
  // eslint-disable-next-line
  const NormalizedRoutePath = require('path').join(__dirname, 'routes')

  Fs.readdirSync(NormalizedRoutePath).forEach(file =>
    // eslint-disable-next-line
     require(`./routes/${file}`)(Router, controller))

  controller.webserver = Router // eslint-disable-line
  controller.httpserver = WebServer // eslint-disable-line

  return Router
}
