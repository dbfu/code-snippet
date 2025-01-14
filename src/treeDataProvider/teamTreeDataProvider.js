const vscode = require('vscode');
const { getCodeSnippets } = require('../service');
const { CommandName, public_token } = require('../type');
const { getTeamToken } = require('../utils');

class TeamTreeViewProvider {
  constructor() {
    this.token = public_token;
    this.teams = null;

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
    if (element && element.contextValue !== 'teamItem') {
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
    } else if (!element) {
      return new Promise(async (resolve) => {
        const teamToken = getTeamToken();
        if (!teamToken || teamToken.filter(o => o.name && o.token).length === 0) {
          resolve([{
            label: '暂未配置团队令牌'
          }])
          return;
        }
        const list = teamToken.map(item => {
          return {
            label: item.name,
            token: item.token,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: 'teamItem',
          }
        })
        this.teams = list;
        resolve(list);
      });
    }
    return new Promise(async (resolve) => {
      try {
        const group = await getCodeSnippets(element.token);
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
          resolve(
            [{
              label: '获取代码片段失败，请检查配置的gitee令牌是否正确，或已过期。'
            }]
          );
        }
      }
    });
  }
}

module.exports = TeamTreeViewProvider;