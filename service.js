const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const FILE_PATH = 'snippets/snippets.code-snippets'

const save = async (name, type, code, context) => {
  // 获取代码片段存放文件地址
  const filePath = path.join(context.extensionPath, FILE_PATH);
  // 读取文件内容
  const data = fs.readFileSync(filePath, 'utf-8');
  // 解析文件内容
  const newData = JSON.parse(data);

  // 把代码转换为body
  const codeArr = code.split('\n');

  const id = new Date().getTime();

  // 把新的代码片段写入文件
  newData[`code-snippets-${id}`] = {
    id,
    scope: type,
    prefix: name,
    body: codeArr,
    description: name,
    create_date: new Date().toLocaleDateString(),
  }

  // 写入文件
  fs.writeFileSync(filePath, JSON.stringify(newData), 'utf-8');

  // 提示
  const value = await vscode.window.showInformationMessage('保存成功，代码片段需要刷新当前窗口才能生效，是否刷新？', { modal: true }, '是', '否');
  if (value === '是') {
    // 刷新窗口
    vscode.commands.executeCommand('workbench.action.reloadWindow');
  }
}

const getCodeSnippets = (context) => {
  // 获取代码片段存放文件地址
  const filePath = path.join(context.extensionPath, FILE_PATH);
  // 读取文件内容
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    // 解析文件内容
    return Object.values(JSON.parse(data));
  }
  return [];
}

const deleteCode = (id, context) => {
  let filePath = path.join(context.extensionPath, FILE_PATH);
  if (fs.existsSync(filePath)) {
    // 删除代码片段
    const data = fs.readFileSync(filePath, 'utf-8');
    const newData = JSON.parse(data);
    delete newData[`code-snippets-${id}`];
    fs.writeFileSync(filePath, JSON.stringify(newData), 'utf-8');

    vscode.window.showInformationMessage('删除成功');
  }
}



const getLanguageList = () => {
  return [
    "bash",
    "c",
    "cpp",
    "csharp",
    "css",
    "diff",
    "go",
    "graphql",
    "ini",
    "java",
    "javascript",
    "json",
    "kotlin",
    "less",
    "lua",
    "makefile",
    "markdown",
    "objectivec",
    "perl",
    "php",
    "php-template",
    "plaintext",
    "python",
    "python-repl",
    "r",
    "ruby",
    "rust",
    "scss",
    "shell",
    "sql",
    "swift",
    "typescript",
    "vbnet",
    "wasm",
    "xml",
    "yaml"
  ];
}

module.exports = {
  save,
  getCodeSnippets,
  deleteCode,
  FILE_PATH,
  getLanguageList,
}