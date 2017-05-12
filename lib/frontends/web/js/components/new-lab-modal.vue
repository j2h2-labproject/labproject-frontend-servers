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
            <div class="ui labeled input">
                <div class="ui label"> 
                    Visibility
                </div>
                <div id="visibility" class="ui selection dropdown">
                    <input name="visibility" type="hidden">
                    <i class="dropdown icon"></i>
                    <div class="default text">Visibility</div>
                    <div class="menu">
                        <div class="item" data-value="private">Private</div>
                        <div class="item" data-value="public">Public</div>
                    </div>
                </div>
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
        $('#visibility').dropdown('set selected', 'private');
    },
    data: function() {
        return {
            lab_name: ""
        };
    },
    name: "new-lab-modal",
    props: ['isOpen'],
    watch: {
        isOpen: function(new_value) {
            var self = this;
            console.log("modal got", new_value);
            if (new_value === true) {
                $('#new-lab-modal.ui.modal').modal({
                    closable : false,
                    onDeny : function(){
                        self.$emit('modal-close', null);
                        return false;
                    },
                    onApprove : function() {
                        self.$emit('modal-close', self.lab_name);
                        return false;
                    }
                }).modal('show');
            } else {
                 $('#new-lab-modal.ui.modal').modal('hide');
            }
        }
    }
};
</script>