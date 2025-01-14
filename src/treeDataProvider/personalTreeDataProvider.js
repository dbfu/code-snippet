const vscode = require('vscode');
const { getCodeSnippets } = require('../service');
const { CommandName } = require('../type');
const { getPersonalToken } = require('../utils');

class PersonalTreeViewProvider {
  constructor() {
    this.token = getPersonalToken();

    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;

    this.data = [];
  }

  refresh() {
    this.token = getPersonalToken();
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element) {
    return element;
  }

  getChildren(element) {

    if(!this.token) {
      return [{
        label: '请先在配置中配置个人gitee令牌。',
      }]
    }


    if (element) {
      return element.children.map(item => ({
        label: item.fileName,
        tooltip: item.description,
        description: item.description,
        collapsibleState: vscode.TreeItemCollapsibleState.None,
        title: item.description,
        id: item.id,
        token: this.token,
        public: 1,
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
        contextValue: item.public ? 'personalCodeSnippetItemPublic' : 'personalCodeSnippetItemNotPublic',
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

        if (list.length === 0) {
          resolve([{
            label: '暂无代码片段'
          }])
        } else {
          resolve(list);
        }
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

module.exports = PersonalTreeViewProvider;