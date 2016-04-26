var LABPROJECT_BASE = process.cwd();
var user_manager = require(LABPROJECT_BASE + '/lib/managers/user_manager');
var permissions_manager = require(LABPROJECT_BASE + '/lib/managers/permissions_manager');

user_manager.new_user('admin', 'labproject', function(error, result) {
  permissions_manager.new_permissions('admin', function(error,result) {
    result.set_superuser_status(true);
    result.save(function(s_error, result) {
      console.log("Done");
      process.exit();
    });
  });
});
