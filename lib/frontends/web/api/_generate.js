if (process.argv.length < 3) {
    console.error("Path required");
    process.exit(1);
}
var path = process.argv[2];
var acorn = require("acorn");
var fs = require("fs");

// Get the name of the api
var path_split = path.split("/");
var filename = path_split[path_split.length-1]

if (filename.indexOf("_controller.js") == -1) {
    console.error("Invalid module: filename is incorrect format");
    process.exit(2);
}

var API_NAME = filename.replace("_controller.js", "");

// Parse the file
var file = fs.readFileSync(path);
var results = acorn.parse(file.toString());

// Find the 'modules' object
var module_found = false;
var module_node = null;

for (var i = 0; i < results.body.length && module_found == false; i++) {
    var current = results.body[i];

    if (current.type == "ExpressionStatement") {
        if (current.expression.left.object.name=="module" && 
            current.expression.left.property.name=="exports") {
            module_found = true;
            module_node = current.expression.right;
        }
    }
}

var client_code = "";
var api_code = "";

if (module_node !== null) {
    var nodes = module_node.body.body;
    for (i in nodes) {
        // console.log(nodes[i]);
    }
    var first_node = nodes[0];

    // console.log(nodes[1])

    // if (first_node.declarations[0].id.name!="self" && 
    //     first_node.declarations[0].init.type != 'ThisExpression') {
    //     console.error("Invalid module");
    //     process.exit(2);
    // }

    for (var i = 1; i < nodes.length; i++) {

        if (nodes[i].type == "ExpressionStatement" &&
            nodes[i].expression.operator == "=" &&
            nodes[i].expression.left.object.name=="self") {

            var FUNCTION_NAME = nodes[i].expression.left.property.name;
            var api_param_list = "";
            var client_param_list = "";

            var params = nodes[i].expression.right.params;
            for (j in params) {
                var name = params[j].name;
                if (name != "session_id" && name != "callback") {
                    api_param_list += ", data." + params[j].name;
                    client_param_list += params[j].name + ", ";
                }
            }

            var message_name = API_NAME + ':' + FUNCTION_NAME;

            client_code += 'self.' + FUNCTION_NAME + ' = function(' +  client_param_list + 'callback) {\n';

            client_code += '    data = {\n';
            for (j in params) { 
                var name = params[j].name;
                if (name == "session_id" || name == "callback") {
                    continue;
                }
                if (j < params.length-1) {
                    client_code += '        ' + name + ': ' + name + ',\n';
                } else {    
                    client_code += '        ' + name + ': ' + name + '\n';
                }
                
            } 
            client_code += '    };\n';
            client_code += '    socket.emit("' + message_name + '", data, function(result) {\n';
            client_code += '        callback(result.error, result.result);\n';
            client_code += '    });\n';
            client_code += '};\n\n';

            api_code += 'socket.on("' + message_name + '", function(data, callback) {\n';
            api_code += '    var session_id = socket.request.session_id;\n';
            api_code += '    ' + API_NAME + '_controller.' + FUNCTION_NAME + '(session_id' + api_param_list + ', function(error, result) {\n';
            api_code += '        callback({"error": error, "result": result});\n';
            api_code += '    });\n';
            api_code += '});\n\n';
            
        }
    }

    console.log(api_code)
    console.log(client_code)
} else {
    console.error("Invalid module");
    process.exit(2);
}