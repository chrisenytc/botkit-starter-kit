module.exports = function help (controller) {
  // This before middleware allows the help command to accept sub-thread names as a parameter
  // so users can say help to get the default thread, but help <subthread> will automatically
  // jump to that subthread (if it exists)
  controller.studio.before('help', (convo, next) => {
    // is there a parameter on the help command?
    // if so, change topic.
    const Matches = convo.source_message.text.match(/^help (.*)/i)

    if (Matches) {
      if (convo.hasThread(Matches[1])) {
        convo.gotoThread(Matches[1])
      }
      next()
    }
  })
}
