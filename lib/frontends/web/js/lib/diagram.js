var foreach = require('../../../../common/loop').foreach;

module.exports = function(element) {
    var self = this;

    var Canvas = new fabric.Canvas(element, { width: 3000, height: 3000 });

    var Connections = [];
    var Objects = [];

    var on_select = null;
    var on_deselect = null;
    var on_context_menu = null;
    var on_change = null;

    // Setup all events
    Canvas.on('selection:cleared', function(e) {
        on_deselect(e);
    });

    Canvas.on('mouse:down', function(object) {
        on_select(object);
    });

    Canvas.on('mouse:up', function(event) {
        console.log("hi", event.target)
        // Recalculate connections, in case they weren't directly moved
        if (event.target != undefined) {
            if (event.target.hasOwnProperty('objects')) {
                for (i in event.target.objects) {
                    console.log(event.target.objects[i])
                    recalculate_connections(event.target.objects[i])
                }
            } else if (event.target.id != undefined) {
                 recalculate_connections(event.target);
            }
            on_change(event);
        }    
    });

    Canvas.on('mouse:move', function (e) {
        // var o = canvas.findTarget(e.e);
        // console.log("yi", o);

        // Check if have have an active object
        var current_obj = Canvas.getActiveObject();

        if (current_obj) {
            recalculate_connections(current_obj);
        }

    });

    $('.upper-canvas').bind('contextmenu', function (e) {
        var objectFound = false;
        var lineFound = false;
        var lineObj = null;
        var clickPoint = new fabric.Point(e.offsetX, e.offsetY);

        e.preventDefault();

        console.log("contextmenu")

        Canvas.forEachObject(function (obj, index, data) {

            if (index == data.length - 1 && lineFound === true && objectFound === false) {
                objectFound = true;
                Canvas.setActiveObject(lineObj);
                on_context_menu(e, lineObj, e.clientX, e.clientY);
            }

            if (!objectFound && obj.containsPoint(clickPoint)) {
                console.log(index)
                console.log(data.length)

                // Favor other objects over lines
                if (obj.type == "line") {
                    lineFound = true;
                    lineObj = obj;
                } else {
                    objectFound = true;
                    Canvas.setActiveObject(obj);
                    on_context_menu(e, obj, e.clientX, e.clientY);
                }
               
            }
        });
    });

    // Private functions

    function recalculate_connections(current_obj) {
        var conn_list = get_connections(current_obj.id);
        // console.log(conn_list);
        var newY = current_obj.top + (current_obj.height/2);
        var newX = current_obj.left + (current_obj.width/2);

        for (var i = 0; i < conn_list.length; i++) {
            var current_conn = conn_list[i];
            var line_obj = current_conn.line;
            if (current_conn.uuid1 == current_obj.id) {
                line_obj.set({'x1': newX, 'y1': newY});
            } else if (current_conn.uuid2 == current_obj.id) {
                line_obj.set({'x2': newX, 'y2': newY});
            }

            line_obj.setCoords();
            Canvas.sendToBack(line_obj);

            var other_obj = null;
            if (current_conn.obj1.id == current_obj.id) {
                other_obj = current_conn.obj2;
            } else {
                other_obj = current_conn.obj1;
            }

            var other_x = other_obj.left + (other_obj.width/2);
            var other_y = other_obj.top + (other_obj.height/2);

            var current_obj_point = get_line_point_location(newX, newY, other_x, other_y);
            var other_obj_point = get_line_point_location(other_x, other_y, newX, newY);

            current_conn.point1.set({'top': current_obj_point.y, 'left':current_obj_point.x});
            current_conn.point2.set({'top': other_obj_point.y, 'left':other_obj_point.x});
            current_conn.point1.setCoords();
            current_conn.point2.setCoords();
            
        }
    }

    function get_connections(id) {
        var return_list = [];
        for (var i = 0; i < Connections.length; i++) {
            var current = Connections[i];
            if (current.uuid1 == id || current.uuid2 == id) {
                return_list.push(current);
            }
        }
        return return_list;
    }

    function create_line_point(current_x, current_y, other_x, other_y) {

        var location = get_line_point_location(current_x, current_y, other_x, other_y);

        var line_point = new fabric.Circle({
            radius: 10,
            fill: 'green',
            left: location.x,
            top: location.y,
            hasControls: false,
            lockMovementX: true,
            lockMovementY: true,
            selectable: false
        });

        Canvas.add(line_point);
        Canvas.bringToFront(line_point);
        return line_point;
    }

    function get_line_point_location(current_x, current_y, other_x, other_y) {
        var quad;

        var x_result = other_x - current_x;
        var y_result = current_y - other_y;

        if (x_result >= 0 && y_result >= 0) {
        quad = 1;
        } else if (x_result <= 0 && y_result >= 0) {
        quad = 2;
        } else if (x_result <= 0 && y_result <= 0) {
        quad = 3;
        } else if (x_result >= 0 && y_result <= 0) {
        quad = 4;
        }

        // console.log("Quadrant: ", quad);

        var angle = 90;

        if (x_result != 0) {
        o_over_a = Math.abs(y_result) / Math.abs(x_result);
        // console.log(o_over_a);
        angle = (Math.atan(o_over_a)) * 180 / Math.PI;
        }

        // console.log(angle);


        var line_point_x = current_x;
        var line_point_y = current_y;

        var offset_x = Math.cos((angle * Math.PI) / 180) * 50;
        var offset_y = Math.sin((angle * Math.PI) / 180) * 50;
        //
        // console.log("OX", offset_x);
        // console.log("OY", offset_y);

        if (quad == 1) {
        line_point_x += offset_x - 10;
        line_point_y -= offset_y + 10;
        } else if (quad == 2) {
        line_point_x -= offset_x + 10;
        line_point_y -= offset_y + 10;
        } else if (quad == 3) {
        line_point_x -= offset_x + 10;
        line_point_y += offset_y - 10;
        } else if (quad == 4) {
        line_point_x += offset_x - 10;
        line_point_y += offset_y - 10;
        }

        return {"x": line_point_x, "y": line_point_y};
    }

    function add_image(name, path, x, y, callback) {
        fabric.Image.fromURL(path, function(img_obj) {
            Canvas.add(img_obj);
            var text = new fabric.Text(name, { left: x + img_obj.width/2, top: y + img_obj.height, fontSize: 15, textAlign: 'center',  originX: 'center', fontFamily: 'Courier New'});

            var group1 = new fabric.Group([ img_obj, text ], {hasControls: false});
            Canvas.add(group1);

            group1.label = name;
            callback(group1);
        }, {left: x, top: y, hasControls: false, width:75, height: 75});
    }

    // Public functions

    self.load = function(objects, connections, callback) {
        
         foreach(objects, function(loc, object, pass_data, next) {
            if (object['display_type'] == "server") {
                self.add_server(object['label'], object['uuid'], object['x'], object['y'], function(error, result) {
                    next(null, true);
                });
            } else if (object['display_type'] == "switch") {
                self.add_switch(object['label'], object['uuid'], object['x'], object['y'], function(error, result) {
                    next(null, true);
                });
            } else if (object['display_type'] == "router") {
                self.add_router(object['label'], object['uuid'], object['x'], object['y'], function(error, result) {
                    next(null, true);
                });
            } else if (object['display_type'] == "desktop") {
                self.add_desktop(object['label'], object['uuid'], object['x'], object['y'], function(error, result) {
                    next(null, true);
                });
            }
          }, function() {
            foreach(connections, function(loc, connection, pass_data, next) {
                self.connect_items(connection['uuid1'], connection['uuid2'], function(error, result) {
                    next(null, true);
                });
            }, function() {
                callback(null, true);
            });
          });


    };

    self.connect_items = function(uuid1, uuid2, callback) {
        var uuid1_obj = null;
        var uuid2_obj = null;
        var object_list = Canvas.getObjects();
        for (var i = 0; i < object_list.length && (uuid1_obj == null || uuid2_obj == null); i++) {
        var object = object_list[i];
        // console.log(object);
        if (object.id == uuid1) {
            uuid1_obj = object;
        } else if (object.id == uuid2) {
            uuid2_obj = object;
        }
        }
        if (uuid1_obj == null || uuid2_obj == null) {
            callback(new Error('Could not find objects'), null);
        } else {
            firstMiddleY = uuid1_obj.top + (uuid1_obj.height/2);
            firstMiddleX = uuid1_obj.left + (uuid1_obj.width/2);
            secondMiddleY = uuid2_obj.top + (uuid2_obj.height/2);
            secondMiddleX = uuid2_obj.left + (uuid2_obj.width/2);

            var connection_id = uuid1 + "-" + uuid2;

            var con_line = new fabric.Line([firstMiddleX, firstMiddleY, secondMiddleX, secondMiddleY], {
                // left: firstMiddleX,
                // top: firstMiddleY,
                stroke: 'black',
                id: connection_id,
                lockMovementX: true,
                lockMovementY: true,
                hasControls: false
            });

            // var distance = Math.sqrt(Math.pow(Math.abs(firstMiddleY - secondMiddleY), 2) + Math.pow(Math.abs(firstMiddleX - secondMiddleX), 2));
            var uuid1_point = create_line_point(firstMiddleX, firstMiddleY, secondMiddleX, secondMiddleY);
            var uuid2_point = create_line_point(secondMiddleX, secondMiddleY, firstMiddleX, firstMiddleY);

            Canvas.add(con_line);

            Canvas.sendToBack(con_line);
            Connections.push({"id": connection_id, "uuid1": uuid1, "uuid2": uuid2, "point1": uuid1_point, "point2": uuid2_point, "obj1": uuid1_obj, "obj2": uuid2_obj, "line": con_line});
            callback(null, true);
        }
    };

    self.set_on_contextmenu = function(func) {
        on_context_menu = func;
    }

    self.set_on_deselect = function(func){
        on_deselect = func;
    }

    self.set_on_click = function(func) {
        on_select = func;
    }
  
    self.set_on_change = function(func) {
        on_change = func;
    };

    self.save = function() {

        var out_object_list = [];

        for (var i = 0; i < Objects.length; i++) {

            out_object_list.push({
                label: Objects[i].label,
                x: Objects[i].left, 
                y: Objects[i].top,
                uuid: Objects[i].id,
                display_type: Objects[i].display_type
            })
        }

        var out_connection_list = [];

        for (var i = 0; i < Connections.length; i++) {
            console.log(Connections[i]);
            out_connection_list.push({ 
                id: Connections[i].id, 
                uuid1: Connections[i].uuid1,
                uuid2: Connections[i].uuid2
            })
        } 

        return {
            "objects": out_object_list, 
            "connections" : out_connection_list
        };
    };

    self.add_server = function(name, uuid, x, y, callback) {
        add_image(name, 'static/images/osa_server.png', x, y, function(img_obj) {
        img_obj.id = uuid;
        img_obj.display_type = "server";
        Objects.push(img_obj);

        on_change(Canvas, null);
        callback(null, true);

        });
    };

    self.add_switch = function(name, uuid, x, y, callback) {
        add_image(name, 'static/images/osa_hub.png', x, y, function(img_obj) {
        img_obj.id = uuid;
        img_obj.display_type = "switch";
        Objects.push(img_obj);

        on_change(Canvas, null);
        callback(null, true);
        });
    };

    self.add_router = function(name, uuid, x, y, callback) {
        add_image(name, 'static/images/osa_vpn.png', x, y, function(img_obj) {
        img_obj.id = uuid;
        img_obj.display_type = "router";
        Objects.push(img_obj);

        on_change(Canvas, null);
        callback(null, true);
        });
    };

    self.add_desktop = function(name, uuid, x, y, callback) {
        add_image(name, 'static/images/osa_desktop.png', x, y, function(img_obj) {
        img_obj.id = uuid;
        img_obj.display_type = "deskop";
        Objects.push(img_obj);

        on_change(Canvas, null);
        callback(null, true);
        });
    };

    return self;
}

