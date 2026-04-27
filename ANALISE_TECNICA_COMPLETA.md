# 📊 ANÁLISE TÉCNICA COMPLETA - EAD IGEPPS

## 1. **RESUMO EXECUTIVO**

**Sistema:** Plataforma de Educação a Distância (EAD) - IGEPPS Academy  
**Versão:** 1.0.0  
**Tipo:** SPA/SSR (Next.js)  
**Estado:** Em desenvolvimento  
**Data da Análise:** 21 de dezembro de 2025

---

## 2. **STACK TECNOLÓGICO**

### **Frontend**
| Tecnologia | Versão | Função |
|-----------|--------|--------|
| React | 19.2.0 | Framework UI |
| Next.js | 16.0.3 | SSR/SSG Framework |
| Tailwind CSS | 3.3.6 | CSS Utility-first |
| Framer Motion | 10.18.0 | Animações |
| React Input Mask | 2.0.4 | Validação de inputs |

### **Backend**
| Tecnologia | Versão | Função |
|-----------|--------|--------|
| Node.js/Express (Next.js API Routes) | Integrado | Backend |
| Nodemailer | 7.0.10 | Envio de e-mails |
| Bcryptjs | 3.0.3 | Hash de senhas |
| Formidable | 3.5.4 | Upload de arquivos |

### **Build & Deploy**
| Ferramenta | Versão | Função |
|-----------|--------|--------|
| PostCSS | 8.4.31 | Processamento CSS |
| Autoprefixer | 10.4.16 | Compatibilidade browsers |

---

## 3. **ARQUITETURA & ESTRUTURA DE PASTAS**

```
ead-igepps/
├── pages/                    # Rotas Next.js (SSR/SSG)
│   ├── _app.js              # App wrapper global
│   ├── _document.js         # HTML wrapper
│   ├── index.js             # Homepage
│   ├── login.js             # Login
│   ├── dashboard.js         # Dashboard aluno
│   ├── enviar-documentos.js # Upload documentos
│   ├── politica-*.js        # Páginas estáticas
│   ├── admin/               # MÓDULO ADMIN
│   │   ├── dashboard.js     # Admin dashboard
│   │   ├── alunos.js        # Gestão alunos
│   │   ├── professores.js   # Gestão professores
│   │   ├── cursos.js        # Gestão cursos
│   │   ├── avaliacoes.js    # Gestão avaliações
│   │   ├── documentos.js    # Gestão documentos
│   │   ├── emails.js        # Gestão e-mails
│   │   ├── blog.js          # Gestão blog/notícias
│   │   ├── slider.js        # Gestão slider
│   │   ├── forum.js         # Gestão fórum
│   │   └── usuarios.js      # Gestão usuários
│   ├── api/                 # MÓDULO API (Backend)
│   │   ├── auth/
│   │   │   └── login.js     # Autenticação
│   │   ├── alunos.js        # CRUD alunos
│   │   ├── professores.js   # CRUD professores
│   │   ├── cursos.js        # CRUD cursos
│   │   ├── avaliacoes.js    # CRUD avaliações
│   │   ├── documentos.js    # CRUD documentos
│   │   ├── forum.js         # CRUD fórum
│   │   ├── noticias.js      # CRUD notícias
│   │   ├── enviar-email.js  # Serviço de e-mails
│   │   ├── slider.js        # CRUD slider
│   │   ├── upload-*.js      # Gerenciadores de upload
│   │   │   ├── upload-foto.js
│   │   │   ├── upload-material.js
│   │   │   ├── upload-slider.js
│   │   │   └── upload-thumbnail.js
│   │   └── usuarios.js      # CRUD usuários
│   ├── assistir/
│   │   └── [cursoId].js     # Visualização curso dinâmica
│   ├── curso/
│   │   ├── [id].js          # Rota dinâmica curso
│   │   └── [id].js (estático)
│   ├── noticia/
│   │   └── [id].js          # Rota dinâmica notícia
│   └── professor/
│       └── dashboard.js     # Dashboard professor
│
├── components/              # Componentes React reutilizáveis
│   ├── Admin*.js            # Componentes admin (11 arquivos)
│   ├── Header.js            # Cabeçalho público
│   ├── Footer.js            # Rodapé
│   ├── ProfessorHeader.js   # Cabeçalho professor
│   ├── ProfessorSidebar.js  # Menu professor
│   ├── AdminHeader.js       # Cabeçalho admin
│   ├── AdminSidebar.js      # Menu admin
│   ├── ConfirmModal.js      # Modal confirmação
│   ├── CookieBanner.js      # Aviso de cookies
│   ├── Forum.js             # Componente fórum
│   ├── RichTextEditor.js    # Editor de texto rico
│   └── (src/components/)
│       ├── SliderNovo.jsx   # Slider homepage
│       ├── CursosDestaque.jsx
│       ├── NoticiasHome.jsx
│       ├── Depoimentos.jsx
│       └── Rodape.jsx
│
├── data/                    # JSON data (persistência local)
│   ├── alunos.json
│   ├── avaliacoes.json
│   ├── cursos.json
│   ├── documentos.json
│   ├── emails-enviados.json
│   ├── forum.json
│   ├── noticias.json
│   ├── professores.json
│   └── slider.json
│
├── lib/                     # Utilitários & serviços
│   ├── emailService.js      # Integração Nodemailer (369 linhas)
│   ├── formatters.js        # Funções de formatação
│   └── usuariosService.js   # Lógica usuários
│
├── context/                 # React Context
│   └── SidebarContext.js    # Estado sidebar global
│
├── public/                  # Arquivos estáticos
│   ├── images/
│   │   ├── cursos/
│   │   └── slider/
│   └── uploads/
│       ├── fotos/
│       ├── materiais/
│       └── thumbnails/
│
├── styles/
│   └── globals.css          # Estilos globais
│
├── config files
│   ├── package.json
│   ├── next.config.js
│   ├── jsconfig.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── scripts PowerShell (admin)
    ├── create-admin-users.ps1
    ├── criar-backup.ps1
    ├── setup-storage.ps1
    └── update-storage.ps1
```

