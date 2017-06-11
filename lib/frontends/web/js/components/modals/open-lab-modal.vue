<template>
    <div id="open-lab-modal" class="ui modal">
        <div class="header">Open Lab</div>
        <div class="content">
            <lab-list v-bind:labs="labs"></lab-list>
        </div>
        <div class="actions">
            <div class="ui approve button">Open</div>
            <div class="ui cancel button">Cancel</div>
        </div>
    </div>
</template>

<script>
module.exports = {
    mounted: function() {
        
    },
    name: "open-lab-modal",
    props: ['is_open'],
    watch: {
        is_open: function(new_value) {
            var self = this;
            console.log("modal got", new_value);
            if (new_value === true) {
                $('#open-lab-modal.ui.modal').modal({
                    closable : false,
                    onDeny : function(){
                        self.$emit('modal_close');
                    },
                    onApprove : function() {
                        self.$emit('modal_close');
                    }
                }).modal('show');
            } else {
                
            }
        }
    }
};
</script>