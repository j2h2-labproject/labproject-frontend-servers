<template>
    <div id="profile-view" class="ui segments">
        <div class="ui segment black inverted">
            <h2>About</h2>
        </div>
        <div class="ui loading secondary segment">

            <div class="ui items">
                <div class="item">
                    <div class="content">
                        <span class="header">About</span>
                        <div class="description">
                            <p>LabProject Web UI v0.1.0</p>
                        </div>
                    </div>
                </div>
                <div class="item">
                    <div class="content">
                        <span class="header">Credits</span>
                        <div class="description">
                            <div class="ui bulleted list">
                                <div class="item">
                                    <div class="content">
                                        <span class="header">Default Profile Picture</span>
                                        <div class="description">
                                            <a href="https://commons.wikimedia.org/wiki/User:Joel_Cooke_Verdaguer">Joel Cooke Verdaguer</a>, <a href="https://commons.wikimedia.org/wiki/File:Joel_Cooke_Verdaguer.png">Joel Cooke Verdaguer</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0/legalcode">CC BY-SA 4.0</a> 
                                        </div>
                                    </div>
                                </div>
                                <div class="item">
                                    <div class="content">
                                        <span class="header">Diagram Device Icons</span>
                                        <div class="description">
                                            <a href="http://www.opensecurityarchitecture.org/cms/library/icon-library">http://www.opensecurityarchitecture.org/cms/library/icon-library</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            

            
        </div>
    </div>
    
</template>

<script>

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
    name: "about",
    props: ['active'],
    mounted: function() {
        var self = this;
        
        $("#profile-view div.ui.loading").removeClass("loading");

    }

};
</script>