module.exports = function userJoin (controller) {
  controller.on('user_channel_join,user_group_join', (bot, message) => {
    bot.reply(message, `Welcome, <@${message.user}>`)
  })
}
