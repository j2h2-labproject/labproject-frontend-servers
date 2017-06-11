<template>
    <div id="add-switch-modal" class="ui modal">
        <div class="header">Add Switch</div>
        <div class="content">

            <div class="ui segments">
                <div class="ui segment">
                    <div class="ui labeled input">
                        <!-- This doesn't support IME (such as Korean) input! -->
                        <div class="ui label"> 
                            Display Name
                        </div>
                        <input placeholder="Display Name" type="text" v-model="display_name">
                    </div>
                </div>
            </div>

        </div>
        <div class="actions">
            <div class="ui approve green button">Add</div>
            <div class="ui cancel black button">Cancel</div>
        </div>
    </div>
</template>

<script>

module.exports = {
    mounted: function() {
        
    },
    data: function() {
        return {
            display_name: ""
        };
    },
    name: "add-switch-modal",
    props: ['isOpen'],
    watch: {
        isOpen: function(new_value) {
            var self = this;
            console.log("modal got", new_value);
            if (new_value === true) {
                $('#add-switch-modal.ui.modal').modal({
                    closable : false,
                    onDeny : function(){
                        self.$emit('modal-close', false, null);
                        return false;
                    },
                    onApprove : function() {
                        self.$emit('modal-close', true, self.display_name);
                        return false;
                    }
                }).modal('show');
            } else {
                $('#add-switch-modal.ui.modal').modal('hide');
            }
        }
    }
};
</script>