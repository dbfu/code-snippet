
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const CommandManager = require('./commands');
const { getCodeSnippets } = require('./service');
const { getPersonalToken, genCodeSnippetFile, getTeamToken, genTeamCodeSnippetFile } = require('./utils');
const PublicTreeViewProvider = require('./treeDataProvider/publicTreeDataProvider');
const PersonalTreeViewProvider = require('./treeDataProvider/personalTreeDataProvider');
const { public_token, public_code_snippet_file_path, personal_code_snippet_file_path, team_code_snippet_file_path } = require('./type');
const TeamTreeViewProvider = require('./treeDataProvider/teamTreeDataProvider');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let personalToken = getPersonalToken();
	vscode.commands.executeCommand('setContext', 'personalToken', !!personalToken);

	const publicTreeViewProvider = new PublicTreeViewProvider();
	vscode.window.createTreeView('code-snippet.public', {
		treeDataProvider: publicTreeViewProvider
	});

	const personalTreeViewProvider = new PersonalTreeViewProvider();
	vscode.window.createTreeView('code-snippet.personal', {
		treeDataProvider: personalTreeViewProvider
	});

	const teamTreeViewProvider = new TeamTreeViewProvider();
	vscode.window.createTreeView('code-snippet.team', {
		treeDataProvider: teamTreeViewProvider
	});


	vscode.workspace.onDidChangeConfiguration(async e => {
		if (!e.affectsConfiguration('personal.gitee.token')) return;

		personalToken = getPersonalToken();
		vscode.commands.executeCommand('setContext', 'personalToken', !!personalToken);
		personalTreeViewProvider.refresh();

		if (!personalToken) {
			fs.writeFileSync(path.join(context.extensionPath, personal_code_snippet_file_path), '');
		};
	});

	vscode.workspace.onDidChangeConfiguration(async e => {
		if (!e.affectsConfiguration('team.gitee.token')) return;

		teamTreeViewProvider.refresh();

		const teams = getTeamToken();
		if (!teams || teams.filter(o => o.name && o.token).length === 0) {
			fs.writeFileSync(path.join(context.extensionPath, team_code_snippet_file_path), '');
			return;
		};

		await genTeamCodeSnippetFile(teams, getCodeSnippets, context);

		const value = await vscode.window.showInformationMessage(
			'检测到个人令牌配置变更，代码片段文件生成成功，vscode刷新后生效。',
			{
				modal: true
			},
			'立即刷新',
			'暂不刷新'
		);
		if (value === '立即刷新') {
			vscode.commands.executeCommand('workbench.action.reloadWindow');
		}
	})

	const commandManager = new CommandManager(
		context,
		personalTreeViewProvider,
		publicTreeViewProvider,
		teamTreeViewProvider,
	);

	commandManager.getCommands().forEach(c => {
		context.subscriptions.push(
			vscode.commands.registerCommand(c.command, c.fn)
		);
	});

	checkPublicCodeSnippetFileAndCreate(context);
}

async function checkPublicCodeSnippetFileAndCreate(context) {
	const filePath = path.join(context.extensionPath, public_code_snippet_file_path);
	const content = fs.readFileSync(filePath, 'utf-8').toString();

	if (!content) {
		const data = await getCodeSnippets(public_token);
		genCodeSnippetFile(data, 'cs_公开_', public_code_snippet_file_path, context);

		vscode.window.showInformationMessage('代码片段文件生成成功，刷新vscode后生效。', {
			modal: true
		}, '立即刷新', '暂不刷新').then(value => {
			if (value === '立即刷新') {
				vscode.commands.executeCommand('workbench.action.reloadWindow');
			}
		});
	}
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
