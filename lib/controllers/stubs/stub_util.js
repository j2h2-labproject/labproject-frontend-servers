module.exports = {
    get_username(session_id) {
        var id_split = session_id.split("-");
        if (id_split.length > 1) {
            return id_split[0];
        } else {
            return "";
        }
    }
}