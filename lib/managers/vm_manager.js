var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var vm_server_client = null;

var xml_builder = require('xmlbuilder');
var uuid = require('uuid');

var sanitize = require(LABPROJECT_LIB + '/common/sanitize');
var common_crypto = require(LABPROJECT_LIB + '/common/crypto');
var database = require(LABPROJECT_LIB + '/util/database');
var hypervisor_string = require(LABPROJECT_LIB + '/common/hypervisor_string');
var string_util = require(LABPROJECT_LIB + '/common/string');

module.exports = {
	initialize: function(new_client) {
		vm_server_client = new_client;
	},
	new_vm: function(vm_server, name, callback) {
		if (vm_server_client === null) {
			callback(new Error("initialize function must be run first"), null);
		} else {
			create_new_vm(vm_server, name, callback);
		}
	},
	get_vm: function(uuid, callback) {
		if (vm_server_client === null) {
			callback(new Error("initialize function must be run first"), null);
		} else {
			var return_vm = new virtual_machine(uuid, vm_server_client);
			return_vm.load(function(error, result) {
				if (error) {
					callback(error, null);
				} else {
					callback(null, return_vm);
				}
			});
		}
	},
	delete_vm: function(uuid, callback) {
		if (vm_server_client === null) {
			callback(new Error("initialize function must be run first"), null);
		} else {
			var delete_vm = new virtual_machine(uuid, vm_server_client);
			delete_vm.delete(function(error, result) {
				callback(error, result);
			});
		}
	}
}

function generate_vm_id() {
	return uuid.v1();
}

function create_new_vm(vm_server, name, callback) {
	var vm_id = generate_vm_id();
	var new_vm_obj = new virtual_machine(vm_id, vm_server_client);

	new_vm_obj.init(function(i_error, status) {
		if (!i_error && status === true) {
			new_vm_obj.set_vm_server(vm_server);
			new_vm_obj.set_name(name);

			new_vm_obj.save(function(s_error, result) {
				if (!s_error) {
						callback(null, new_vm_obj);
				} else {
						callback(s_error, null);
				}

			});
		} else {
			if (i_error.name === "MongoError" && i_error.code === 11000) {
				create_new_vm(username, callback);
			} else {
				callback(i_error, null);
			}
		}
	});
}

function is_hd_type(value) {
	var valid_disks = ['raw','bochs','cloop','cow','dmg','iso','qcow','qcow2','qed','vmdk','vpc', 'vdi'];

	if (valid_disks.indexOf(value)!=-1) {
		return true;
	} else {
		return false;
	}
}

