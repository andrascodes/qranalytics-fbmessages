'use strict'

const Sequelize = require('sequelize')
const fetch = require('node-fetch')
const db = new Sequelize('postgres://localhost:5432/fbmessages')

const TempMessage = db.define('tempMessage', {

  messageId: Sequelize.STRING,

  participant: Sequelize.STRING,

  timestamp: Sequelize.DATE,

  text: Sequelize.TEXT,

})

TempMessage.sync().then(function() {
  // get Conversations
  // loop through them
  // get messageIds for all Conversations
  // loop through them create a message for each
  const pageAccessToken = 'EAAd4yVqZCqawBAHXXuo4BzSxKGVE8d7viq90PNVwOqirZB50yPR6XQLnUauRNZAXt471SGGB5525LJomO6JbGVFyjC1TQrZAOmvE4pIyxHZAwL5sVKOIqyDZBQ06ln1zZAfKEo5NAhFqpU070dyu2GVcXIn06ZBPDIZCbJW9iU47T3GZCuEmraphwvAZCASHRvzexQLgbY5860xZAAZDZD'
  
  TempMessage.findAll({
    where: {
      text: null
    }
  })
  .then(msgs => msgs.map(msg => ({ id: msg.id, messageId: msg.messageId })))
  .then(msgs => msgs.map(message => {
    const uri = `https://graph.facebook.com/v2.8/${message.messageId}/?fields=message,shares&access_token=${pageAccessToken}`

    return fetch(uri)
          .then(res => res.json())
          .then(extractText)
          .then(text => updateTempMessage(message.id, text))
  }))
  .catch(console.error)

  function extractText(msg) {
    if(msg.message != "") {
      return msg.message
    }
    else if(msg.shares && msg.shares.data && msg.shares.data[0].name) {
      console.log(msg.shares.data[0].name)
      return msg.shares.data[0].name
    }
    else {
      return null
    }
  }

  function updateTempMessage(id, text) {
    if(text) {
      return TempMessage.findOne({
        where: {
          id: id,
        }
      })
      .then(msg => msg.update({ text: text }))
    }
    else {
      return
    }
  }


})