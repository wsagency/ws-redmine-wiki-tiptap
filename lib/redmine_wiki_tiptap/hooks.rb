module RedmineWikiTiptap
  class Hooks < Redmine::Hook::ViewListener
    def view_layouts_base_html_head(context = {})
      stylesheet_link_tag('wiki_tiptap', plugin: :redmine_wiki_tiptap)
    end

    def view_layouts_base_body_bottom(context = {})
      javascript_include_tag('wiki_tiptap.bundle', plugin: :redmine_wiki_tiptap) +
        javascript_include_tag('wiki_tiptap_init', plugin: :redmine_wiki_tiptap)
    end
  end
end
