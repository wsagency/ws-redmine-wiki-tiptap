Redmine::Plugin.register :redmine_wiki_tiptap do
  name 'Redmine Wiki Tiptap'
  author 'Web Solutions Ltd (ws.agency)'
  description 'Replaces the wiki textarea with a Tiptap WYSIWYG editor. Full Markdown roundtrip.'
  version '1.0.0'
  url 'https://github.com/wsagency/ws-redmine-wiki-tiptap'
  author_url 'https://ws.agency'

  requires_redmine version_or_higher: '6.0'
end

Rails.configuration.to_prepare do
  require_dependency File.expand_path('../lib/redmine_wiki_tiptap/hooks', __FILE__)
end
