'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useState } from 'react';
import { uploadToCloudinary } from '@/lib/clientUpload';
import { Bold, Italic, List, ListOrdered, Quote, Code, Link2, Image as ImageIcon, Heading1, Heading2, Heading3, Undo, Redo, Loader2 } from 'lucide-react';

export default function TiptapEditor({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-[#00D4FF] underline' } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-xl my-4' } }),
      Placeholder.configure({ placeholder: 'Write your article...' }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] px-6 py-5 text-white/90',
      },
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  const Btn = ({ onClick, active, children, title, disabled }) => (
    <button type="button" onClick={onClick} title={title} disabled={disabled}
      className={`p-2 rounded transition-colors disabled:opacity-40 ${active ? 'bg-[#00D4FF]/20 text-[#00D4FF]' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
      {children}
    </button>
  );

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };
  const addImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const res = await uploadToCloudinary(file, 'editor-image');
        editor.chain().focus().setImage({ src: res.secure_url }).run();
      } catch (e) {
        alert(`Upload failed: ${e.message}`);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-white/5 bg-[#0A0E1A]/60">
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="H1"><Heading1 className="w-4 h-4" /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2"><Heading2 className="w-4 h-4" /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="H3"><Heading3 className="w-4 h-4" /></Btn>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold className="w-4 h-4" /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic className="w-4 h-4" /></Btn>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="List"><List className="w-4 h-4" /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered"><ListOrdered className="w-4 h-4" /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote"><Quote className="w-4 h-4" /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code"><Code className="w-4 h-4" /></Btn>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <Btn onClick={addLink} active={editor.isActive('link')} title="Link"><Link2 className="w-4 h-4" /></Btn>
        <Btn onClick={addImageUpload} title="Upload image" disabled={uploading}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
        </Btn>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo className="w-4 h-4" /></Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo className="w-4 h-4" /></Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
