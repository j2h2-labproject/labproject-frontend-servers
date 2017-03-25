var Vue = require("vue");
var sockets = require("./lib/sockets.js");
var socket = sockets.connect();

var main_header = require('./components/main-header.vue');

var messaging_client = require("./lib/messaging_client")(socket);
var lab_client = require("./lib/lab_client")(socket);

// Register components
Vue.component('main-header', main_header);

new Vue({
  el: 'main',
  data: {
      
  },
  watch: {
    
  },
  methods: {
    
  },
  mounted: function() {
    var self = this;
    
  },
  computed: {
    
  }
});
