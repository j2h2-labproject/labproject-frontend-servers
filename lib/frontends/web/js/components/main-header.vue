<template>

    <header class="ui inverted top fixed menu" id="main-header">
        <a id="logo" class="item" href="/main">LabProject</a>
        <div class="right menu">
            <div class="ui dropdown item" id="main-header-dropdown">
                <i class="user icon"></i>
                <div class="menu">
                    <a class="item" href="/manage"><i class="setting icon"></i>Settings</a>
                    <a class="item"><i class="help circle icon"></i>Help</a>
                    <a class="item" href="/logout"><i class="sign out icon"></i>Sign Out</a>
                </div>
            </div>
        </div>
    </header>

</template>

<script>
module.exports = {
    mounted: function() {
        $('#main-header-dropdown').dropdown();
    },
    name: "main-header"
};
</script>