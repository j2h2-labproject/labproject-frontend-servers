<template>

    <div id="virtual-machines-view" class="ui segments">
        <div class="ui segment blue inverted">
            <h2>Virtual Machines</h2>
        </div>
        <div class="ui loading secondary segment">
            <div class="ui menu">
                <a class="item" v-on:click="new_vm">
                    <i class="add icon"></i>New VM
                </a>
                <a class="item">
                    <i class="trash icon"></i>Delete VM
                </a>
                <a class="item">
                    <i class="clipboard icon"></i>Audit
                </a>
                <div class="right menu">
                    <div class="item">
                        <select class="ui fluid search dropdown" multiple="" id="tag-select">
                            <option value="">Tag</option>
                            <option value="AL">Alabama</option>
                            <option value="AK">Alaska</option>
                            <option value="AZ">Arizona</option>
                            <option value="AR">Arkansas</option>
                            <option value="CA">California</option>
                            <option value="CO">Colorado</option>
                            <option value="CT">Connecticut</option>
                            <option value="DE">Delaware</option>
                        </select>
                    </div>
                    <div class="item">
                        <div class="ui icon input">
                            <input placeholder="Search..." type="text">
                            <i class="search link icon"></i>
                        </div>
                    </div>
                </div>
            </div>
            <vm-list v-bind:vms="vm_list" selectMode="multi"></vm-list>
            <new-vm-modal ref="new_vm_modal"></new-vm-modal>
            
        </div>
    </div>
    
</template>

<script>

function load_view() {
    $("#virtual-machines-view div.ui.loading").removeClass("loading");
}

module.exports = {
    mounted: function() {
        
    },
    components: {
        'vm-list': require("../lists/vm-list.vue"),
        'new-vm-modal': require("../modals/new-vm-modal.vue")
    },
    data: function() {
        return {
            
        };
    },
    computed: {
        vm_list: function() {
            return [
                {"name": "Test VM 1", "description": "A testing VM", "memory": 512, "cpus": 1, "tags": ["test", "cool"]},
                {"name": "Test VM 2", "description": "Another testing VM", "memory": 1024, "cpus": 1, "tags": ["test", "vm"]}
            ]
        }
    },
    name: "virtual-machines-view",
    props: ['vmClient', 'active'],
    mounted: function() {
        var self = this;
        
        $('#tag-select').dropdown({

        });

        if (self.active) {
            load_view();
        }
    },
    watch: {
        active: function(new_value) {
            var self = this;
            if (new_value) {
                load_view();
            }
            
            
        }
    },
    methods: {
        new_vm: function() {
            this.$refs.new_vm_modal.open(function(error, lab_name){
                console.log(lab_name)
            });
        }
    }

};
</script>