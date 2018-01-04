'use strict';

const uuid = require('node-uuid')

const MessageModel = require('../../models').Message

const activeConversations = require('../../models').activeConversations

const { 
  initMessage, 
  extractParticipant,
  extractType,
  extractTimestamp,
  extractError,
  extractText
} = require('./extractFunctions')

// Track API endpoint, POST a new messaging event
function postTrackHandler(req, res) {

  const user = req.user

  const message = initMessage(req.body, req.params.direction)
  .map(msg => extractParticipant(msg))
  .map(msg => extractType(msg))
  .map(msg => extractText(msg))
  .map(msg => extractTimestamp(msg))
  .map(msg => extractError(msg))
  .reduce((prev, msg) => msg)

  console.log(`${message.timestamp.getHours()}:${message.timestamp.getMinutes()}: ${message.text}`)

  if(message instanceof Error) {
    return res.status(400).json({ error: message.toString() })
  }
  else {
    if(message.type === 'echo') {
      return res.status(200).json({ result: `Echo messages are not logged` })
    }
    else if(message.type === 'delivery') {
      // Get outgoing messages that
      // have a timestamp < this message's timestamp
      // have not been delivered
      // exchanged between the authenticated user and the partipant
      // Query the messages based on user.id
      MessageModel.update({
        delivered: true
      }, {
        where: {
          userId: user.get('id'),
          timestamp: {
            $lte: message.timestamp
          },
          participant: message.participant,
          error: null,
          delivered: false,
          direction: 'outgoing'
        }
      })
      .then(response => {
        // console.log(response) // [1]: number of rows updated
        res.status(200).json({ result: `${message.type} message logged` })
      })
      .catch(error => {
        // console.log(error)
        res.status(500).json({ error: message.toString() })
      })
    }
    else if(message.type === 'read') {
      // Get outgoing messages that
      // have a timestamp < this message's timestamp
      // have not been read
      // exchanged between the authenticated user and the partipant
      // Query the messages based on user.id

      MessageModel.update({
        read: true
      }, {
        where: {
          userId: user.get('id'),
          timestamp: {
            $lte: message.timestamp
          },
          participant: message.participant,
          error: null,
          read: false,
          direction: 'outgoing'
        }
      })
      .then(response => {
        // console.log(response) // [1]: number of rows updated
        res.status(200).json({ result: `${message.type} message logged` })
      })
      .catch(error => {
        // console.log(error)
        res.status(500).json({ error: message.toString() })
      })
    }
    else {
      
      const conversation = activeConversations.getConversation(user.get('id'), message.participant)
      if(conversation) {

        conversation.createAMessage(message)
        .then(msg => res.status(200).json({ 
          result: `Message '${message.id}' with type '${message.type}' has been logged` 
        }))
        .catch(error => {
          console.error(error)
          res.status(500).json({ error: error.toString() })
        })

      }
      else {

        user.createConversation({
          participant: message.participant,
          startTimestamp: message.timestamp
        })
        .then(convo => {
          activeConversations.saveConversation(convo)
          return convo.createAMessage(message)
        })
        .then(msg => res.status(200).json({ 
          result: `Message '${message.id}' with type '${message.type}' has been logged` 
        }))
        .catch(error => {
          console.error(error)
          res.status(500).json({ error: error.toString() })
        })

      }
    }
  }
  
}

module.exports = postTrackHandler;