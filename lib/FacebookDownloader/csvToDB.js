'use strict'

const csv = require('csvtojson')
const db = new Sequelize('postgres://localhost:5432/fbmessages')

const UserModel = require('../../models').User
const TokenModel = require('../../models').Token

const email = 'andrew0szucs@gmail.com'
const password = 'pa$$word'

// Create new User
UserModel.create({ email, password })
.then( user => Promise.all([
  user,
  user.generateToken()
  .then(jwt => TokenModel.create({ token: jwt }))
  .then(token => token.get('token'))
]))
.then(([user, tokenString]) => {
  // do stuff with the messages
  const filePath = `${__dirname}/messages.csv`

})
.catch(console.error)

const messages = []

const convoArray = {}

csv()
.fromFile(filePath)
.on('json', json => {
  console.log(json)
  // { 
  //   participant: '421814124825827',
  //   timestamp: '2016-10-25 03:59:23+02',
  //   text: 'I\'m here to assist you with meetup and chatbot related stuff.' 
  // }
  messages.push(json)
})
.on('done', error => {
  if(error) {
    return console.log(error)
  }
  console.log(messages.length)
})

function saveMessage(json) {

  function getConversation(participantId) {
    function endConversation(conv) {

    }


  }

  const convo = getConversation(json.participant)
  // got a message
    // first message in Convo:
      // create convo, save it in convoArray
      // createMessage inside convo
}