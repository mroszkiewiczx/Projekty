import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'
import { cn } from '@/lib/cn'

interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  error?: string
}

function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-2">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn(
          'rounded px-2 py-1 text-sm font-medium transition-colors',
          editor.isActive('bold')
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-900 hover:bg-gray-100'
        )}
      >
        <strong>B</strong>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          'rounded px-2 py-1 text-sm font-medium transition-colors',
          editor.isActive('italic')
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-900 hover:bg-gray-100'
        )}
      >
        <em>I</em>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={cn(
          'rounded px-2 py-1 text-sm font-medium transition-colors',
          editor.isActive('strike')
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-900 hover:bg-gray-100'
        )}
      >
        <s>S</s>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          'rounded px-2 py-1 text-sm font-medium transition-colors',
          editor.isActive('heading', { level: 1 })
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-900 hover:bg-gray-100'
        )}
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          'rounded px-2 py-1 text-sm font-medium transition-colors',
          editor.isActive('heading', { level: 2 })
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-900 hover:bg-gray-100'
        )}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          'rounded px-2 py-1 text-sm font-medium transition-colors',
          editor.isActive('bulletList')
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-900 hover:bg-gray-100'
        )}
      >
        • Lista
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          'rounded px-2 py-1 text-sm font-medium transition-colors',
          editor.isActive('orderedList')
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-900 hover:bg-gray-100'
        )}
      >
        1. Lista
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn(
          'rounded px-2 py-1 text-sm font-medium transition-colors',
          editor.isActive('codeBlock')
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-900 hover:bg-gray-100'
        )}
      >
        {'<>'}
      </button>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="rounded bg-white px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 disabled:opacity-50"
      >
        ↶ Cofnij
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="rounded bg-white px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 disabled:opacity-50"
      >
        ↷ Ponów
      </button>
    </div>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Zacznij pisać...',
  error,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  return (
    <div className="w-full">
      <div className={cn('rounded-lg border border-gray-300', error && 'border-red-500')}>
        <MenuBar editor={editor} />
        <EditorContent
          editor={editor}
          className={cn(
            'prose prose-sm max-w-none rounded-b-lg bg-white p-4 focus:outline-none',
            'prose-headings:font-semibold prose-a:text-blue-600 prose-strong:font-semibold'
          )}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
