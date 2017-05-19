# LabProject Frontend Server

The frontend server is the component that users will interact with. It communicates with one or more VM servers to build the actual networks. This server maintains user, group, permissions, allocations and other information stored in the database.

## Installation

Current installation:

1. Install bower

```
npm install -g bower
```

2. Clone repo

```
git clone https://github.com/j2h2-labproject/labproject-frontend-servers.git
```

3. Install submodule

```
git submodule init
git submodule update
cd lib/common
npm install
cd ../..
```

4. Install dependencies
```
npm install
bower install
```


## Usage

Frontend server can be run with `node frontend-server.js`. Config is in `config.js`.

## Contributing

Let me know at jacob (at) j2h2.com

## License

This project is licensed under the GNU General Public License (GPL) v3.0
