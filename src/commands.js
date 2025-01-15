const vscode = require('vscode');

const {
  CommandName,
  public_code_snippet_file_path,
  personal_code_snippet_file_path,
  public_token,
} = require('./type');
const {
  createCodeSnippet,
  getCodeSnippetById,
  deleteCodeSnippetById,
  getCodeSnippets,
  publicCodeSnippet,
  notPublicCodeSnippet,
} = require('./service');
const {
  getPersonalToken,
  getCodeSnippetInfo,
  genCodeSnippetFile,
  genTeamCodeSnippetFile,
  getSnippetDescriptionByAI,
  getSnippetTitleByAI,
} = require('./utils');

class CommandManager {
  constructor(
    context,
    personalTreeDataProvider,
    publicTreeDataProvider,
    teamTreeDataProvider,
  ) {
    this.openedDocumentMap = new Map();
    this.newOpenedEditor = null;
    this.activeEditor = null;

    this.personalTreeDataProvider = personalTreeDataProvider;
    this.publicTreeDataProvider = publicTreeDataProvider;
    this.teamTreeDataProvider = teamTreeDataProvider;
    this.context = context;

    this.listen();

    this.editSelectionCode = this.editSelectionCode.bind(this);
    this.previewCodeSnippet = this.previewCodeSnippet.bind(this);
    this.createCodeSnippet = this.createCodeSnippet.bind(this);
    this.createCodeSnippetBySelectionCode = this.createCodeSnippetBySelectionCode.bind(this);
    this.refreshPublicTreeView = this.refreshPublicTreeView.bind(this);
    this.genPublicCodeSnippetFile = this.genPublicCodeSnippetFile.bind(this);
    this.refreshPersonalTreeView = this.refreshPersonalTreeView.bind(this);
    this.genPersonalCodeSnippetFile = this.genPersonalCodeSnippetFile.bind(this);
    this.refreshTeamTreeView = this.refreshTeamTreeView.bind(this);
    this.genTeamCodeSnippetFile = this.genTeamCodeSnippetFile.bind(this);
    this.copyCodeSnippet = this.copyCodeSnippet.bind(this);
    this.insertCodeSnippet = this.insertCodeSnippet.bind(this);
    this.deleteCodeSnippet = this.deleteCodeSnippet.bind(this);
    this.publicCodeSnippet = this.publicCodeSnippet.bind(this);
    this.notPublicCodeSnippet = this.notPublicCodeSnippet.bind(this);

  }

  listen() {
    // 监听当前编辑器选中区域变化
    vscode.window.onDidChangeTextEditorSelection(async (event) => {
      if (event.textEditor !== this.activeEditor || !this.newOpenedEditor) return;
      this.newOpenedEditor.edit((editBuilder) => {
        const fullRange =
          new vscode.Range(
            new vscode.Position(0, 0),
            new vscode.Position(this.newOpenedEditor.document.lineCount, 0)
          )
        const selection = event.selections[0];
        const selectedCode = this.activeEditor.document.getText(selection);
        editBuilder.replace(fullRange, selectedCode);
      })
    });

    vscode.workspace.onDidCloseTextDocument(doc => {
      if (this.newOpenedEditor === doc) {
        this.newOpenedEditor = null;
      }

      [...this.openedDocumentMap.entries()].forEach(entity => {
        const [key, value] = entity;
        if (value === doc) {
          this.openedDocumentMap.delete(key);
        }
      })
    })
  }

  async previewCodeSnippet(id, languageId, token) {
    let document = this.openedDocumentMap.get(id);

    if (document && !document.isClosed) {
      await vscode.window.showTextDocument(
        this.openedDocumentMap.get(id)
      );
    } else {

      let { data: snippet } = await getCodeSnippetById(id, token);

      snippet = getCodeSnippetInfo(snippet);

      document = await vscode.workspace.openTextDocument({
        content: snippet.code,
        language: languageId,
      });

      await vscode.window.showTextDocument(document, {
        viewColumn: vscode.ViewColumn.Active,
      });

      this.openedDocumentMap.set(id, document);
    }
  }

  async editSelectionCode() {
    // 获取当前打开的活动文档
    const activeEditor = vscode.window.activeTextEditor;

    if (activeEditor) {
      const currentDocument = activeEditor.document;
      // 打开当前文档
      try {
        const document = await vscode.workspace.openTextDocument({
          language: currentDocument.languageId,
          content: currentDocument.getText(activeEditor.selection),
        });
        // 在新的标签页中显示文档
        this.newOpenedEditor = await vscode.window.showTextDocument(document, {
          viewColumn: vscode.ViewColumn.Beside // 在旁边打开新的标签页
        });

        this.activeEditor = activeEditor;
      } catch (error) {
        vscode.window.showErrorMessage('无法打开文件: ' + error);
      }
    } else {
      vscode.window.showInformationMessage('没有活动编辑器打开');
    }
  }

