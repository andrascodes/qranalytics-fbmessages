'use strict'

const Sequelize = require('sequelize')
const fetch = require('node-fetch')
const co = require('co')
const db = new Sequelize('postgres://localhost:5432/fbmessages')

const TempMessage = db.define('tempMessage', {

  messageId: Sequelize.STRING,

  participant: Sequelize.STRING,

  timestamp: Sequelize.DATE,

  text: Sequelize.TEXT,

})

const Conversation = db.define('conversation', {

  conversationId: Sequelize.STRING,

  participant: Sequelize.STRING,

})

TempMessage.sync({ force: true }).then(function() {
  // get Conversations
  // loop through them
  // get messageIds for all Conversations
  // loop through them create a message for each
  const pageAccessToken = 'EAAd4yVqZCqawBAMOnICzwwdcxI2L4yA0vBIwQVaoZCMDyALJ0ZCSzcd6ePXsNuWp3hiQAEMmgcsfWCpycthd7FBLHoZAVi4QfZAEngFHo0d2LVuC6ESdcQaaNhkPkZARMZBFPUQEtMSYQgpm0rQNNHNsN5CujG02SXoK3iRP4itXUIeC5S10KX6a6XIsawKjHbimOPTx2ZBqTwZDZD'

  Conversation.findAll()
  .then(convos => convos.map(convo => ({ id: convo.conversationId, participant: convo.participant})))
  .then(convos => convos.map(convo => {
    const uri = `https://graph.facebook.com/v2.8/${convo.id}/messages?access_token=${pageAccessToken}`

    return co(function *() {
      function* fetchAll(reqURL, reqOptions) {
        let data = [];
        while(reqURL !== undefined) {
          let res = yield fetch(reqURL, reqOptions);
          res = yield res.json();
          // Error handling...
          if(res.data.length > 0) {
            data = data.concat(res.data);
            reqURL = res.paging.next || undefined;
          } else {
            reqURL = undefined;
          }
        }
        return data;
      }

      const convos = yield fetchAll(uri);
      return convos || null;
    })
    .then(res => {
      console.log(res.length)
      return res
    })
    .then(res => res.map(msg => createTempMessage(msg, convo.participant)))
      // .then(
      //   // resolve
      //   result => done(null, result),
      //   // reject
      //   error => done(error)
      // );

    //  return fetch(uri, options)
    //         .then(res => res.json())
    //         .then(res => {
    //           console.log(res.data.length)
    //           return res
    //         })
    //         .then(res => res.data.map(msg => createTempMessage(msg, convo.participant)))
  }))
  .catch(console.error)

  function createTempMessage(message, participant) {
    return TempMessage.create({
      messageId: message.id,
      timestamp: new Date(message.created_time),
      participant
    })
  }


})