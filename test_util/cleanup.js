
var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var test_helper = require(LABPROJECT_BASE + '/test_util/test_helpers');

test_helper.destroy_environment(function() {
    console.log("Done!");
    process.exit(0);
});