import * as vscode from 'vscode';
import * as fs from 'fs';

export class SshListProvider implements vscode.TreeDataProvider<SshNode> {

	private _onDidChangeTreeData: vscode.EventEmitter<SshNode | undefined> = new vscode.EventEmitter<SshNode | undefined>();
	readonly onDidChangeTreeData: vscode.Event<SshNode | undefined> = this._onDidChangeTreeData.event;

	constructor(private sshListFilePath: string) {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: SshNode): vscode.TreeItem {
		return element;
	}

	getChildren(element?: SshNode): Thenable<SshNode[]> {
		return Promise.resolve(this.getDepsInPackageJson(this.sshListFilePath, element));

		// vscode.window.showInformationMessage('Workspace has no package.json');
		// return Promise.resolve([]);
	}


	private getDepsInPackageJson(sshListFilePath: string, element?: SshNode): SshNode[] {

		const packageJson = JSON.parse(fs.readFileSync(sshListFilePath, 'utf-8'));

		const toSshNode = (serverConfig: string, state: vscode.TreeItemCollapsibleState, id?: string, description?: string): SshNode => {
			return new SshNode(serverConfig, state, id, description);
		};

		if (element === undefined) {
			return packageJson.servers
				? Object.keys(packageJson.servers).map(dep => toSshNode(dep, vscode.TreeItemCollapsibleState.Collapsed))
				: [];
		}
		else {

			if (packageJson.servers.hasOwnProperty(element.label)) {
				let devServerList = packageJson.servers[element.label] as Array<ServerInfo>;
				return devServerList.map(server => toSshNode(server.aliasName, vscode.TreeItemCollapsibleState.None, server.host + ";" + server.user + ";" + server.pwd, server.host));
			}

			return packageJson.servers
				? Object.keys(packageJson.servers).map(dep => toSshNode(dep, vscode.TreeItemCollapsibleState.Collapsed))
				: [];
		}
	}
}

export class SshNode extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly id?: string,
		public readonly description?: string
	) {
		super(label, collapsibleState);

		if (collapsibleState === vscode.TreeItemCollapsibleState.None) {
			this.contextValue = 'sshnode';
		}
	}
}

export class ServerInfo {
	aliasName: string;
	host: string;
	port: number;
	user: string;
	pwd: string;

	constructor(aliasName: string, host: string, port: number, user: string, pwd: string) {
		this.aliasName = aliasName;
		this.host = host;
		this.port = port;
		this.user = user;
		this.pwd = pwd;
	}
}