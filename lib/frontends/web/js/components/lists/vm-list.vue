<template>

    <table class="ui celled definition striped table">
        <tbody>
        <template v-for="vm in vms">
            <tr>
                <td>
                    <div class="ui fitted checkbox">
                        <input name="selected_vm" type="radio">
                        <label></label>
                    </div>
                </td>
                <td>IMAGE</td>
                <td>
                    <h3>{{vm.name}}</h3>
                    {{vm.description}}
                </td>
                <td>
                    <template v-for="tag in vm.tags">
                        <div class="ui label">
                            {{tag}}
                        </div>
                    </template>
                </td>
                <td class="right aligned">
                    <i class="microchip icon"></i> {{vm.memory}} MB
                    <i class="square outline icon"></i> {{vm.cpus}} CPUs
                </td>
            </tr>
        </template>
        </tbody>
    </table>
</template>

<script>
module.exports = {
    mounted: function() {
        
    },
    name: "vm-list",
    props: ['vms']
};
</script>