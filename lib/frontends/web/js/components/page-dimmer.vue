<template>
    <div id="page-dimmer"></div>
        <div class="ui page dimmer">
        <div class="content">
            <div class="ui text loader">Connection Lost</div>
        </div>
    </div>
</template>

<script>
module.exports = {
    mounted: function() {
       
    },
    name: "page-dimmer",
    props: ['is_visible'],
    watch: {
        is_visible: function(new_value) {
            var self = this;
            if (new_value === true) {
                $('#page-dimmer').show();
            } else {
                $('#page-notice').hide();
            }
        }
    }
};
</script>