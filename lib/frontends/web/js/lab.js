var Vue = require("vue");

var sockets = require("./lib/sockets.js");
var socket = sockets.connect();

var main_header = require('./components/main-header.vue');
var open_lab_modal = require('./components/open-lab-modal.vue');
var status_bar = require('./components/status-bar.vue');
var page_notice = require('./components/page-notice.vue');

var messaging_client = require("./lib/messaging_client")(socket);
var lab_client = require("./lib/lab_client")(socket);


// Register components
Vue.component('main-header', main_header);
Vue.component('open-lab-modal', open_lab_modal);
Vue.component('status-bar', status_bar);
Vue.component('page-notice', page_notice);

new Vue({
  el: 'main',
  data: {
    open_lab_model_open: false,
    is_notice_visible: false,
    notice_contents: "",
    notice_class: ""
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
    diagram.set_on_change(function(){
      // console.log(JSON.stringify(diagram.save()))
    });

    // Get lab id

    var lab_id_split = location.search.split('lab_id=');

    if (lab_id_split.length > 1) {
      var lab_id_value = lab_id_split[lab_id_split.length - 1].split("&")[0];
      console.log(lab_id_value);
      self.notice_contents = "Opening lab";
      self.is_notice_visible = true;
      self.notice_class = "info";
    } else {
      
    }

    // lab_client.open_lab()

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
