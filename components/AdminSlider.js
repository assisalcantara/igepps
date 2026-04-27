import { useState, useEffect } from 'react';

// Componente para o formulário de edição de um slide
function EditForm({ slide, onSave, onCancel }) {
  const [title, setTitle] = useState(slide.titulo || '');
  const [description, setDescription] = useState(slide.descricao || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave({
      fileName: slide.nome,
      title,
      description,
    });
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold text-md mb-2">Editar Texto do Slide: {slide.nome}</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            id="description"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          ></textarea>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Salvar</button>
        </div>
      </form>
    </div>
  );
}


export default function AdminSlider() {
  const [slides, setSlides] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [editingSlide, setEditingSlide] = useState(null); // Para controlar qual slide está sendo editado

  const fetchSlides = async () => {
    try {
      const res = await fetch('/api/slider');
      const data = await res.json();
      setSlides(data);
    } catch (err) {
      setError('Falha ao carregar os slides.');
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setFeedback('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor, selecione um arquivo.');
      return;
    }

    setUploading(true);
    setError('');
    setFeedback('');

    const formData = new FormData();
    formData.append('sliderImage', file);

    try {
      const response = await fetch('/api/upload-slider', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha no upload da imagem.');
      }
      
      setFeedback('Imagem enviada com sucesso! Atualize a página para ver a nova imagem na lista.');
      
      setFile(null);
      e.target.reset();
      fetchSlides(); // Recarrega os slides para incluir o novo

    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveText = async (slideData) => {
    try {
        const response = await fetch('/api/slider', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(slideData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Falha ao salvar os dados.');
        }

        setFeedback('Textos do slide salvos com sucesso!');
        setEditingSlide(null); // Fecha o formulário de edição
        fetchSlides(); // Recarrega os slides para mostrar os textos atualizados

    } catch (err) {
        setError(err.message);
    }
  };

  // A função de deletar seria implementada aqui no futuro
  const handleDelete = async (slideName) => {
    alert(`Funcionalidade de deletar "${slideName}" a ser implementada.`);
    // Lógica de chamada para a API de delete viria aqui
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-8 p-4 border-l-4 border-blue-500 bg-blue-50">
        <h2 className="font-bold text-lg text-blue-800">Instruções para Imagens do Slider</h2>
        <ul className="list-disc list-inside mt-2 text-gray-700">
          <li><strong>Dimensões recomendadas:</strong> 1600px de largura por 900px de altura (proporção 16:9).</li>
          <li><strong>Formato:</strong> JPG ou PNG.</li>
          <li><strong>Tamanho máximo:</strong> 2 MB.</li>
          <li><strong>Nomenclatura:</strong> Use nomes simples e descritivos (ex: `capacitacao-servidores.jpg`).</li>
        </ul>
      </div>

      <h2 className="text-xl font-semibold mb-4">Enviar Nova Imagem</h2>
      <form onSubmit={handleUpload}>
        <div className="flex items-center gap-4">
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/jpeg, image/png"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            type="submit"
            disabled={uploading || !file}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {uploading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {feedback && <p className="text-green-500 text-sm mt-2">{feedback}</p>}
      </form>

      <h2 className="text-xl font-semibold mt-8 mb-4">Gerenciar Textos dos Slides</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {slides.map((slide) => (
          <div key={slide.id} className="relative group border rounded-lg p-3 shadow-sm">
            <img src={slide.url} alt={slide.nome} className="w-full h-32 object-cover rounded-lg" />
            <div className="mt-2">
                <p className="font-bold text-sm truncate" title={slide.titulo}>{slide.titulo}</p>
                <p className="text-xs text-gray-600 truncate" title={slide.descricao}>{slide.descricao}</p>
            </div>
            
            <div className="flex items-center justify-between mt-3">
                <button 
                  onClick={() => setEditingSlide(slide.id === editingSlide ? null : slide.id)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {editingSlide === slide.id ? 'Fechar' : 'Editar Slide'}
                </button>
                <button 
                  onClick={() => handleDelete(slide.nome)}
                  className="text-red-600 hover:text-red-800"
                  title="Deletar Imagem"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                  </svg>
                </button>
            </div>

            {editingSlide === slide.id && (
              <EditForm 
                slide={slide} 
                onSave={handleSaveText}
                onCancel={() => setEditingSlide(null)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