---

## 4. **MÓDULOS PRINCIPAIS**

### **A. MÓDULO DE AUTENTICAÇÃO**
- **Localização:** `/pages/api/auth/login.js`
- **Funcionalidades:**
  - Login de usuários (alunos, professores, admin)
  - Hash de senhas com bcryptjs
  - Sessão em localStorage
- **Tipo de usuário:** admin, professor, aluno

### **B. MÓDULO DE ALUNOS**
- **CRUD:** `/pages/api/alunos.js`
- **Admin UI:** `/pages/admin/alunos.js` → `/components/AdminAlunos.js`
- **Dashboard:** `/pages/dashboard.js`
- **Funcionalidades:**
  - Cadastro de alunos
  - Listagem e filtros
  - Edição/Exclusão
  - Rastreamento de progresso

### **C. MÓDULO DE PROFESSORES**
- **CRUD:** `/pages/api/professores.js`
- **Admin UI:** `/pages/admin/professores.js` → `/components/AdminProfessores.js`
- **Dashboard Professor:** `/pages/professor/dashboard.js`
- **Funcionalidades:**
  - Cadastro de professores
  - Gestão de disciplinas
  - Dashboard próprio com métricas

### **D. MÓDULO DE CURSOS**
- **CRUD:** `/pages/api/cursos.js`
- **Admin UI:** `/pages/admin/cursos.js` → `/components/AdminCursos.js`
- **Visualização:** `/pages/curso/[id].js`, `/pages/assistir/[cursoId].js`
- **Funcionalidades:**
  - CRUD completo de cursos
  - Upload de thumbnails
  - Categorização
  - Rotas dinâmicas

### **E. MÓDULO DE AVALIAÇÕES**
- **CRUD:** `/pages/api/avaliacoes.js`
- **Admin UI:** `/pages/admin/avaliacoes.js` → `/components/AdminAvaliacoes.js`
- **Funcionalidades:**
  - Criar avaliações/provas
  - Corrigir submissões
  - Gerar relatórios

### **F. MÓDULO DE DOCUMENTOS**
- **CRUD:** `/pages/api/documentos.js`
- **Admin UI:** `/pages/admin/documentos.js` → `/components/AdminDocumentos.js`
- **Upload:** `/pages/api/upload-material.js`, `/pages/enviar-documentos.js`
- **Funcionalidades:**
  - Upload de materiais
  - Organização por pasta
  - Download para alunos

### **G. MÓDULO DE FÓRUM**
- **CRUD:** `/pages/api/forum.js`
- **Admin UI:** `/pages/admin/forum.js`
- **Componente:** `/components/Forum.js`
- **Funcionalidades:**
  - Postagem de tópicos
  - Respostas e discussões
  - Moderação

### **H. MÓDULO DE NOTÍCIAS/BLOG**
- **CRUD:** `/pages/api/noticias.js`
- **Admin UI:** `/pages/admin/blog.js` → `/components/AdminBlog.js`
- **Visualização:** `/pages/noticia/[id].js`, `/src/components/NoticiasHome.jsx`
- **Funcionalidades:**
  - Publicação de notícias
  - Categorização
  - Feed na homepage

### **I. MÓDULO DE SLIDER**
- **CRUD:** `/pages/api/slider.js`
- **Admin UI:** `/pages/admin/slider.js` → `/components/AdminSlider.js`
- **Upload:** `/pages/api/upload-slider.js`
- **Componente:** `/src/components/SliderNovo.jsx`
- **Funcionalidades:**
  - Gerenciar slides
  - Upload de imagens
  - Ordem e timing