  async createCodeSnippet() {
    const activeEditor = vscode.window.activeTextEditor;
    const code = activeEditor.document.getText();
    this._createCodeSnippet(code, activeEditor.document.languageId);
  }

  async refreshPublicTreeView() {
    this.publicTreeDataProvider.refresh();
  }

  async genPublicCodeSnippetFile() {
    genCodeSnippetFile(
      this.publicTreeDataProvider.data,
      "cs_公开_",
      public_code_snippet_file_path,
      this.context,
    );

    const value = await vscode.window.showInformationMessage('公开代码片段文件生成成功，刷新vscode后生效。', {
      modal: true
    }, '立即刷新', '暂不刷新');
    if (value === '立即刷新') {
      vscode.commands.executeCommand('workbench.action.reloadWindow');
    }
  }

  async refreshPersonalTreeView() {
    this.personalTreeDataProvider.refresh();
  }

  async genPersonalCodeSnippetFile(message) {

    const personalToken = getPersonalToken();

    if (!personalToken) return;

    const data = await getCodeSnippets(
      personalToken
    );

    genCodeSnippetFile(
      data,
      "cs_个人_",
      personal_code_snippet_file_path,
      this.context,
    );

    const value = await vscode.window.showInformationMessage(
      message && typeof message === 'string' ? message : '个人代码片段文件生成成功，刷新vscode后生效。',
      {
        modal: true
      },
      '立即刷新',
      '暂不刷新'
    );
    if (value === '立即刷新') {
      vscode.commands.executeCommand('workbench.action.reloadWindow');
    }
  }

  async refreshTeamTreeView() {
    this.teamTreeDataProvider.refresh();
  }

  async genTeamCodeSnippetFile(message) {
    await genTeamCodeSnippetFile(
      this.teamTreeDataProvider.teams,
      getCodeSnippets,
      this.context
    );

    const value = await vscode.window.showInformationMessage(
      message || '团队代码片段文件生成成功，刷新vscode后生效。',
      {
        modal: true
      },
      '立即刷新',
      '暂不刷新'
    );
    if (value === '立即刷新') {
      vscode.commands.executeCommand('workbench.action.reloadWindow');
    }
  }

  async createCodeSnippetBySelectionCode() {
    const activeEditor = vscode.window.activeTextEditor;
    const code = activeEditor.document.getText(
      new vscode.Range(
        activeEditor.selection.start,
        activeEditor.selection.end
      )
    );
    this._createCodeSnippet(code, activeEditor.document.languageId);
  }

  async copyCodeSnippet(item) {
    try {
      let { data: snippet } = await getCodeSnippetById(item.id, item.token);
      snippet = getCodeSnippetInfo(snippet);
      vscode.env.clipboard.writeText(snippet.code);
      vscode.window.showInformationMessage('代码片段已复制到剪切板');
    } catch (error) {
      vscode.window.showErrorMessage(error.message);
    }
  }

  async insertCodeSnippet(item) {
    const activeTextEditor = vscode.window.activeTextEditor;

    if (!activeTextEditor) {
      vscode.window.showErrorMessage('请先打开一个文件');
      return;
    }

    // 获取光标位置
    const cursorPosition = activeTextEditor.selection.active;

    if (!cursorPosition) {
      vscode.window.showErrorMessage('请把光标定位到需要插入代码的位置');
      return;
    }

    try {
      let { data: snippet } = await getCodeSnippetById(item.id, item.token);
      snippet = getCodeSnippetInfo(snippet);
      await activeTextEditor.insertSnippet(
        new vscode.SnippetString(snippet.code),
        cursorPosition
      );
      vscode.window.showInformationMessage('代码片段已插入到光标位置');
    } catch (error) {
      vscode.window.showErrorMessage(error.message);
    }
  }

  async deleteCodeSnippet(item) {
    try {
      await deleteCodeSnippetById(item.id, item.token);
      vscode.window.showInformationMessage('代码片段已删除');
      this.personalTreeDataProvider.refresh();
    } catch (error) {
      vscode.window.showErrorMessage(error.message);
    }
  }

  async publicCodeSnippet(item) {

    let { data: snippet } = await getCodeSnippetById(item.id, item.token);

    snippet = getCodeSnippetInfo(snippet);

    const { data } = await createCodeSnippet(
      snippet.fileName,
      snippet.code,
      snippet.languageId,
      snippet.description,
      public_token
    );

    await publicCodeSnippet(
      item.id,
      item.token,
      data.id,
      data.files,
    );

    vscode.window.showInformationMessage('代码片段已公开');
    this.personalTreeDataProvider.refresh();
    this.teamTreeDataProvider.refresh();

    this.genPublicCodeSnippetFile();
  }

