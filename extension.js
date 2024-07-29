const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { save, getCodeSnippets, deleteCode, FILE_PATH, getLanguageList } = require('./service');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	const disposable1 = vscode.commands.registerCommand('code-snippet.save', () => {

		// 获取当前编辑器
		const editor = vscode.window.activeTextEditor;

		if (!editor) return;

		// 获取当前编辑器中的选中区域
		let selection = editor.selection;
		// 根据选中区域获取选中内容
		let selectedCode = editor.document.getText(selection);

		// 创建webview面板
		const panel = vscode.window.createWebviewPanel(
			'code',
			'预览代码',
			vscode.ViewColumn.Two,
			{
				enableScripts: true
			}
		);

		// 加载html文件
		panel.webview.html = fs.readFileSync(
			path.resolve(context.extensionPath, 'html/preview.html'),
			'utf8').toString();

		// 向html文件传递数据
		panel.webview.postMessage(selectedCode);

		// 监听当前编辑器选中区域变化
		vscode.window.onDidChangeTextEditorSelection((event) => {
			// 获取当前编辑器选中区域
			const selection = event.selections[0];
			// 获取选中区域内容
			selectedCode = vscode.window.activeTextEditor.document.getText(selection);
			// 向html文件传递数据
			panel.webview.postMessage(selectedCode)
		});

		// 监听webview里发送过来的数据
		panel.webview.onDidReceiveMessage(async (message) => {

			// 判断是否是保存
			if (message.type === 'save') {

				// 弹出输入框，让用户输入代码片段名称
				const value = await vscode.window.showInputBox({
					placeHolder: '请输入代码片段名称',
				});

				if (!value) return;

				const languages = getLanguageList();

				const quickPick = vscode.window.createQuickPick();

				quickPick.value = message.language;
				quickPick.items = languages.map(item => ({ label: item }));
				quickPick.show();

				const language = await new Promise(resolve => {
					quickPick.onDidChangeSelection(async () => {
						quickPick.hide();
						resolve(quickPick.selectedItems[0].label);
					});
				});


				if (!languages.includes(language)) {
					vscode.window.showErrorMessage('请选择当前支持的语言');
					return;
				}
				

				if (!language) return;

				// 保存代码片段
				save(value, language === 'default' ? message.language : language, message.code, context);
				// 关闭webview面板
				panel.dispose();
			}
		});
	});

	const disposable2 = vscode.commands.registerCommand('code-snippet.insert', () => {

		// 获取当前编辑器
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;
		// 获取当前编辑器中的文档标识，为后面插入代码做准备
		const currentTextDocumentFileUri = vscode.window.activeTextEditor.document.uri;
		// 获取当前编辑器中的选中区域
		const curPosition = editor.selection.active;

		// 获取本地已保存的所有代码片段
		const codeSnippets = getCodeSnippets(context);

		// 创建webview面板
		const panel = vscode.window.createWebviewPanel(
			'insert_code',
			'插入代码片段',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true
			}
		);

		// 加载html文件
		panel.webview.html = fs.readFileSync(
			path.resolve(context.extensionPath, 'html/list.html'),
			'utf8').toString();

		// 把当前所有代码片段传递给html文件
		panel.webview.postMessage(codeSnippets)

		// 监听webview里发送过来的数据
		panel.webview.onDidReceiveMessage(async (message) => {
			// 判断是否是插入
			if (message.type === 'insert') {

				// 关闭webview面板
				panel.dispose();

				// 切换到最开始的编辑文件中
				const document = await vscode.window.showTextDocument(
					currentTextDocumentFileUri,
					{ selection: new vscode.Range(curPosition, curPosition) }
				);

				// 在最开始的光标处插入选中的代码片段
				await document.edit(function (builder) {
					builder.insert(curPosition, message.code);
				})

				// 选中当前插入的代码片段
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
	});

	const disposable3 = vscode.commands.registerCommand('code-snippet.export', async () => {
		// 选择存放代码片段的文件夹
		const value = await vscode.window.showOpenDialog({
			canSelectFiles: false,
			canSelectFolders: true,
			canSelectMany: false,
		});

		if (value.length === 0) return;

		const dirPath = value[0].fsPath;

		const fileContent = fs.readFileSync(
			path.resolve(context.extensionPath, FILE_PATH),
			'utf8',
		);

		fs.writeFileSync(
			path.resolve(dirPath, 'snippets.code-snippets'),
			fileContent,
		);

		vscode.window.showInformationMessage('导出成功');
	});

	const disposable4 = vscode.commands.registerCommand('code-snippet.import', async () => {

		// 选择文件
		const value = await vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: false,
		});

		if (value.length === 0) return;

		const filePath = value[0].fsPath;

		const content = fs.readFileSync(filePath, 'utf8').toString();

		fs.writeFileSync(
			path.resolve(context.extensionPath, FILE_PATH),
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
