var Vue = require("vue");
var sockets = require("../lib/sockets.js");
var socket = sockets.connect();


var messaging_client = require("../clients/messaging_client")(socket);
var lab_client = require("../clients/lab_client")(socket);
var user_client = require("../clients/user_client")(socket);

// Register components
Vue.component('main-header', require('../components/main-header.vue'));
Vue.component('profile-view', require('../components/manage-view/profile-view.vue'));
Vue.component('about', require('../components/manage-view/about.vue'));
Vue.component('virtual-machines-view', require('../components/manage-view/virtual-machines-view.vue'));

new Vue({
  el: 'main',
  data: {
      user_client: user_client,
      active: ""
  },
  watch: {
    
  },
  methods: {
  },
  mounted: function() {
    var self = this;
    self.active = "profile";
  },
  computed: {
      
  }
});
