<template>
    <div id="confirm-modal" class="ui modal">
        <div class="header">{{title}}</div>
        <div class="content">
            {{message}}
        </div>
        <div class="actions">
            <div class="ui approve button">Yes</div>
            <div class="ui cancel button">No</div>
        </div>
    </div>
</template>

<script>
module.exports = {
    mounted: function() {
        
    },
    name: "confirm-modal",
    props: ['isOpen', "message", "title"],
    watch: {
        isOpen: function(new_value) {
            var self = this;
            console.log("modal got", new_value);
            if (new_value === true) {
                $('#confirm-modal.ui.modal').modal({
                    closable : false,
                    onDeny : function(){
                        self.$emit('modal-close', false);
                        return false;
                    },
                    onApprove : function() {
                        self.$emit('modal-close', true);
                        return false;
                    }
                }).modal('show');
            } else {
                $('#confirm-modal.ui.modal').modal('hide');
            }
        }
    }
};
</script>