### **J. MÓDULO DE E-MAILS**
- **Serviço:** `/lib/emailService.js` (369 linhas)
- **API:** `/pages/api/enviar-email.js`
- **Admin UI:** `/pages/admin/emails.js` → `/components/AdminEmails.js`
- **Funcionalidades:**
  - Envio de e-mails transacionais
  - Templates HTML customizados
  - Histórico de envios
  - Integração Nodemailer (SMTP)
  - **Templates:**
    - Pré-cadastro
    - Confirmação de matrícula
    - Redefinição de senha
    - Notificações

### **K. MÓDULO DE USUÁRIOS**
- **CRUD:** `/pages/api/usuarios.js`
- **Serviço:** `/lib/usuariosService.js`
- **Admin UI:** `/pages/admin/usuarios.js` → `/components/AdminUsuarios.js`
- **Funcionalidades:**
  - CRUD de usuários
  - Gestão de permissões
  - Tipos: admin, professor, aluno

### **L. MÓDULO DE UPLOADS**
- **Endpoints:**
  - `/pages/api/upload-foto.js` - Fotos de perfil
  - `/pages/api/upload-material.js` - Materiais didáticos
  - `/pages/api/upload-slider.js` - Imagens slider
  - `/pages/api/upload-thumbnail.js` - Thumbnails cursos
- **Biblioteca:** Formidable 3.5.4
- **Diretórios:** `/public/uploads/`

---

## 5. **FUNCIONALIDADES POR PERFIL**

### **ALUNO**
- ✅ Fazer login
- ✅ Ver cursos disponíveis
- ✅ Assistir vídeos/materiais
- ✅ Submeter avaliações
- ✅ Baixar documentos
- ✅ Participar de fórum
- ✅ Ver notícias
- ✅ Dashboard com progresso

### **PROFESSOR**
- ✅ Fazer login
- ✅ Dashboard próprio
- ✅ Criar/editar cursos
- ✅ Corrigir avaliações
- ✅ Ver relatórios de alunos
- ✅ Participar de fórum
- ✅ Upload de materiais

### **ADMINISTRADOR**
- ✅ Dashboard com estatísticas
- ✅ CRUD completo: alunos, professores, cursos
- ✅ Gestão de avaliações
- ✅ Gestão de documentos
- ✅ Gerenciamento de fórum
- ✅ Gestão de notícias/blog
- ✅ Gerenciamento de slider
- ✅ Gestão de usuários
- ✅ Envio de e-mails em massa
- ✅ Análise de estatísticas

---

## 6. **FLUXOS DE DADOS**

### **Fluxo de Autenticação**
```
Login Page (/login) 
  ↓
POST /api/auth/login
  ↓
bcryptjs (validação senha)
  ↓
localStorage (sessão)
  ↓
Redirecionamento (dashboard/admin/professor)
```

### **Fluxo de Inscrição em Curso**
```
Aluno visualiza curso (/curso/[id])
  ↓
Clica em "Inscrever"
  ↓
POST /api/alunos (atualiza progresso)
  ↓
Email confirmação (Nodemailer)
  ↓
Aluno vê curso em dashboard
```

### **Fluxo de Upload de Arquivo**
```
Componente Upload UI
  ↓
FormData + Arquivo
  ↓
POST /api/upload-material (Formidable)
  ↓
Salva em /public/uploads/
  ↓
Retorna URL
  ↓
Banco de dados atualizado
```

---

## 7. **PERSISTÊNCIA DE DADOS**

**Método Atual:** JSON Files (`/data/` folder)

| Arquivo | Registros | Entidades |
|---------|-----------|-----------|
| alunos.json | Múltiplos | Usuários tipo "aluno" |
| professores.json | Múltiplos | Usuários tipo "professor" |
| cursos.json | Múltiplos | Cursos com metadados |
| avaliacoes.json | Múltiplos | Provas/testes |
| documentos.json | Múltiplos | Materiais didáticos |
| forum.json | Múltiplos | Tópicos + respostas |
| noticias.json | Múltiplos | Artigos/blog |
| emails-enviados.json | Histórico | Log de e-mails |
| slider.json | Múltiplos | Slides homepage |

**⚠️ Limitação:** JSON não é escalável. Recomenda-se migração para MongoDB/PostgreSQL.

---

## 8. **COMPONENTES PRINCIPAIS**

### **Layout & Navegação**
- `Header.js` - Navbar pública
- `Footer.js` - Rodapé
- `AdminHeader.js` - Navbar admin
- `AdminSidebar.js` - Menu admin (sidebar)
- `ProfessorHeader.js` - Navbar professor
- `ProfessorSidebar.js` - Menu professor

### **Formulários & Inputs**
- `RichTextEditor.js` - Editor WYSIWYG
- `react-input-mask` - Validação de inputs

