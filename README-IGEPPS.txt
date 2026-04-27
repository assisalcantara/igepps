EAD IGEPPS - Projeto React (Create React App)
---------------------------------------------

Instruções rápidas (Windows):

1) Instalar dependências:
   npm install

2) Iniciar servidor de desenvolvimento:
   npm start
   -> por padrão o comando abrirá o navegador automaticamente em ambientes Windows
      (o script já define BROWSER=none para evitar abrir duas vezes em alguns sistemas).
   Se quiser o navegador abrir automaticamente, remova 'set BROWSER=none &&' do script start em package.json.

Como o projeto está preparado:
- Tailwind está listado nas devDependencies. Após instalar, rode o app normalmente.
- Os endpoints do Bubble estão comentados nos componentes. Substitua as variáveis conforme instruções no código.
- Estrutura principal:
  src/
    components/Slider.jsx
    components/CursosDestaque.jsx
    components/Depoimentos.jsx
    components/Rodape.jsx
    pages/Home.jsx
    App.js
    index.js
    index.css
  public/
    index.html
    images/slide1.jpg, slide2.jpg, slide3.jpg, course1.jpg, course2.jpg, course3.jpg

Observações:
- Este pacote é um protótipo educativo, com mocks locais para imagens e dados.
- Para usar Tailwind totalmente, siga o guia oficial (tailwindcss.com/docs/guides/create-react-app).