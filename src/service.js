const vscode = require('vscode');
const axios = require('axios');
const { getCodeSnippetInfo } = require('./utils');

const request = axios.default.create({
  baseURL: 'https://gitee.com/api/v5/gists',
})

request.interceptors.response.use(response => {
  return response;
}, error => {
  vscode.window.showErrorMessage('请求失败：' + error.message);
  return Promise.reject(error);
})

const getCodeSnippets = async (token) => {
  const { data } = await request.get('/', {
    params: {
      access_token: token,
      page: 1,
      pre_page: 10000,
    }
  });

  const group = {};

  data.forEach(item => {
    const record = getCodeSnippetInfo(item);

    if (!group[record.languageId]) {
      group[record.languageId] = [];
    }
    group[record.languageId].push(record);
  })

  return group;
}

// 创建代码片段
const createCodeSnippet = (
  name,
  code,
  type,
  description,
  token
) => {
  return request.post('/', {
    access_token: token,
    files: {
      [name + '.' + type]: {
        content: code
      },
    },
    description: description || name,
    public: false,
  })
}

const getCodeSnippetById = (id, token) => {
  return request.get(`/${id}`, { params: { access_token: token } })
}

const deleteCodeSnippetById = (id, token) => {
  return request.delete(`/${id}`, { params: { access_token: token } })
}

const publicCodeSnippet = async (id, token, publicId, files) => {
  try {
    const res = await request.patch(`/${id}`, {
      access_token: token,
      public: true,
      files: {
        ...files,
        publicId: {
          content: publicId
        },
      }
    });
    return res;
  } catch (error) {
    return error;
  }
}

const notPublicCodeSnippet = async (id, token) => {
  try {
    const res = await request.patch(`/${id}`, {
      access_token: token,
      public: false
    });
    return res;
  } catch (error) {
    return error;
  }
}

module.exports = {
  getCodeSnippets,
  createCodeSnippet,
  getCodeSnippetById,
  deleteCodeSnippetById,
  publicCodeSnippet,
  notPublicCodeSnippet,
}