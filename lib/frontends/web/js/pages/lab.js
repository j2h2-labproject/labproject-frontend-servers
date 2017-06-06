var Vue = require("vue");

var sockets = require("../lib/sockets.js");
var socket = sockets.connect();

var messaging_client = require("../clients/messaging_client")(socket);
var lab_client = require("../clients/lab_client")(socket);

// Register components
Vue.component('main-header', require('../components/main-header.vue'));
Vue.component('open-lab-modal', require('../components/open-lab-modal.vue'));
Vue.component('status-bar', require('../components/status-bar.vue'));
Vue.component('page-notice', require('../components/page-notice.vue'));
Vue.component('lab-context-menu', require('../components/lab-context-menu.vue'));
Vue.component('confirm-modal', require('../components/confirm-modal.vue'));

new Vue({
  el: 'main',
  data: {
    modal: {
      is_open: false
    },
    notice: {
      is_visible: false,
      contents: "",
      class: ""
    },
    contextmenu: {
      is_visible: false,
      locX: 0,
      locY: 0,
      on_close: function() {}
    },
    lab: {
      state: "unknown",
      info: {
        id: "",
        name: "",
        owner: ""
      },
      client: lab_client
    },
    messaging: messaging_client,
    diagram: null
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

    self.diagram = require("../lib/diagram")('diagram-display');

    self.diagram.set_on_contextmenu(function(event, object, x, y){
      self.contextmenu.locX = x;
      self.contextmenu.locY = y;
      self.contextmenu.is_visible = true;
      self.contextmenu.on_close = function(result) {
        self.contextmenu.is_visible = false;
      };
    });
    self.diagram.set_on_deselect(function(){
      self.contextmenu.is_visible = false;
    });
    self.diagram.set_on_click(function(){
      self.contextmenu.is_visible = false;
    });
    self.diagram.set_on_change(function(event){
      console.log(event);

      if (event.target !== undefined) {
        console.log(event.target.id, event.target.left, event.target.top)
      }
      // console.log(JSON.stringify(diagram.save()))
    });

    // Get lab id

    var lab_id_split = location.search.split('lab_id=');

    if (lab_id_split.length > 1) {
      self.lab.info.id = lab_id_split[lab_id_split.length - 1].split("&")[0];

      self.notice.contents = "Opening lab";
      self.notice.is_visible = true;
      self.notice.class = "notice";

      lab_client.open_lab(self.lab.info.id, function(error, data) {
        if (error != null) {
          self.notice.contents = "Unable to open lab: ";
          self.notice.class = "error";
        } else {
          self.notice.contents = "Lab loaded...";
          self.notice.class = "success";
          
          
          self.lab.info.name = data.name;
          self.lab.info.owner = data.owner;
          if (data.running === true) {
            self.lab.state = "Running";
          } else {
            self.lab.state = "Stopped";
          }

          self.diagram.load(data.diagram.objects, data.diagram.connections, function(error, result) {

            setTimeout(function(){
              self.notice.is_visible = false;
            }, 2000);
          });

        }
      });

    } else {
      
    }

    // lab_client.open_lab()

    // diagram.add_server("Server 1", "test1", 150, 150, function(error, result) {
    //     diagram.add_switch("Switch 1", "test2", 250, 250, function(error, result) {
    //       diagram.connect_items("test1", "test2", function(error, result) {
    //         diagram.add_desktop("Desktop 1", "test3", 150, 250, function(error, result) {
    //           diagram.connect_items("test3", "test2", function(error, result) {
                
    //             diagram.add_desktop("Desktop 2", "test4", 250, 350, function(error, result) {
    //               diagram.connect_items("test4", "test2", function(error, result) {
                    
    //               });
    //             });

    //           });
    //         });

    //       });
    //     });
    //   });
    
  },
  computed: {
    
  }
});
