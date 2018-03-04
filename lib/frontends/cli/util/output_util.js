function pad(depth) {
    var padding = "";
    for (var i=0; i < depth; i++) {
        padding += "  ";
    }
    return padding;
}

function quick_format(item, depth = 0) {
    var start_string = "";
    if (Array.isArray(item)) {
        start_string += "\n";
        for (i in item) {
            start_string += pad(depth) + "* " + quick_format(item[i], depth + 1) + "\n";
        }
    } else if (item === Object(item)) {
        start_string += "\n";
        for (key in item) {
            start_string += pad(depth) + key + ": " + quick_format(item[key], depth + 1) + "\n";
        }
    } else {
        start_string = item;
    }
    return start_string;
}

module.exports = {
    quick_format: quick_format
}