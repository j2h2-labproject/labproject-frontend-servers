var Vue = require("vue");
var sockets = require("./sockets.js");

var main_header = require('./components/main-header.vue');
var message_list = require('./components/message-list.vue');

var socket = sockets.connect();

var messaging_client = require("./lib/messaging_client")(socket);

console.log(messaging_client)

Vue.component('main-header', main_header);
Vue.component('message-list', message_list);

new Vue({
  el: 'main',
  components: { main_header,  message_list },
  data: {
      messages: []
  },
  watch: {
    messages: function (new_message) {
      $("#messages div.ui.loading").removeClass("loading");
    }
  },
  mounted: function() {
    var self = this;
    messaging_client.get_messages(10, 0, function(error, messages) {
      self.messages = messages;
    });

    $('#messages').popup({
      position: 'top left',
      on: 'hover',
      inline: true,
      fluid: true
    });

    $('#recent-labs').popup({
      position: 'top left',
      on: 'hover',
      inline: true
    });

    $('#other-labs').popup({
      position: 'top left',
      on: 'hover',
      inline: true
    });
  },
  computed: {
    
  }
});
