'use strict'

const messages = require('./lib/messages.json')

const config = require('./config')
const db = require('./models')

const UserModel = db.User
const TokenModel = db.Token
const ConversationModel = db.Conversation
const MessageModel = db.Message

const convoArray = []

db.sequelize.sync(config.dbOptions).then( () => {

    messages.map(message => {
      return ({
          participant: message.participant,
          type: 'text',
          direction: null,
          timestamp: new Date(message.timestamp),
          text: message.text,
          error: null,
          delivered: true,
          read: true,
          message: null,
          response: null
        })
      })
    .map(msg => saveMessage(msg))

    convoArray.map(convo => console.log('message length', convo.messages.length))

    convoArray.map(conversation => {
      if(conversation.endTimestamp === null) {
        conversation.endTimestamp = conversation.lastMessageTimestamp
      }
      
      ConversationModel.create({
        participant: conversation.participant,
        startTimestamp: conversation.startTimestamp,
        endTimestamp: conversation.endTimestamp,
        display: false,
      })
      .then(convo => 
        conversation.messages.map(msg => convo.createMessage(msg)))
      .catch(console.error)
    })

    console.log('length', convoArray.length)
    console.log('message num', (convoArray.reduce((acc, curr) => acc + curr.messages.length, 0)))

})

function saveMessage(message) {
  // console.log(convoArray)

  const conversationIndex = convoArray.findIndex(convo => {
    return convo.participant === message.participant &&
           convo.endTimestamp === null
  });

  if(conversationIndex > -1) {
    const lastMessageTimestamp = convoArray[conversationIndex].lastMessageTimestamp
    
    const timeDiff = Math.abs(message.timestamp - lastMessageTimestamp)
    if( Math.floor( ((timeDiff / 1000) / 60 )) > 30 ) {

      convoArray[conversationIndex].endTimestamp = lastMessageTimestamp
      createNewConvoAndMessage(message)
    }
    else {
      convoArray[conversationIndex].messages.push(message)
      convoArray[conversationIndex].lastMessageTimestamp = message.timestamp
    }
  }
  else {
    createNewConvoAndMessage(message)
  }
}

function createNewConvoAndMessage(message) {
  
  const convoIndex = convoArray.push({
    participant: message.participant,
    startTimestamp: message.timestamp,
    endTimestamp: null,
    lastMessageTimestamp: message.timestamp,
    messages: []
  })

  convoArray[convoIndex-1].messages.push(message)
}