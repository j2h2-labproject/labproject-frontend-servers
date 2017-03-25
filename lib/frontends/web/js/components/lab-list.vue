<template>

    <table class="ui celled striped table">
        <thead>
            <tr>
                <th class="ten wide">Lab</th>
                <th class="four wide">Owner</th>
                <th class="two wide"></th>
            </tr>
        </thead>
        <tbody>
            <template v-for="lab in labs">
                <tr>
                    <td>{{ lab.name }}</td>
                    <td>{{ lab.owner }}</td>
                    <td><a :href="'/lab?lab_id=' + lab.lab_id"><i class="folder open icon"></i></a></td>
                </tr>  
            </template>
        </tbody>
    </table>

</template>

<script>
module.exports = {
    mounted: function() {
        
    },
    name: "lab-list",
    props: ['labs']
};
</script>