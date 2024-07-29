const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { save, getList, deleteCode, FILE_NAME, getLanguageList } = require('./service');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	const disposable1 = vscode.commands.registerCommand('code-snippet.save', function () {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			let selection = editor.selection;
			let selectedCode = editor.document.getText(selection);
			const panel = vscode.window.createWebviewPanel(
				'code',
				'预览代码',
				vscode.ViewColumn.Two,
				{
					enableScripts: true
				}
			);

			panel.webview.html = fs.readFileSync(
				path.resolve(context.extensionPath, 'html/preview.html'),
				'utf8').toString();

			panel.webview.postMessage(selectedCode)

			vscode.window.onDidChangeTextEditorSelection((event) => {
				const selection = event.selections[0];
				selectedCode = vscode.window.activeTextEditor.document.getText(selection);
				panel.webview.postMessage(selectedCode)
			});

			panel.webview.onDidReceiveMessage(async (message) => {
				if (message.type === 'save') {
					const value = await vscode.window.showInputBox({
						placeHolder: '请输入代码片段名称',
					});

					if (!value) return;

					const language = await vscode.window.showQuickPick(
						getLanguageList(),
						{ placeHolder: `选择语言，默认是：${message.language}` }
					);

					if (!language) return;

					save(value, language === 'default' ? message.language : language, message.code, context);
					panel.dispose();
				}
			});

			panel.onDidDispose(function () {
				panel.dispose();
			});
		}
	});

	const disposable2 = vscode.commands.registerCommand('code-snippet.insert', () => {

		const editor = vscode.window.activeTextEditor;
		const currentTextDocumentFileUri = vscode.window.activeTextEditor.document.uri;

		let curPosition;

		if (editor) {
			curPosition = editor.selection.active;
		}

		const codes = getList(context);

		const panel = vscode.window.createWebviewPanel(
			'insert_code',
			'插入代码片段',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true
			}
		);

		panel.webview.html = fs.readFileSync(
			path.resolve(context.extensionPath, 'html/list.html'),
			'utf8').toString();

		panel.webview.postMessage(codes)

		panel.webview.onDidReceiveMessage(async (message) => {
			if (message.type === 'insert') {
				// save(message.language, message.code, context)

				panel.dispose();

				const document = await vscode.window.showTextDocument(
					currentTextDocumentFileUri,
					{ selection: new vscode.Range(curPosition, curPosition) }
				);

				await document.edit(function (builder) {
					builder.insert(curPosition, message.code);
				})

				const lines = message.code.split('\n')

				const endPosition = new vscode.Position(
					curPosition.line + lines.length, lines[lines.length - 1].length);

				document.selection = new vscode.Selection(curPosition, endPosition);
			} else if (message.type === 'delete') {
				deleteCode(message.id, context)
			}
		});


		panel.onDidDispose(function () {
			panel.dispose();
		});
		// Display a message box to the user
	});

	const disposable3 = vscode.commands.registerCommand('code-snippet.export', async () => {

		const value = await vscode.window.showOpenDialog({
			canSelectFiles: false,
			canSelectFolders: true,
			canSelectMany: false,
		});

		if (value.length === 0) return;

		const dirPath = value[0].fsPath;


		const codes = getList(context);

		fs.writeFileSync(
			path.resolve(dirPath, 'code-snippet.json'),
			JSON.stringify(codes),
		);

		vscode.window.showInformationMessage('导出成功');
	});

	const disposable4 = vscode.commands.registerCommand('code-snippet.import', async () => {

		const value = await vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: false,
		});

		if (value.length === 0) return;

		const filePath = value[0].fsPath;

		const content = fs.readFileSync(filePath, 'utf8').toString();

		fs.writeFileSync(
			path.resolve(context.extensionPath, FILE_NAME),
			content,
		);

		vscode.window.showInformationMessage('导入成功');
	});

	context.subscriptions.push(disposable1);
	context.subscriptions.push(disposable2);
	context.subscriptions.push(disposable3);
	context.subscriptions.push(disposable4);

}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
