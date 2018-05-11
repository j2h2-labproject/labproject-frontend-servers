<template>
    <div id="new-vm-modal" class="ui modal">
        <div class="header">New Lab</div>
        <div class="content">
            <div class="ui vertical steps">
                <div class="active step">
                    <i class="info icon"></i>
                    <div class="content">
                    <div class="title">Naming</div>
                    </div>
                </div>
                <div class="disabled step">
                    <i class="microchip icon"></i>
                    <div class="content">
                    <div class="title">Resources</div>
                    </div>
                </div>
                <div class="disabled step">
                    <i class="hdd icon"></i>
                    <div class="content">
                    <div class="title">Drives</div>
                    </div>
                </div>
                <div class="disabled step">
                    <i class="plug icon"></i>
                    <div class="content">
                    <div class="title">Other Hardware</div>
                    </div>
                </div>
                <div class="disabled step">
                    <i class="id badge icon"></i>
                    <div class="content">
                    <div class="title">Permissions</div>
                    </div>
                </div>
                <div class="disabled step">
                    <i class="check icon"></i>
                    <div class="content">
                    <div class="title">Done</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="actions">
            <div class="ui cancel button">Cancel</div>
        </div>
    </div>
</template>

<script>
module.exports = {
    mounted: function() {
        var self = this;
        
    },
    data: function() {
        return {
            lab_name: ""
        };
    },
    name: "new-vm-modal",
    props: [
        "labClient"
    ],
    watch: {
        
    },
    methods: {
        open: function(callback) {
            var self = this;
            $('#new-vm-modal.ui.modal').modal({
                closable : false,
                onDeny : function(){
                    callback(null, null);
                    return true;
                },
                onApprove : function() {
                    callback(null, self.lab_name);
                    return true;
                }
            }).modal('show');
        }
    }
};
</script>