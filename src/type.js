
const CommandName = {
  PreviewCodeSnippet: 'code-snippet.previewCodeSnippet',
  EditSelectionCode: 'code-snippet.editSelectionCode',
  CreateCodeSnippet: 'code-snippet.createCodeSnippet',
  CreateCodeSnippetBySelectionCode: 'code-snippet.createCodeSnippetBySelectionCode',
  RefreshPublicTreeView: 'code-snippet.public.refresh',
  GenPublicCodeSnippetFile: 'code-snippet.public.genCodeSnippetFile',
  RefreshPersonalTreeView: 'code-snippet.personal.refresh',
  GenPersonalCodeSnippetFile: 'code-snippet.personal.genCodeSnippetFile',
  RefreshTeamTreeView: 'code-snippet.team.refresh',
  GenTeamCodeSnippetFile: 'code-snippet.team.genCodeSnippetFile',
  CopyCodeSnippet: 'code-snippet.copy',
  InsertCodeSnippet: 'code-snippet.insert',
  DeleteCodeSnippet: 'code-snippet.delete',
  PublicCodeSnippet: 'code-snippet.public',
  NotPublicCodeSnippet: 'code-snippet.notPublic',
}

const public_code_snippet_file_path = 'snippets/public.snippets.code-snippets'
const personal_code_snippet_file_path = 'snippets/personal.snippets.code-snippets'
const team_code_snippet_file_path = 'snippets/team.snippets.code-snippets'

module.exports = {
  CommandName,
  public_token: process.env.PUBLIC_TOKEN,
  public_code_snippet_file_path,
  personal_code_snippet_file_path,
  team_code_snippet_file_path,
}