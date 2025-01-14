const vscode = require('vscode');
const { team_code_snippet_file_path } = require('./type');
const { writeFileSync } = require('fs');
const { join } = require('path');
const OpenAI = require('openai');

const getPersonalToken = () => {
  return vscode.workspace.getConfiguration('personal').get('gitee.token');
}

const getCodeSnippetInfo = (item) => {
  const files = item.files;

  let fileName = Object.keys(files)[0];

  const description = item.description;
  const isPublic = item.public;
  const content = files[fileName].content;
  const id = item.id;

  const languageId = fileName.split('.').pop();
  fileName = fileName.split('.').shift();

  const record = {
    description,
    code: content,
    id,
    languageId,
    fileName,
    public: isPublic,
    files,
  }

  return record;
}

const genCodeSnippetFile = (data, prefix, filePath, context) => {
  const newData = {};

  Object.keys(data).forEach(key => {
    data[key].forEach((item) => {
      const { id, languageId, code, description, fileName } = item;
      newData[id] = {
        id,
        scope: languageId,
        prefix: prefix + fileName,
        body: code,
        description,
        create_date: new Date().toLocaleDateString(),
      }
    })
  })

  // 获取代码片段存放文件地址
  filePath = join(
    context.extensionPath,
    filePath
  );
  // 写入文件
  writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf-8');
}

const getTeamToken = () => {
  return vscode.workspace.getConfiguration('team').get('gitee.token');
}

const genTeamCodeSnippetFile = async (teams, getCodeSnippets, context) => {
  const newData = {};
  for (let i = 0; i < teams.length; i += 1) {
    const element = teams[i];
    const data = await getCodeSnippets(element.token);
    Object.keys(data).forEach(key => {
      data[key].forEach((item) => {
        const { id, languageId, code, description, fileName } = item;
        newData[element.name + '-' + id] = {
          id,
          scope: languageId,
          prefix: `cs_${element.name}_` + fileName,
          body: code,
          description,
          create_date: new Date().toLocaleDateString(),
        }
      })
    })
  }

  const filePath = join(
    context.extensionPath,
    team_code_snippet_file_path,
  );
  writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf-8');
}

const getSnippetTitleByAI = async (code) => {
  const openaiConfig = vscode.workspace.getConfiguration('openai');

  const apiKey = openaiConfig.get('apiKey');
  const baseUrl = openaiConfig.get('baseUrl');
  const model = openaiConfig.get('model');

  if (!apiKey) return;

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseUrl || "https://api.openai.com/v1",
  });

  const chatCompletion = await client.chat.completions.create({
    messages: [{
      role: 'user',
      content: `你是一个代码专家，请根据下面的代码片段生成一个简短中文标题，不要超过15字; 
        
        ${code}`,
    }],
    model: model || 'gpt-3.5-turbo',
  });

  return chatCompletion.choices[0].message.content.replace(/"/g, "");
}

const getSnippetDescriptionByAI = async (code) => {
  const openaiConfig = vscode.workspace.getConfiguration('openai');

  const apiKey = openaiConfig.get('apiKey');
  const baseUrl = openaiConfig.get('baseUrl');
  const model = openaiConfig.get('model');

  if (!apiKey) return;

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseUrl || "https://api.openai.com/v1",
  });

  const chatCompletion = await client.chat.completions.create({
    messages: [{
      role: 'user',
      content: `你是一个代码专家，请根据下面的代码片段生成一个中文描述，不要超过50字; 
        
        ${code}`,
    }],
    model: model || 'gpt-3.5-turbo',
  });


  return chatCompletion.choices[0].message.content.replace(/"/g, "");
}


module.exports = {
  getPersonalToken,
  getCodeSnippetInfo,
  genCodeSnippetFile,
  getTeamToken,
  genTeamCodeSnippetFile,
  getSnippetTitleByAI,
  getSnippetDescriptionByAI,
}