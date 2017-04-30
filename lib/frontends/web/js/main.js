/*
 * main.js
 * 
 * Frontend code for main menu page
 * 
 */
var Vue = require("vue");
var sockets = require("./lib/sockets.js");
var socket = sockets.connect();

var main_header = require('./components/main-header.vue');
var message_list = require('./components/message-list.vue');
var lab_list = require('./components/lab-list.vue');
var open_lab_modal = require('./components/open-lab-modal.vue');

var messaging_client = require("./lib/messaging_client")(socket);
var lab_client = require("./lib/lab_client")(socket);

// Register components
Vue.component('main-header', main_header);
Vue.component('message-list', message_list);
Vue.component('lab-list', lab_list);
Vue.component('open-lab-modal', open_lab_modal);

new Vue({
  el: 'main',
  data: {
      messages: [],
      labs: [],
      open_lab_model_open: false
  },
  watch: {
    messages: function (new_message) {
      $("#messages div.ui.loading").removeClass("loading");
    },
    labs: function (new_message) {
      $("#recent-labs div.ui.loading").removeClass("loading");
    }
  },
  methods: {
    open_open_lab_modal: function(event) {
      this.open_lab_model_open = true;
    },
    close_open_lab_modal: function(event) {
      this.open_lab_model_open = false;
    }
  },
  mounted: function() {
    var self = this;
    messaging_client.get_messages(10, 0, function(error, messages) {
      self.messages = messages;
    });
    lab_client.get_recent_labs(function(error, labs) {
      self.labs = labs;
    });
    

    // $('#messages').popup({
    //   position: 'top left',
    //   on: 'hover',
    //   inline: true,
    //   fluid: true
    // });

    // $('#recent-labs').popup({
    //   position: 'top left',
    //   on: 'hover',
    //   inline: true
    // });

    // $('#other-labs').popup({
    //   position: 'top left',
    //   on: 'hover',
    //   inline: true
    // });
  },
  computed: {
    
  }
});