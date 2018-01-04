'use strict'

const _ = require('underscore')

function ConversationArray() {
  const _conversations = {}

  const toString = () => 
    _.keys(_conversations).map( participantId => _.flatten([ participantId, _.values(_conversations[participantId]) ]) )

  const endConversation = participantId => {

    delete _conversations[participantId]
  }

  const saveConversation = (convo, lastMessageTimestamp) => {
    const participantId = convo.get('participant')

    _conversations[participantId] = {
      instance: convo,
      lastMessageTimestamp
    }

    return _conversations[participantId].instance
  }

  const getConversation = participantId => {

    const conversation = _conversations[participantId]

    if(conversation) {
      return conversation
    }
    else {
      return null
    }
  }

  return ({
    getConversation,
    saveConversation,
    endConversation,
    toString
  })
}

module.exports = ConversationArray