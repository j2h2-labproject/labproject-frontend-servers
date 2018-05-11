<template>

    <table class="ui celled definition striped table">
        <tbody>

            <tr v-for="vm in vms">
                <td v-if="selectMode == 'single' || selectMode == 'multi'" class="ui form">
                    <div v-if="selectMode == 'single'" class="ui fitted checkbox">
                        <input name="selected_vm" type="radio">
                    </div>
                    <div v-if="selectMode == 'multi'" class="ui checkbox">
                        <input name="selected_vms" type="checkbox">
                    </div>
                </td>
                <td>IMAGE</td>
                <td>
                    <h3>{{vm.name}}</h3>
                    {{vm.description}}
                </td>
                <td>
                    <div v-for="tag in vm.tags" class="ui blue label">
                        {{tag}}
                    </div>
                </td>
                <td class="right aligned">
                    <i class="microchip icon"></i> {{vm.memory}} MB
                    <i class="square outline icon"></i> {{vm.cpus}} CPUs
                </td>
            </tr>

        </tbody>
    </table>
</template>

<script>
module.exports = {
    mounted: function() {
        console.log(this.vms)
        console.log(this.selectMode)
        $('.ui.checkbox').checkbox();


    },
    name: "vm-list",
    props: ['vms', 'selectMode']
};
</script>