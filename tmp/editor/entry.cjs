const {Editor,Extension}=require('@tiptap/core');const StarterKit=require('@tiptap/starter-kit').default;const TextAlign=require('@tiptap/extension-text-align').default;const LineSpacing = Extension.create({
  name: 'lineSpacing',
  addGlobalAttributes() {
    return [{ types: ['paragraph', 'heading'], attributes: { lineHeight: {
      default: null,
      parseHTML: element => element.style.lineHeight || null,
      renderHTML: attributes => attributes.lineHeight ? {style:`line-height: ${attributes.lineHeight}`} : {},
    } } }];
  },
});

window.createEditor=()=>new Editor({element:document.querySelector('#editor'),extensions:[StarterKit,TextAlign.configure({types:['paragraph','heading']}),LineSpacing],content:'<p>First paragraph.</p><p>Second paragraph.</p>'});