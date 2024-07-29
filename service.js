const vscode = require('vscode');
const fs = require('fs');
const path = require('path');


const FILE_NAME = 'code-snippet.json'


const save = async (name, type, code, context) => {
  let filePath = path.join(context.extensionPath, FILE_NAME);

  let codes = [];

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    try {
      codes = JSON.parse(data);
    } catch (e) {
      codes = [];
    }
  }

  const id = new Date().getTime();

  codes.push({
    id,
    name,
    code,
    type,
    create_date: new Date().toLocaleString()
  })
  fs.writeFileSync(filePath, JSON.stringify(codes), 'utf-8');

  // 插入代码片段
  filePath = path.join(context.extensionPath, 'snippets/snippets.code-snippets');

  const data = fs.readFileSync(filePath, 'utf-8');

  const newData = JSON.parse(data);

  // 把代码转换为body

  const codeArr = code.split('\n');

  newData[`code-snippets-${id}`] = {
    "scope": type,
    "prefix": name,
    "body": codeArr,
    "description": name
  }

  fs.writeFileSync(filePath, JSON.stringify(newData), 'utf-8');

  const value = await vscode.window.showInformationMessage('保存成功，代码片段需要刷新当前窗口才能生效，是否刷新？', { modal: true }, '是', '否');
  if (value === '是') {
    vscode.commands.executeCommand('workbench.action.reloadWindow');
  }
}

const getList = (context) => {
  const filePath = path.join(context.extensionPath, FILE_NAME);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
  return [];
}

const deleteCode = (id, context) => {
  let filePath = path.join(context.extensionPath, FILE_NAME);
  if (fs.existsSync(filePath)) {
    let codes = [];
    let data = fs.readFileSync(filePath, 'utf-8');
    try {
      codes = JSON.parse(data);
    }
    catch (e) {
      codes = [];
    }
    const newCodes = codes.filter(item => item.id !== id);
    fs.writeFileSync(filePath, JSON.stringify(newCodes), 'utf-8');


    // 删除代码片段
    filePath = path.join(context.extensionPath, 'snippets/snippets.code-snippets');
    data = fs.readFileSync(filePath, 'utf-8');
    const newData = JSON.parse(data);
    delete newData[`code-snippets-${id}`];
    fs.writeFileSync(filePath, JSON.stringify(newData), 'utf-8');

    vscode.window.showInformationMessage('删除成功');
  }
}



const getLanguageList = () => {
  return [
    "default",
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
  getList,
  deleteCode,
  FILE_NAME,
  getLanguageList,
}