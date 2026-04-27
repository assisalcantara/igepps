# Slider IGEPPS EAD

Coloque aqui as imagens do slider inicial.

Nomes recomendados (correspondem ao array em `src/components/Slider.jsx`):
- slide1.jpg (Capacitação para Servidores Públicos)
- slide2.jpg (Educação Continuada IGEPPS)
- slide3.jpg (Formação de Líderes e Gestores)

Como adicionar mais slides:
1. Adicione novo arquivo: slide4.jpg
2. Edite `src/components/Slider.jsx` e inclua novo objeto no array `mockSlides`, exemplo:
```js
{ id: 4, titulo: 'Novo Tema', descricao: 'Descrição do novo tema.', imagem: '/images/slide4.jpg' }
```

Boas práticas:
- Resolução mínima sugerida: 1600x900
- Formato JPG otimizado
- Compressão (use TinyJPG ou similar) para performance

Futuro: substituir mock por chamada de API Bubble.
