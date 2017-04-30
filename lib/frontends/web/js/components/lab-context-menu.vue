<template>

    <div id="lab-context-menu" class="ui vertical menu">
        <a class="c-configure item">
            <i class="play icon"></i> Start
        </a>
        <a class="c-configure item">
            <i class="edit icon"></i> Edit
        </a>
        <a class="c-add-connection item">
            <i class="terminal icon"></i> Console
        </a>
        <a class="c-remove item">
            <i class="remove icon"></i> Remove
        </a>
    </div>

</template>

<script>
module.exports = {
    props: ['menuData'],
    mounted: function() {
        $('#status-bar.menu .addmenu').popup({
            inline     : true,
            hoverable  : true,
            position   : 'top left',
        });
        $('#status-bar.menu .configmenu').popup({
            inline     : true,
            hoverable  : true,
            position   : 'top left',
        });
        $('#status-bar.menu .statemenu').popup({
            inline     : true,
            hoverable  : true,
            position   : 'top left',
        });
        $('#status-bar.menu .infopopup').popup({
            inline     : true,
            hoverable  : true,
            position   : 'top right',
        });
    },
    watch: {
        "menuData.locX": function(new_value) {
            $("#lab-context-menu").css('left', new_value);
        },
        "menuData.locY": function(new_value) {
            $("#lab-context-menu").css('top', new_value);
        },
        "menuData.is_visible": function(new_value) {
           
            if (new_value === true) {
                console.log("showing contextmenu")
                $("#lab-context-menu").show();
            } else {
                $("#lab-context-menu").hide();
            }
        }
    },
    name: "lab-context-menu"
};
</script>