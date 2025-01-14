const vscode = require('vscode');
const { getCodeSnippets } = require('../service');
const { CommandName, public_token } = require('../type');

class PublicTreeViewProvider {
  constructor() {
    this.token = public_token;

    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;

    this.data = [];
  }

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }


  getTreeItem(element) {
    return element;
  }

  getChildren(element) {
    if (element) {
      return element.children.map(item => ({
        label: item.fileName,
        tooltip: item.description,
        description: item.description,
        collapsibleState: vscode.TreeItemCollapsibleState.None,
        title: item.description,
        id: item.id,
        token: this.token,
        command: {
          title: item.fileName || '',
          command: CommandName.PreviewCodeSnippet,
          tooltip: item.fileName,
          arguments: [
            item.id,
            item.languageId,
            this.token,
          ]
        },
        contextValue: 'publicCodeSnippetItem',
      }));
    }

    return new Promise(async (resolve) => {
      try {
        const group = await getCodeSnippets(this.token);
        const list = Object.keys(group).map(key => {
          return {
            label: key,
            children: group[key],
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
          }
        })
        this.data = group;
        resolve(list);
      } catch (e) {
        if (e.status === 401) {
          resolve([{
            label: '获取代码片段失败，请检查配置的gitee令牌是否正确，或已过期。'
          }]);
        }
      }
    });
  }
}

module.exports = PublicTreeViewProvider;