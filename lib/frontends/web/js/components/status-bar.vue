<style>
    #message-input {
        width: 350px;
    }
</style>

<template>

    <div id="status-bar" class="ui bottom fixed menu">
        <a class="addmenu item">
            <i class="plus icon"></i>
        </a>
        <div class="ui flowing popup bottom left transition hidden">
            <div class="ui secondary vertical menu">
                <div class="header item">Add</div>
                <a id="add-vm-item" class="item">
                    <i class="desktop icon"></i>
                    Virtual Machine
                </a>
                <a id="add-switch-item" class="item">
                    <i class="sitemap icon"></i>
                    Switch
                </a>
                <a id="add-connection-item" class="item">
                    <i class="plug icon"></i>
                    Patch Cable
                </a>
                <a class="item">
                    <i class="world icon"></i>
                    External Connection
                </a>
                <a class="item">
                    <i class="write icon"></i>
                    Text
                </a>
                <a class="item">
                    <i class="object group icon"></i>
                    Shape
                </a>
            </div>
        </div>

        <a class="configmenu item">
            <i class="configure icon"></i>
        </a>
        <div class="ui flowing popup bottom left transition hidden">
            <div class="ui secondary vertical menu">
                <div class="header item">Lab Settings</div>
                <a class="item">
                    <i class="edit icon"></i>
                    Edit Info
                </a>
                <a class="item">
                    <i class="users icon"></i>
                    Permissions
                </a>
            </div>
        </div>

        <a class="statemenu item">
            <i class="folder open icon"></i>
        </a>
        <div class="ui flowing popup bottom left transition hidden">
            <div class="ui secondary vertical menu">
                <div class="header item">Lab State</div>
                <a class="item">
                    <i class="stop icon"></i>
                    Stop
                </a>
                <a class="item">
                    <i class="save icon"></i>
                    Save
                </a>
                <a class="item">
                    <i class="file icon"></i>
                    New
                </a>
                <a class="item">
                    <i class="upload icon"></i>
                    Open
                </a>
                <a class="item">
                    <i class="clone icon"></i>
                    Clone
                </a>
            </div>
        </div>

        <div class="right menu">
            <a class="infopopup ui item">
                <i class="info icon"></i>
            </a>
            <div class="ui flowing popup bottom left transition hidden">
                <div class="ui list">
                    <div class="item">
                        <i class="book icon"></i>
                        <div class="content">
                            <div class="header">Name</div>
                            {{lab.info.name}}
                        </div>
                    </div>
                    <div class="item">
                        <i class="user icon"></i>
                        <div class="content">
                            <div class="header">Owner</div>
                            {{lab.info.owner}}
                        </div>
                    </div>
                    <div class="item">
                        <i class="tags icon"></i>
                        <div class="content">
                            <div class="header">Tags</div>
                            
                        </div>
                    </div>
                </div>
            </div>
            <div class="ui item">
                Status: {{lab.state}}
            </div>
            <a class="chatpopup ui item" data-variation="wide">
                <i class="comment icon"></i>
            </a>
            <div class="ui flowing popup bottom left transition hidden" >
                <div class="ui form">
                    <div class="field">
                        <textarea rows="7" disabled></textarea>
                    </div>
                    <div class="field">
                        <input id="message-input" placeholder="Message" type="text">
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
module.exports = {
    props: ['diagram', 'lab', 'messaging'],
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
        $('#status-bar.menu .chatpopup').popup({
            inline     : true,
            position   : 'top left',
            on: 'click'
        });
        $('#message-input').keyup(function(e){
            if(e.keyCode == 13) {
                self.messaging.send_message($('#message-input').val(), function(){
                    $('#message-input').val(""); 
                });
            }
        });
    },
    watch: {
        labState: function(new_value) {
            var self = this;

            console.log("state:", new_value)
        },
        diagram: function(new_value) {
            var self = this;

            if (new_value !== null) {
                $("#add-switch-item").click(function() {
                    $('#status-bar.menu .addmenu').popup('hide');
                    self.diagram.enableAddMode(function(event, callback){
                        console.log(event.e);
                        self.diagram.add_switch("Test", "blaa", event.e.clientX, event.e.clientY, function(error, result) {
                            callback(null, true);
                        });
                    });
                });
                 $("#add-connection-item").click(function() {
                    $('#status-bar.menu .addmenu').popup('hide');
                    self.diagram.enableConnectMode(function(event, callback){
                        callback(null, true);
                    });
                });

            }
            

        }
    },
    name: "status-bar"
};
</script>