module.exports = {
	database_connection_string: 'mongodb://labproject:labprojectdbstuff2@localhost:27017/labproject',
	frontends: [
		{
			type: "web",
			config: {
				port: 8091
			}
		}
	],
	vm_servers: {
		name: "socket_io_transport",
		hosts: [
			{
				name: 'test',
				host: '127.0.0.1',
				port: 8090,
				clientkey: 'test'
			}
		]
	}
};
