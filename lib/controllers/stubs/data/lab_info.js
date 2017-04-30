module.exports = {
    "admin_test_lab_1": {
        diagram: {  
            objects: [
                {"label":"Server 1", "x":80,"y":75,"uuid":"test1","display_type":"server"},
                {"label":"Switch 1", "x":571,"y":82,"uuid":"test2","display_type":"switch"},
                {"label":"Router 1", "x":971,"y":378,"uuid":"test3","display_type":"router"}
            ],
            connections: [
                {"id":"test1-test2","uuid1":"test1","uuid2":"test2"},
                {"id":"test3-test2","uuid1":"test3","uuid2":"test2"}
            ]
        },
        name: "Test Lab 1",
        running: true,
        owner: 'admin'
    },
    "admin_test_lab_2": {
        diagram: {
            objects:[
                {"label":"Server 1","x":250,"y":131,"uuid":"test1","display_type":"server"},
                {"label":"Switch 1","x":250,"y":250,"uuid":"test2","display_type":"switch"},
                {"label":"Desktop 1","x":95.5,"y":337,"uuid":"test3","display_type":"desktop"},
                {"label":"Desktop 2","x":383.5,"y":336,"uuid":"test4","display_type":"desktop"}
            ],
            connections:[
                {"id":"test1-test2","uuid1":"test1","uuid2":"test2"},
                {"id":"test3-test2","uuid1":"test3","uuid2":"test2"},
                {"id":"test4-test2","uuid1":"test4","uuid2":"test2"}
            ]
        },
        name: "Test Lab 2",
        running: false,
        owner: 'admin'
    }
}