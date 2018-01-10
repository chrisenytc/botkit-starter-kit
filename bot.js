/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

 * Connect to Slack using the real time API
 * Receive messages based on "spoken" patterns
 * Reply to messages
 * Use the conversation system to ask questions
 * Use the built in storage system to store and retrieve information
  for a user.

# RUN THE BOT:

  Create a new app via the Slack Developer site:

    -> http://api.slack.com/apps

  Configure your environment variables in .env:

    -> nvim .env

  Run your bot from the command line:

    -> make start

# USE THE BOT:

    Navigate to the built-in login page:

    https://<myhost.com>/login

    This will authenticate you with Slack.

    If successful, your bot will come online and greet you.


# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
if (!process.env.SLACK_CLIENT_ID || !process.env.SLACK_CLIENT_SECRET || !process.env.PORT) {
  UsageTip()
  process.exit(1)
}

const Botkit = require('botkit')
const Debug = require('debug')('botkit:main')

const BotOptions = {
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  // debug: true,
  scopes: ['bot'],
  studio_token: process.env.BOTKIT_STUDIO_TOKEN,
  studio_command_uri: process.env.BOTKIT_STUDIO_COMMAND_URI
}

// Use a redis database if specified, otherwise store in a JSON file local to the app.
if (process.env.REDIS_URL) {
  // eslint-disable-next-line
  BotOptions.storage = require('botkit-storage-redis')({
    url: process.env.REDIS_URL,
    namespace: 'Alfred:Storage'
  })
} else {
  BotOptions.json_file_store = `${__dirname}/.data/db/` // Store user data in a simple JSON format
}

// Create the Botkit controller, which controls all instances of the bot.
const Controller = Botkit.slackbot(BotOptions)

Controller.startTicking()

// Set up an Express-powered webserver to expose oauth and webhook endpoints
// eslint-disable-next-line
const WebServer = require(`${__dirname}/components/webserver.js`)(Controller)

WebServer.get('/', (req, res) => {
  res.render('index', {
    domain: req.get('host'),
    protocol: req.protocol,
    layout: 'layouts/default'
  })
})

// Set up RTM manager
// eslint-disable-next-line
require(__dirname + '/components/rtm-manager.js')(Controller)

// Set up a simple storage backend for keeping a record of customers
// who sign up for the app via the oauth
// eslint-disable-next-line
require(__dirname + '/components/user-registration.js')(Controller)

// Send an onboarding message when a new team joins
// eslint-disable-next-line
require(`${__dirname}/components/onboarding.js`)(Controller)

// Loading skills
const NormalizedPath = require('path').join(__dirname, 'skills')
require('fs').readdirSync(NormalizedPath).forEach((file) => {
  // eslint-disable-next-line
  require(`./skills/${file}`)(Controller)
})

// This captures and evaluates any message sent to the bot as a DM
// or sent to the bot in the form "@bot message" and passes it to
// Botkit Studio to evaluate for trigger words and patterns.
// If a trigger is matched, the conversation will automatically fire!
// You can tie into the execution of the script using the functions
// controller.studio.before, controller.studio.after and controller.studio.validate
if (process.env.BOTKIT_STUDIO_TOKEN) {
  Controller.on('direct_message,direct_mention,mention', (bot, message) => {
    Controller.studio.runTrigger(
      bot,
      message.text,
      message.user,
      message.channel,
      message
    ).then((convo) => {
      if (!convo) {
        // no trigger was matched
        // If you want your bot to respond to every message,
        // define a 'fallback' script in Botkit Studio
        // and uncomment the line below.
        // controller.studio.run(bot, 'fallback', message.user, message.channel);
      } else {
        // set variables here that are needed for EVERY script
        // use controller.studio.before('script') to set variables specific to a script
        convo.setVar('current_time', new Date())
      }
    }).catch((err) => {
      bot.reply(message, `I experienced an error with a request to Botkit Studio: ${err}`)
      Debug('Botkit Studio: ', err)
    })
  })
} else {
  Debug('~~~~~~~~~~')
  Debug('NOTE: Botkit Studio functionality has not been enabled')
  Debug('To enable, pass in a environment variable BOTKIT_STUDIO_TOKEN with a token from https://studio.botkit.ai/')
}

function UsageTip () {
  console.log('~~~~~~~~~~') // eslint-disable-line
  console.log('Botkit Starter Kit') // eslint-disable-line
  console.log('Configure your environment variables in .env') // eslint-disable-line
  console.log('Get Slack app credentials here: https://api.slack.com/apps') // eslint-disable-line
  console.log('Get a Botkit Studio token here: https://studio.botkit.ai/') // eslint-disable-line
  console.log('Execute your bot application like this:') // eslint-disable-line
  console.log('$ make start') // eslint-disable-line
  console.log('~~~~~~~~~~') // eslint-disable-line
}
