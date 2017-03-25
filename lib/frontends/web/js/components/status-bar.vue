<template>

    <div id="status-bar" class="ui bottom fixed menu">
        <a class="addmenu item">
            <i class="plus icon"></i>
        </a>
        <div class="ui flowing popup bottom left transition hidden">
            <div class="ui secondary vertical menu">
                <div class="header item">Add</div>
                <a class="item">
                    <i class="desktop icon"></i>
                    Virtual Machine
                </a>
                <a class="item">
                    <i class="sitemap icon"></i>
                    Switch
                </a>
                <a class="item">
                    <i class="plug icon"></i>
                    Patch Cable
                </a>
                <a class="item">
                    <i class="world icon"></i>
                    External Connection
                </a>
                <a class="item">
                    <i class="write icon"></i>
                    Text
                </a>
                <a class="item">
                    <i class="object group icon"></i>
                    Shape
                </a>
            </div>
        </div>

        <a class="configmenu item">
            <i class="configure icon"></i>
        </a>
        <div class="ui flowing popup bottom left transition hidden">
            <div class="ui secondary vertical menu">
                <div class="header item">Lab Settings</div>
                <a class="item">
                    <i class="edit icon"></i>
                    Edit Info
                </a>
                <a class="item">
                    <i class="users icon"></i>
                    Permissions
                </a>
            </div>
        </div>

        <a class="statemenu item">
            <i class="folder open icon"></i>
        </a>
        <div class="ui flowing popup bottom left transition hidden">
            <div class="ui secondary vertical menu">
                <div class="header item">State</div>
                <a class="item">
                    <i class="stop icon"></i>
                    Stop
                </a>
                <a class="item">
                    <i class="save icon"></i>
                    Save
                </a>
                <a class="item">
                    <i class="file icon"></i>
                    New
                </a>
                <a class="item">
                    <i class="upload icon"></i>
                    Open
                </a>
            </div>
        </div>

        <div class="right menu">
            <a class="statemenu item">
                <i class="info icon"></i>
            </a>
            <div class="ui item">
                Status: Running
            </div>
            <a class="ui item">
                <i class="comment icon"></i>
            </a>
        </div>
    </div>

</template>

<script>
module.exports = {
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
    },
    name: "status-bar"
};
</script>