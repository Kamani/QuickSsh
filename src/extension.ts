import * as vscode from 'vscode';
import { SshListProvider, SshNode } from './quickSsh';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

	if (vscode.extensions.getExtension("NiravKamani.quickssh")?.extensionPath !== undefined) {
		const quickSshProvider = new SshListProvider(path.join(vscode.extensions.getExtension("NiravKamani.quickssh")?.extensionPath!, 'sshList.json'));
		vscode.window.registerTreeDataProvider('quickSshExplorer', quickSshProvider);
	}

	vscode.commands.registerCommand('quickSshExplorer.connectWithActiveTerminal', (node: SshNode) => {
		execute(vscode.window.activeTerminal, node);
	});

	vscode.commands.registerCommand('quickSshExplorer.connect', (node: SshNode) => {
		execute(vscode.window.createTerminal(node.label), node);
	});

	function execute(terminal: vscode.Terminal | undefined, node: SshNode): void {
		var serverValues = node.id?.split(";");
		terminal?.show();
		terminal?.sendText("ssh " + serverValues![1] + "@" + serverValues![0], true);
		setTimeout(() => {
			terminal?.sendText(serverValues![2], true);
		}, 2000);
	}
}

export function deactivate() { }