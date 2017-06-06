module.exports = function(socket) {
    var self = this;

    self.get_recent_labs = function(callback) {
        console.log("get_recent_labs")
        data = {
        };
        socket.emit("lab:get_recent_labs", data, function(result) {
            console.log("get_recent_labs done")
            callback(result.error, result.result);
        });
    };

    self.get_all_labs = function(callback) {
        data = {
        };
        socket.emit("lab:get_all_labs", data, function(result) {
            callback(result.error, result.result);
        });
    };

    self.create_lab = function(lab_name, callback) {
        data = {
            lab_name: lab_name,
        };
        socket.emit("lab:create_lab", data, function(result) {
            callback(result.error, result.result);
        });
    };

    self.open_lab = function(lab_id, callback) {
        data = {
            lab_id: lab_id,
        };
        socket.emit("lab:open_lab", data, function(result) {
            callback(result.error, result.result);
        });
    };

    return self;
}