function virtual_machine(uuid, server_client) {
	var self = this;

	var Private = {
		uuid: uuid,
		name: null,
		description: '',
		hypervisor: null,
		owner: null,
		tags: [],
		template: false,
		vm_server: null,
		users_use: [],
		users_edit: [],
		groups_use: [],
		groups_edit: [],
		// VM config
		mem_size: null,
		cpu_count: 1,
		platform: 'x32',
		hd_list: {},
		cdrom_list: {},
		interface_list: {},
		features: {
			acpi: true,
			apic: true,
			pae: true
		},
		display: null,
		xml_config: '',
		defined: false
	};


	self.init = function(callback) {
		database.insert('registered_devices', {"uuid": Private.uuid}, function(error, result) {
			if (!error) {
				callback(null, true);
			} else {
				callback(new Error("Device insert failed"), null);
			}
		});
	}

	self.load = function(callback) {
		database.findOne('registered_devices', {"uuid": Private.uuid}, function(d_error, result) {
			if (result) {

				Private = result;

				callback(null, true);

			} else if (d_error) {
				callback(d_error, null);
			} else {
				callback(new Error("User does not exist"), null);
			}
		});
	}

	self.save = function(callback) {
		database.update('registered_devices', {"uuid": Private.uuid}, Private, false, function(error, result) {
			if (!error) {
				callback(null, true);
			} else {
				callback(new Error("Device update failed"), null);
			}
		});
	}

	self.delete = function(callback) {
		database.remove('users', {"uuid": Private.uuid}, function(error, result) {
			if (!error) {
				callback(null, true);
			} else {
				callback(new Error("Device delete failed"), null);
			}
		});
	}

	self.get_uuid = function() {
		return Private.uuid;
	};

	self.get_name = function() {
		return Private.name;
	}

	self.set_name = function(name) {
		name = sanitize.simple_text(name);
		Private.name = name;
	}

	self.get_description = function() {
		return Private.description;
	};

	self.set_description = function(description) {
		description = sanitize.simple_text(description);
		Private.description = description;
	};

	self.get_hypervisor = function() {
		return Private.hypervisor;
	};

	self.set_hypervisor = function(hypervisor) {
		if (hypervisor_string.is_hypervisor(hypervisor)) {
			Private.hypervisor = hypervisor;
			return true;
		} else {
			return false;
		}
	};

	self.get_vm_server = function() {
		return Private.vm_server;
	};

	self.set_vm_server = function(vm_server) {
		vm_server = sanitize.simple_string(vm_server);
		Private.vm_server = vm_server;
	};

	self.get_owner = function() {
		return Private.owner;
	};

	self.set_owner = function(username) {
		username = sanitize.simple_string(username);
		Private.owner = username;
	};

	self.state = {
		is_defined: function() {
			return Private.defined;
		},
		define: function(callback) {
			var xml_config = generate_xml();
			if (xml_config !== null) {
				console.log(xml_config);
				var encoded_xml = string_util.base64_encode(xml_config);
				server_client.call(Private.vm_server, "create_vm", {xmlconfig: encoded_xml}, function(s_error, result) {
					if (!s_error) {
						Private.xml_config = string_util.base64_decode(result.xmlconfig);
						Private.defined = true;
						
						self.save(function(s_error, result) {
							console.log("CONFIG", Private.xml_config);
							callback(null, result);
						});

					} else {
						callback(s_error, null);
					}
				});
			} else {
				callback(new Error("Failed to create configuration", null));
			}
		},
		undefine: function(callback) {

		},
		update: function(callback) {

		},
		start: function(callback) {

		},
		stop: function(callback) {

		},
		force_stop: function(callback) {

		}
	};

	self.config = {
		get_mem_size: function() {
			return Private.mem_size;
		},
		set_mem_size: function(mem) {
			if (Number.isInteger(mem)) {
				Private.mem_size = mem;
			} else {

			}
		},
		get_cpu_count: function() {
			return Private.cpu_count;
		},
		set_cpu_count: function(cpu_count) {
			if (Number.isInteger(cpu_count)) {
				Private.cpu_count = cpu_count;
			} else {

			}
		},
		get_platform: function() {
			return Private.platform;
		},
		set_platform: function(platform) {
			if (platform == "x32" || platform == "x64") {
				Private.platform = platform;
			} else {

			}
		},
		add_new_hd: function(name, size, type) {
			name = sanitize.simple_string(name);
			if (!Number.isInteger(size)) {

			} else if (Private.hd_list.hasOwnProperty(name)) {

			} else {
				var target_num = Private.hd_list.length;
				var hd_letter = String.fromCharCode(97 + target_num);

				Private.hd_list[name] = {"size": size, "type": type, "exists": false, "target": "sd" + hd_letter};
			}
		},
		add_existing_hd: function(name) {

		},
		remove_hd: function(name) {

		},
		add_cd: function(name, iso) {
			name = sanitize.simple_string(name);

			if (Private.cdrom_list.hasOwnProperty(name)) {

			} else {
				var target_num = Private.cdrom_list.length;
				var cdrom_letter = String.fromCharCode(97 + target_num);

				Private.hd_list[name] = {"iso": iso, "target": "hd" + cdrom_letter};
			}
		},
		remove_cd: function(name) {

		},
		get_display: function() {
			return Private.display;
		},
		set_display: function(display) {
			if (Private.hypervisor !== null) {
				if (display != "vnc" && display != "local" && display != "rdp") {

				} else if (((display == "rdp" || display == "local") && Private.hypervisor == "vbox") || (display == "vnc" && Private.hypervisor == "qemu")) {
					Private.display = display;
				} else {

				}
			}
		}
	};

	function generate_xml() {

		for (item in Private) {
			if (Private[item] === null) {
				return null;
			}
		}

		var root = xml_builder.create('domain',{},{},{headless:true});

		root.att('type', Private.hypervisor);
		root.ele('name', {}, Private.name);
		root.ele('uuid', {}, Private.uuid);
		root.ele('description', {}, Private.description);

		// Set the memory
		root.ele('memory', {'unit':'MiB'}, Private.mem_size);
		root.ele('currentMemory', {'unit':'MiB'}, Private.mem_size);

		// Set the number of cpus
		root.ele('vcpu', {'placement':'static'}, Private.cpu_count);

		var os_ele = root.ele('os');

		os_ele.ele('type','hvm');

		// Set the boot order
		os_ele.ele('boot',{'dev':'cdrom'});
		os_ele.ele('boot',{'dev':'hd'});

		// Set the features section
		var features_ele = root.ele('features');

		if (Private.features.acpi === true) {
			features_ele.ele('acpi');
		}
		if (Private.features.apic === true)	{
			features_ele.ele('apic');
		}
		if (Private.features.pae === true) {
			features_ele.ele('pae');
		}

		// Set reactions to shutdowns and restarts
		root.ele('on_poweroff',{},'destroy');
		root.ele('on_reboot',{},'restart');
		root.ele('on_crash',{},'restart');


		// Set the devices
		var device_ele = root.ele('devices');

		// Add the vm input method
		device_ele.ele('input',{'type':'tablet','bus':'usb'});

		// Set the display
		if (Private.display == "local") {
			device_ele.ele('graphics',{'type':'desktop'});
		} else if (Private.display == "vnc") {
			var vnc_ele = device_ele.ele('graphics',{'type':'vnc','autoport':'yes','sharePolicy':'force-shared'});
			vnc_ele.ele('input',{'type':'address', 'address':'{SERVER_IP}}'});
		} else if (Private.display == "rdp") {
			device_ele.ele('graphics',{'type':'rdp','autoport':'yes','multiUser':'yes'});
		}

		// Add the disks
		for (hd_name in Private.hd_list) {
			var current = Private.hd_list[hd_name];
			var hd_device_ele = device_ele.ele('disk',{'type':'file','snapshot':'external', 'device':'disk'});
			hd_device_ele.ele('source',{'file': '{STORAGE_POOL}/' + hd_name + "." + current.type});
			hd_device_ele.ele('target',{'dev':current.target, 'bus':'sata'});
		}

		// Add the cdrom drives
		for (cdrom_name in Private.cdrom_list) {
			var current = Private.cdrom_list[cdrom_name];
			var cd_device_ele = device_ele.ele('disk',{'type':'file','device':'cdrom'});
			cd_device_ele.ele('target',{'dev':current.target, 'bus':'ide'});
			cd_device_ele.ele('source',{'file': current.iso});
			cd_device_ele.ele('readonly');
		}


		return root.end({ pretty: true});

	}


}
