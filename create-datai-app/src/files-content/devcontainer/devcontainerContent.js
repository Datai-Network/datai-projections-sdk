module.exports = `// For format details, see https://aka.ms/devcontainer.json. For config options, see the
// README at: https://github.com/devcontainers/templates/tree/main/src/go
{
	"name": "Projections devcontainer",
	"dockerComposeFile": ["../../docker-compose.yml", "docker-compose.devcontainer.yml"],
	"runServices": ["projections"],

	"service": "projections",
    "workspaceFolder": "/workspace/projections",

	// Overrides
	"mounts": [
		"source=./projections,target=/workspace/projections,type=bind,consistency=cached",
		"source=./API,target=/workspace/API,type=bind,consistency=cached"
	],
	"overrideCommand": true,
	"remoteUser": "node",

	// force recreate if same container was started in docker compose
	"initializeCommand": "docker rm -f projections 2>/dev/null || true",
	"updateContentCommand": "yarn install",
	"shutdownAction": "stopCompose",


	// [Optional] Required for ptrace-based debuggers like C++, Go, and Rust
	// "capAdd": ["SYS_PTRACE"],
	// "securityOpt": [ "seccomp=unconfined" ],

	// Use 'postCreateCommand' to run commands after the container is created.
	// "postCreateCommand": "go version",

	// Comment out to connect as root instead. More info: https://aka.ms/vscode-remote/containers/non-root.
	// "remoteUser": "vscode",

	// Use 'forwardPorts' to make a list of ports inside the container available locally.
	//"forwardPorts": [9000, "db:5432"],

	// Use 'portsAttributes' to set default properties for specific forwarded ports. 
	// More info: https://containers.dev/implementors/json_reference/#port-attributes
	// "portsAttributes": {
	// 	"9000": {
	// 		"label": "Hello Remote World",
	// 		"onAutoForward": "notify"
	// 	}
	// },


	// Configure tool-specific properties.
	"customizations": {
	// 	// Configure properties specific to VS Code.
		"vscode": {
			"settings": {
				"terminal.integrated.splitCwd": "workspaceRoot",
				"terminal.integrated.defaultProfile.linux": "JavaScript Debug Terminal",
				"eslint.rules.customizations": [{ "rule": "*", "severity": "warn" }],
				"eslint.validate": [
				  "javascript",
				  "javascriptreact",
				  "typescript",
				  "typescriptreact"
				],
				"editor.defaultFormatter": "esbenp.prettier-vscode",
				"editor.formatOnType": false, // required
				"editor.formatOnPaste": true, // optional
				"editor.formatOnSave": true, // optional
				"editor.formatOnSaveMode": "file", // required to format on save
				"editor.tabSize": 2
			},
			"extensions": [
				"graphql.vscode-graphql",
				"graphql.vscode-graphql-syntax",
				"pbkit.vscode-pbkit",
				"esbenp.prettier-vscode",
				"dbaeumer.vscode-eslint"
			]
		}
	}
}`
