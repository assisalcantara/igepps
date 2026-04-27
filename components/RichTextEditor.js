import { useRef, useEffect } from 'react';

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && value && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e) => {
    // Ao pressionar Enter, inserir <br> ao invés de criar novo parágrafo
    if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '<br><br>');
      updateContent();
    }
  };

  const insertLink = () => {
    const url = prompt('Digite a URL do link:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  return (
    <div className="border rounded">
      {/* Toolbar */}
      <div className="bg-gray-100 border-b p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-200"
          title="Negrito"
        >
          <strong>B</strong>
        </button>
        
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-200"
          title="Itálico"
        >
          <em>I</em>
        </button>
        
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-200"
          title="Sublinhado"
        >
          <u>U</u>
        </button>

        <div className="border-l mx-1"></div>

        <button
          type="button"
          onClick={() => execCommand('justifyLeft')}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-200"
          title="Alinhar à esquerda"
        >
          ≡
        </button>

        <button
          type="button"
          onClick={() => execCommand('justifyCenter')}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-200"
          title="Centralizar"
        >
          ≣
        </button>

        <button
          type="button"
          onClick={() => execCommand('justifyRight')}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-200"
          title="Alinhar à direita"
        >
          ≡
        </button>

        <button
          type="button"
          onClick={() => execCommand('justifyFull')}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-200"
          title="Justificar"
        >
          ≣
        </button>

        <div className="border-l mx-1"></div>

        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-200"
          title="Lista não ordenada"
        >
          • Lista
        </button>

        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-200"
          title="Lista ordenada"
        >
          1. Lista
        </button>

        <div className="border-l mx-1"></div>

        <button
          type="button"
          onClick={() => execCommand('insertLineBreak')}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-200"
          title="Quebra de linha"
        >
          ↵ Enter
        </button>

        <button
          type="button"
          onClick={insertLink}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-200"
          title="Inserir link"
        >
          🔗 Link
        </button>

        <button
          type="button"
          onClick={() => execCommand('removeFormat')}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-200"
          title="Remover formatação"
        >
          ✕ Limpar
        </button>

        <div className="border-l mx-1"></div>

        <select
          onChange={(e) => execCommand('fontSize', e.target.value)}
          className="px-2 py-1 bg-white border rounded hover:bg-gray-200"
          defaultValue="3"
          title="Tamanho da fonte"
        >
          <option value="1">Muito pequeno</option>
          <option value="2">Pequeno</option>
          <option value="3">Normal</option>
          <option value="4">Médio</option>
          <option value="5">Grande</option>
          <option value="6">Muito grande</option>
          <option value="7">Enorme</option>
        </select>

        <select
          onChange={(e) => execCommand('foreColor', e.target.value)}
          className="px-2 py-1 bg-white border rounded hover:bg-gray-200"
          defaultValue="#000000"
          title="Cor do texto"
        >
          <option value="#000000">⬛ Preto</option>
          <option value="#1e3a8a">🟦 Azul escuro</option>
          <option value="#3b82f6">🟦 Azul</option>
          <option value="#dc2626">🟥 Vermelho</option>
          <option value="#16a34a">🟩 Verde</option>
          <option value="#eab308">🟨 Amarelo</option>
          <option value="#9333ea">🟪 Roxo</option>
          <option value="#6b7280">⬜ Cinza</option>
        </select>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[300px] p-4 focus:outline-none"
        onInput={updateContent}
        onBlur={updateContent}
        onKeyDown={handleKeyDown}
        style={{ maxHeight: '500px', overflowY: 'auto' }}
      />
    </div>
  );
}
