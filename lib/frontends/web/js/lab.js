var Vue = require("vue");

var sockets = require("./lib/sockets.js");
var socket = sockets.connect();

var main_header = require('./components/main-header.vue');
var open_lab_modal = require('./components/open-lab-modal.vue');
var status_bar = require('./components/status-bar.vue');

var messaging_client = require("./lib/messaging_client")(socket);
var lab_client = require("./lib/lab_client")(socket);




// Register components
Vue.component('main-header', main_header);
Vue.component('open-lab-modal', open_lab_modal);
Vue.component('status-bar', status_bar);

new Vue({
  el: 'main',
  data: {
    open_lab_model_open: false
  },
  watch: {
    
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


    var diagram = require("./lib/diagram")('diagram-display');

    diagram.set_on_contextmenu(function(){});
    diagram.set_on_deselect(function(){});
    diagram.set_on_click(function(){});

    diagram.add_server("Server 1", "test1", 150, 150, function(error, result) {
        diagram.add_switch("Switch 1", "test2", 250, 250, function(error, result) {
          diagram.connect_items("test1", "test2", function(error, result) {
            diagram.add_router("Router 1", "test3", 150, 250, function(error, result) {
              diagram.connect_items("test3", "test2", function(error, result) {

              });
            });

          });
        });
      });
    
  },
  computed: {
    
  }
});
