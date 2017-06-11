/*
 * main.js
 * 
 * Frontend code for main menu page
 * 
 */
var Vue = require("vue");
var sockets = require("../lib/sockets.js");
var socket = sockets.connect();

var main_header = require('../components/main-header.vue');
var message_list = require('../components/lists/message-list.vue');
var lab_list = require('../components/lists/lab-list.vue');
var open_lab_modal = require('../components/modals/open-lab-modal.vue');
var new_lab_modal = require('../components/modals/new-lab-modal.vue');

var messaging_client = require("../clients/messaging_client")(socket);
var lab_client = require("../clients/lab_client")(socket);

// Register components
Vue.component('main-header', main_header);
Vue.component('message-list', message_list);
Vue.component('lab-list', lab_list);
Vue.component('open-lab-modal', open_lab_modal);
Vue.component('new-lab-modal', new_lab_modal);

new Vue({
  el: 'main',
  data: {
      messages: [],
      labs: [],
      new_lab_modal_visible: false,
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
    open_open_lab_modal: function() {
      this.open_lab_model_open = true;
    },
    close_open_lab_modal: function(event) {
      this.open_lab_model_open = false;
    },
    open_new_lab_modal: function() {
      this.new_lab_modal_visible = true;
    },
    close_new_lab_modal: function(lab_name) {
      this.new_lab_modal_visible = false;
      console.log(lab_name)
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
