<template>

    <div id="profile-view" class="ui segments">
        <div class="ui segment blue inverted">
            <h2>My Profile</h2>
        </div>
        <div class="ui loading secondary segment">
            <div class="ui centered card">
                <div class="blurring dimmable image">
                <div class="ui dimmer">
                    <div class="content">
                    <div class="center">
                        <div class="ui inverted button">Edit Profile</div>
                    </div>
                    </div>
                </div>
                <img v-bind:src="user.image">
                </div>
                <div class="content">
                    <span class="header">{{user.fullname}}</span>
                    <div class="meta">
                        <span class="date">Joined {{user.joined}}</span>
                    </div>
                    <div class="ui list">
                        <div class="item">
                            <i class="address book icon"></i>
                            <div class="content">{{user.username}}</div>
                        </div>
                        <div class="item">
                            <i class="mail icon"></i>
                            <div class="content">{{user.email}}</div>
                        </div>
                    </div>
                </div>
                <div class="extra content">
                    Last login: 
                </div>
            </div>
            <div class="ui horizontal segments">
                <div class="ui segment">   
                    
                </div>
                <div class="ui segment">
                    <p></p>
                </div>
            </div>

            
        </div>
    </div>
    
</template>

<script>

function load_profile(self) {

    self.userClient.get_profile(function(error, result) {
        self.user.username = result.username;
        self.user.fullname = result.fullname;
        self.user.email = result.email;
        if (result.joined == 0) {
            self.user.joined = "never";
        } else {
            var joined_date = new Date(result.joined);
            self.user.joined = joined_date.toDateString();
        }
        if (result.image) {
            self.user.image = result.image;
        }
        
        $("#profile-view div.ui.loading").removeClass("loading");
    });
    
}

module.exports = {
    mounted: function() {
        
    },
    data: function() {
        return {
            user: {
                username: "",
                fullname: "",
                joined: "",
                image: "static/images/default_profile.png",
                email: ""
            }
        };
    },
    name: "profile-view",
    props: ['userClient', 'active'],
    mounted: function() {
        var self = this;
        console.log(this.active);
        if (self.active) {
            load_profile(self);
        }
    },
    watch: {
        active: function(new_value) {
            var self = this;
            if (new_value) {
                load_profile(self);
            }
            
            
        }
    }

};
</script>