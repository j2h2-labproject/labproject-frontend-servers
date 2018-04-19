# Permissions

LabProject attempts to simplfy permission as much as possible with giving the must flexibility. Permissions are checked in controllers.

The following is the current list of permissions.

| Permission     | Description  |
| ------------------- | -------------------------------- |
| `superuser`     | Essentially "root" permissions. Is allowed to do any action |
| `create_vms`    | Can create VMs on any VM server. Users are always allowed to delete, manage and set permissions for VMs they create. However, they must have `use_vms` to start/stop VM and view the VM console. |
| `create_labs`   | Can create a lab. Users are always allowed to delete, manage and set permissions for labs they create. |
| `create_groups` | Can create user groups. Users are always allowed to delete, manage and set permissions for groups they create. Users that create a group can also add and remove users from the group. |
| `use_vms`       | Can start and stop VMs as well as access a VMs console. This is a broad allowing VMs in LabProject. However, users can only access VMs they have been given access to. VMs have their own permissions. |
| `admin_vms`     | Can modify, start, stop, view consoles of, and control the VMs of all users. |