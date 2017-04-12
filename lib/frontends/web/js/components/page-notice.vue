<template>
    <div id="page-notice" :class="'ui floating hidden message ' + display_class">
        <p>{{ message_contents }}</p>
    </div>
</template>

<script>
module.exports = {
    mounted: function() {
        $('#page-notice.message').click(function(){
            $('#page-notice.message').transition('fade up');
        });
    },
    name: "page-notice",
    props: ['is_visible', 'message_contents', 'display_class'],
    watch: {
        is_visible: function(new_value) {
            var self = this;
            console.log("notice got", new_value)
            if (new_value === true) {
                $('#page-notice.message').transition('fade up');
            } else {
                $('#page-notice.message').transition('fade up');
            }
        }
    }
};
</script>