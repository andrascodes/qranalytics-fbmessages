'use strict'

const Sequelize = require('sequelize')
const fetch = require('node-fetch')
const db = new Sequelize('postgres://localhost:5432/fbmessages')

const Conversation = db.define('conversation', {

  conversationId: Sequelize.STRING,

  participant: Sequelize.STRING,

})

//{ force: true }
Conversation.sync().then(function() {
  // fetch Conversations
  // loop through them
  // create a new convo for each of them
  
  const pageAccessToken = 'EAAd4yVqZCqawBAFmZAizoO9AqXLpU3ouOFZCMgcAvN1JytXUHEJKxTJHLPtuW19d9PVZBkwMqzPvXtWZC2BSiY5UZAVkaAICkP3HWkmXhBOikM2zkQ2djlUvmUgKehstQMhrkjyJFksxwrqvZCLaIcPmYrLk2frk5oEZAgZAnZAWcJcOaHplIQPYEZCP9LaLRM7gZBLza8GU1plNqnhWqWFMUZBdo'
  const uri = `https://graph.facebook.com/v2.8/me/conversations?access_token=${pageAccessToken}&fields=message_count,senders,subject,id&limit=500`

  fetch(uri)
  .then(res => res.json())
  .then(res => res.data.map(createConvo))
  .catch(console.error)

  function createConvo(convo) {
    if(convo.message_count === 918 || convo.message_count === 126 || convo.message_count === 69) {
      return;
    }
    else {
      return Conversation.create({
        conversationId: convo.id,
        participant: convo.senders.data[0].id
      })
      .then(convo => console.log(convo))
      .catch(error => console.error(error))
    }
  }


})