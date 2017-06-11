<template>
    <div id="add-vm-modal" class="ui large modal">
        <div class="header">Add VM</div>
        <div class="content">

            <div class="ui segments">
                <div class="ui right aligned segment">
                    <div class="ui input">
                        <!-- This doesn't support IME (such as Korean) input! -->
                        <input placeholder="Filter VMs" type="text" v-model="vm_filter">
                    </div>
                </div>
                <div class="ui segment">
                    <vm-list :vms="available_vms"></vm-list>
                </div>
                <div class="ui right aligned segment">
                    <div class="ui input">
                        <div class="ui toggle checkbox">
                            <input name="selected_vm" type="checkbox">
                            <label>Make Clone</label>
                        </div>
                    </div>
                    <div class="ui labeled input">
                        <!-- This doesn't support IME (such as Korean) input! -->
                        <div class="ui label"> 
                            Display Name
                        </div>
                        <input placeholder="Display Name" type="text" v-model="display_name">
                    </div>
                    <div class="ui labeled input">
                        <div class="ui label"> 
                            Image
                        </div>

                        <div id="display_image" class="ui selection dropdown">
                            <input name="image_display_text" type="hidden">
                            <i class="dropdown icon"></i>
                            <div class="default text">Select Image</div>
                            <div class="menu">
                                <div class="item" data-value="desktop">
                                    <img class="ui mini image" src="static/images/osa_desktop.png">
                                    Desktop
                                </div>
                                <div class="item" data-value="server">
                                    <img class="ui mini avatar image" src="static/images/osa_server.png">
                                    Server
                                </div>
                                <div class="item" data-value="router">
                                    <img class="ui mini avatar image" src="static/images/osa_vpn.png">
                                    Router
                                </div>
                                <div class="item" data-value="firewall">
                                    <img class="ui mini avatar image" src="static/images/osa_firewall.png">
                                    Firewall
                                </div>
                                
                            </div>
                        </div>
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
        $('#display_image').dropdown();
    },
    components: {
        'vm-list': require("../lists/vm-list.vue")
    },
    data: function() {
        return {
            display_name: "",
            available_vms: [
                {"name": "Test VM 1", "description": "A testing VM", "memory": 512, "cpus": 1, "tags": ["test", "cool"]},
                {"name": "Test VM 2", "description": "Another testing VM", "memory": 1024, "cpus": 1, "tags": ["test", "vm"]}
            ]
        };
    },
    name: "add-vm-modal",
    props: ['isOpen'],
    watch: {
        isOpen: function(new_value) {
            var self = this;
            console.log("modal got", new_value);
            if (new_value === true) {
                $('#add-vm-modal.ui.modal').modal({
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
                $('#add-vm-modal.ui.modal').modal('hide');
            }
        }
    }
};
</script>