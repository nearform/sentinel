"use strict";

module.exports = function (options) {
  var seneca = this;
  var name = 'mite-spy-data'

  function appConfig ( msg, respond){
    return respond(null, {someData: true} )
  }

  seneca.add({name: name, get: 'appConfiguration'}, appConfig)
}