  async notPublicCodeSnippet(item) {
    let { data: snippet } = await getCodeSnippetById(item.id, item.token);

    snippet = getCodeSnippetInfo(snippet);

    if (!snippet.files.publicId.content) return;

    await notPublicCodeSnippet(
      item.id,
      item.token
    );

    await deleteCodeSnippetById(snippet.files.publicId.content, public_token);

    vscode.window.showInformationMessage('你公开的代码片段已隐藏');
    this.personalTreeDataProvider.refresh();
    this.teamTreeDataProvider.refresh();
  }

  getCommands() {
    return [
      {
        command: CommandName.PreviewCodeSnippet,
        fn: this.previewCodeSnippet
      },
      {
        command: CommandName.EditSelectionCode,
        fn: this.editSelectionCode
      },
      {
        command: CommandName.CreateCodeSnippet,
        fn: this.createCodeSnippet,
      },
      {
        command: CommandName.CreateCodeSnippetBySelectionCode,
        fn: this.createCodeSnippetBySelectionCode,
      },
      {
        command: CommandName.RefreshPublicTreeView,
        fn: this.refreshPublicTreeView,
      },
      {
        command: CommandName.GenPublicCodeSnippetFile,
        fn: this.genPublicCodeSnippetFile,
      },
      {
        command: CommandName.RefreshPersonalTreeView,
        fn: this.refreshPersonalTreeView,
      },
      {
        command: CommandName.GenPersonalCodeSnippetFile,
        fn: this.genPersonalCodeSnippetFile,
      },
      {
        command: CommandName.RefreshTeamTreeView,
        fn: this.refreshTeamTreeView,
      },
      {
        command: CommandName.GenTeamCodeSnippetFile,
        fn: this.genTeamCodeSnippetFile,
      },
      {
        command: CommandName.CopyCodeSnippet,
        fn: this.copyCodeSnippet,
      },
      {
        command: CommandName.InsertCodeSnippet,
        fn: this.insertCodeSnippet,
      },
      {
        command: CommandName.DeleteCodeSnippet,
        fn: this.deleteCodeSnippet,
      },
      {
        command: CommandName.PublicCodeSnippet,
        fn: this.publicCodeSnippet,
      },
      {
        command: CommandName.NotPublicCodeSnippet,
        fn: this.notPublicCodeSnippet,
      }
    ]
  }

  async _createCodeSnippet(code, languageId) {
    const token = getPersonalToken();

    if (!token) {
      vscode.window.showErrorMessage('请先配置个人令牌');
      return;
    }

    const openaiConfig = vscode.workspace.getConfiguration('openai');

    const apiKey = openaiConfig.get('apiKey');

    const title = await this._getCodeSnippetTitle(apiKey, code);

    if (!title) {
      vscode.window.showErrorMessage('代码片段标题不能为空');
      return;
    }

    const description = await this._getCodeSnippetDescription(apiKey, code);

    try {
      await createCodeSnippet(title, code, languageId, description, token);
      this.personalTreeDataProvider.refresh(token);

      this.genPersonalCodeSnippetFile('代码片段文件重新生成成功，刷新vscode后生效。');
    } catch (error) {
      vscode.window.showErrorMessage('代码片段创建失败');
    }
  }

  async _getCodeSnippetTitle(apiKey, code) {
    if (!apiKey) {
      const title = await vscode.window.showInputBox({
        placeHolder: '请输入代码片段标题',
      });
      return title;
    } else {

      const inputBox = vscode.window.createInputBox();
      inputBox.show();

      inputBox.busy = true;
      inputBox.enabled = false;
      inputBox.placeholder = '正在生成代码片段标题...';

      const title = await getSnippetTitleByAI(code);
      inputBox.value = title;
      inputBox.busy = false;
      inputBox.enabled = true;

      return new Promise((resolve) => {
        inputBox.onDidAccept(async () => {
          resolve(inputBox.value);
        })
      })
    }
  }

  async _getCodeSnippetDescription(apiKey, code) {
    if (!apiKey) {
      const description = await vscode.window.showInputBox({ placeHolder: '请输入代码片段描述' });
      return description;
    } else {

      const inputBox = vscode.window.createInputBox();
      inputBox.show();

      inputBox.busy = true;
      inputBox.enabled = false;
      inputBox.placeholder = '正在生成代码片段描述...';

      const description = await getSnippetDescriptionByAI(code);
      inputBox.value = description;
      inputBox.busy = false;
      inputBox.enabled = true;

      return new Promise((resolve) => {
        inputBox.onDidAccept(async () => {
          resolve(inputBox.value);
        })
      })
    }
  }
}

module.exports = CommandManager;