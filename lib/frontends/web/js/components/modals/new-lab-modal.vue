<template>
    <div id="new-lab-modal" class="ui modal">
        <div class="header">New Lab</div>
        <div class="content">
            <div class="ui labeled input">
                <!-- This doesn't support IME (such as Korean) input! -->
                <div class="ui label"> 
                    Lab Name
                </div>
                <input placeholder="Lab name" type="text" v-model="lab_name">
            </div>
        </div>
        <div class="actions">
            <div class="ui approve button">Create</div>
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
    name: "new-lab-modal",
    props: [
        "labClient"
    ],
    watch: {
        
    },
    methods: {
        open: function(callback) {
            var self = this;
            $('#new-lab-modal.ui.modal').modal({
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