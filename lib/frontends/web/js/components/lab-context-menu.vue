<template>

    <div id="lab-context-menu" class="ui vertical menu">

        <a id="start-context-item" class="c-configure item" v-show="select_type == 'device'">
            <i class="play icon"></i> Start
        </a>
        <a class="c-configure item" v-show="select_type == 'device'">
            <i class="edit icon"></i> Edit
        </a>
        <a class="c-add-connection item" v-show="select_type == 'device'">
            <i class="terminal icon"></i> Console
        </a>
        

        <a id="remove-context-item" class="c-remove item" v-show="select_type == 'device' || select_type == 'line'">
            <i class="remove icon"></i> Remove
        </a>

        <confirm-modal v-bind:is-open="modal.is_visible" v-bind:message="modal.message" v-bind:title="modal.title" v-on:modal-close="modal.on_close"></confirm-modal>
    </div>
    
</template>

<script>
var util = require("../lib/util");

module.exports = {
    props: ['x', 'y', 'isVisible', 'lab', 'diagram'],
    data: function() {
        return {
            modal: {
                is_visible: false,
                message: "",
                title: "",
                on_close: function(){}
            },
            select_type: "",
        };
    },
    mounted: function() {
        var self = this;
        $('#status-bar.menu .addmenu').popup({
            inline     : true,
            hoverable  : true,
            position   : 'top left',
        });
        $('#status-bar.menu .configmenu').popup({
            inline     : true,
            hoverable  : true,
            position   : 'top left',
        });
        $('#status-bar.menu .statemenu').popup({
            inline     : true,
            hoverable  : true,
            position   : 'top left',
        });
        $('#status-bar.menu .infopopup').popup({
            inline     : true,
            hoverable  : true,
            position   : 'top right',
        });
        $("#start-context-item").click(function(){
            self.modal.message = "Do you want to start this device?";
            self.modal.title = "Starting device";
            self.modal.is_visible = true;
            self.modal.on_close = function(result) {
                self.modal.is_visible = false;
                alert(result);
            };
            self.$emit('menu-close', true);
        });
        $("#remove-context-item").click(function(){
            var selected = self.diagram.get_selected_item();
            console.log(selected);
            self.modal.message = "Do you want to remove this device?";
            self.modal.title = "Removing device";
            self.modal.is_visible = true;
            self.modal.on_close = function(result) {
                self.modal.is_visible = false;
                if (result === true) {
                    self.diagram.remove_selected_item();
                } else {

                }
            };
            self.$emit('menu-close', true);
        });
    },
    methods: {
        update_menu: function() {
            var selected_item = this.diagram.get_selected_item();

            if (selected_item.display_type == "desktop" 
                || selected_item.display_type == "server" 
                || selected_item.display_type == "switch"
                || selected_item.display_type == "router" ) {
                this.select_type = 'device';
            } else if(selected_item.type == "line") {
                this.select_type = 'line';
            } else {
                this.select_type = '';
            }
        }
    },
    watch: {
        x: function(new_value) {
            this.update_menu(this.diagram, this.select_type);
            $("#lab-context-menu").css('left', new_value);
        },
        y: function(new_value) {
            this.update_menu(this.diagram, this.select_type);
            $("#lab-context-menu").css('top', new_value);
        },
        isVisible: function(new_value) {
            if (new_value === true) {
                this.update_menu(this.diagram, this.select_type);
                $("#lab-context-menu").show();
            } else {
                $("#lab-context-menu").hide();
            }
        },
    },
    name: "lab-context-menu"
};

</script>