### **UI Components**
- `ConfirmModal.js` - Modal de confirmação
- `CookieBanner.js` - Aviso de cookies
- `Forum.js` - Widget de fórum

### **Homepage Components**
- `SliderNovo.jsx` - Carrossel (dinâmico)
- `CursosDestaque.jsx` - Grid cursos
- `NoticiasHome.jsx` - Feed notícias
- `Depoimentos.jsx` - Testimoniais
- `Rodape.jsx` - Rodapé HTML

### **Admin Components** (11 total)
- `AdminAlunos.js`
- `AdminProfessores.js`
- `AdminCursos.js`
- `AdminAvaliacoes.js`
- `AdminDocumentos.js`
- `AdminEmails.js`
- `AdminBlog.js`
- `AdminSlider.js`
- `AdminUsuarios.js`
- `AdminHeader.js`
- `AdminSidebar.js`

---

## 9. **INTEGRAÇÕES EXTERNAS**

### **Nodemailer (E-mail)**
```
SMTP_HOST: smtp.gmail.com (ou customizado)
SMTP_PORT: 587
SMTP_USER: seu_email@gmail.com
SMTP_PASS: app_password
```
**Função:** Envio transacional de e-mails

### **Possível Integração Bubble (comentada no código)**
- Endpoints comentados nos componentes
- Substituição manual necessária

---

## 10. **PERFORMANCE & OTIMIZAÇÕES**

### **Implementadas:**
- ✅ Next.js SSR/SSG
- ✅ Dynamic imports com `next/dynamic`
- ✅ Lazy loading de componentes
- ✅ Tailwind CSS (utility-first)
- ✅ Framer Motion (animações)
- ✅ Input masking

### **A Considerar:**
- [ ] Image optimization (next/image)
- [ ] API caching
- [ ] Database query optimization
- [ ] CDN para assets estáticos

---

## 11. **SEGURANÇA**

### **Implementada:**
- ✅ Bcryptjs para hash de senhas
- ✅ localStorage para sessão (cliente)
- ✅ Validação de tipo de usuário

### **Melhorias Necessárias:**
- [ ] JWT/Session token
- [ ] HTTPS obrigatório
- [ ] CORS configuration
- [ ] Rate limiting
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Variáveis de ambiente (.env.local)

---

## 12. **SCRIPTS DE ADMINISTRAÇÃO** (PowerShell)

| Script | Função |
|--------|--------|
| `create-admin-users.ps1` | Criar usuários admin iniciais |
| `criar-backup.ps1` | Backup de dados |
| `setup-storage.ps1` | Configurar pastas de upload |
| `update-storage.ps1` | Atualizar configuração storage |

---

## 13. **CONFIGURAÇÃO & BUILD**

### **Scripts Disponíveis**
```json
{
  "dev": "next dev",           // Desenvolvimento (port 3000)
  "build": "next build",       // Build produção
  "start": "next start"        // Start produção
}
```

### **Config Files**
- `next.config.js` - Configuração Next.js
- `jsconfig.json` - Alias de imports (`@/*`)
- `tailwind.config.js` - Tema Tailwind
- `postcss.config.js` - PostCSS config

---

## 14. **VOLUME & ESTIMATIVAS**

| Métrica | Quantidade |
|---------|-----------|
| **Páginas** | 20+ |
| **Componentes** | 30+ |
| **Endpoints API** | 15 |
| **Módulos Funcionais** | 11 |
| **Linhas de Código** | ~5.000+ |
| **Arquivos de Dados** | 8 |

---

## 15. **STATUS & PRÓXIMOS PASSOS**

### **Implementado:**
- ✅ Frontend completo com Next.js  
- ✅ 11 módulos funcionais  
- ✅ Sistema de autenticação básico  
- ✅ Upload de arquivos  
- ✅ Email transacional  
- ✅ Admin dashboard  

### **A Fazer / Melhorias:**
- [ ] Migrar JSON → Banco de dados
- [ ] Implementar JWT/Session tokens
- [ ] Testes automatizados
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Monitoring & logging
- [ ] Backup automático
- [ ] Documentação API (Swagger)
- [ ] Mobile responsiveness review
- [ ] Performance testing

---

## 📈 **PARA PRECIFICAÇÃO, CONSIDERE:**

1. **Desenvolvimento Base:** 11 módulos funcionais
2. **Horas Estimadas:** ~800-1000 horas (desenvolvimento atual)
3. **Custo por Módulo:** Varia por complexidade
4. **Manutenção:** ~40-60 horas/mês (dependendo de uso)
5. **Hosting:** ~R$ 50-200/mês (dependendo de infraestrutura)
6. **Domínio:** ~R$ 30-50/ano

---

**Documento gerado em:** 21 de dezembro de 2025
