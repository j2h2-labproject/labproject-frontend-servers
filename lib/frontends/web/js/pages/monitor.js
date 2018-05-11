var Vue = require("vue");
var sockets = require("../lib/sockets.js");
var socket = sockets.connect();

var chartjs = require("chart.js");


var vm_server_client = require("../clients/vm_server_client")(socket);

// Register components
Vue.component('main-header', require('../components/main-header.vue'));


new Vue({
    el: 'main',
    data: {
        vm_server_client: vm_server_client,
        servers: []
    },
    watch: {
        
    },
    methods: {
    },
    // When mounted
    mounted: function() {
        console.log("Monitoring");
        var self = this;
        vm_server_client.list_servers(function(error, server_list){
            console.log(error, server_list);
            for (var i = 0; i < server_list.length; i++) {
                var server = server_list[i];
                self.servers.push({
                    name: server
                })

                vm_server_client.start_pulse(server, function(){

                    var mem_line_options = {
                        legend: {
                            display: false
                        },
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero:true
                                }
                            }],
                            xAxes: [{
                                ticks: {
                                    beginAtZero:true
                                }
                            }]
                        },
                        responsive: false
                    }

                    var mem_line_chart = new Chart($("#" + server + "-mem"), {
                        type: 'line',
                        data: {
                            labels: [],
                            datasets: [{ 
                                data: [],
                                borderColor: "#3e95cd",
                                fill: true
                            }]
                        },
                        options: mem_line_options
                    });

                    var cpu_line_chart = new Chart($("#" + server + "-cpu"), {
                        type: 'line',
                        data: {
                            labels: [],
                            datasets: [{ 
                                data: [],
                                borderColor: "#67ef58",
                                fill: true
                            }]
                        },
                        options: mem_line_options
                    });

                    var timeout_func = function(){
                        console.log("Server pulse timed out");
                        mem_line_chart.data.datasets[0].data = [];
                        mem_line_chart.update();
                    };

                    var timeout = window.setTimeout(timeout_func, 10000);
                    socket.on(server, function(pulse_data){
                        console.log(pulse_data);
                        if (mem_line_chart.data.labels.length > 24) {
                            mem_line_chart.data.labels.shift();
                            mem_line_chart.data.datasets[0].data.shift();
                        }
                        if (cpu_line_chart.data.labels.length > 24) {
                            cpu_line_chart.data.labels.shift();
                            cpu_line_chart.data.datasets[0].data.shift();
                        }
                        mem_line_chart.data.labels.push("");
                        var total_mem = pulse_data.total / 1000000;
                        mem_line_chart.data.datasets[0].data.push(total_mem - (pulse_data.free / 1000000));
                        mem_line_chart.options.scales.yAxes[0].ticks.max = total_mem;

                        cpu_line_chart.data.labels.push("");
                        cpu_line_chart.data.datasets[0].data.push(pulse_data.load_avg[0]);
                        cpu_line_chart.options.scales.yAxes[0].ticks.max = pulse_data.cpu_data.length;

                            //.data.datasets[1].data.push(total_mem);
                        window.clearTimeout(timeout);
                        timeout = window.setTimeout(timeout_func, 10000);
                        mem_line_chart.update();
                        cpu_line_chart.update();
                    });
                });
            }
            
            
        });
    },
    computed: {
        
    }
});
