<template>

    <table class="ui celled striped table">
        <thead>
            <tr>
                <th class="twelve wide">Message</th>
                <th class="four wide">Sender</th>
            </tr>
        </thead>
        <tbody>
            <template v-for="message in messages" >
                <template v-if="message.importance == 'high'">
                    <tr class="negative">
                        <td><i class="warning sign icon"></i>{{ message.message }}</td>
                        <td>{{ message.sender }}</td>
                    </tr>
                </template>
                <template v-else-if="message.importance == 'medium'">
                    <tr>
                        <td><i class="attention icon"></i>{{ message.message }}</td>
                        <td>{{ message.sender }}</td>
                    </tr>
                </template>
                <template v-else>
                    <tr>
                        <td>{{ message.message }}</td>
                        <td>{{ message.sender }}</td>
                    </tr>
                </template>
                    
            </template>
            
               
        </tbody>
    </table>

</template>

<script>
module.exports = {
    mounted: function() {
        $('#main-header-dropdown').dropdown();
    },
    name: "main-header",
    props: ['messages']
};
</script>