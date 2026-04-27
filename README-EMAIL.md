# 📧 Sistema de E-mails - IGEPPS Academy

## Configuração do Envio de E-mails

### 1. Criar arquivo .env.local

Copie o arquivo `.env.local.example` e renomeie para `.env.local`:

```bash
copy .env.local.example .env.local
```

### 2. Configurar Gmail (Recomendado)

#### Passo a Passo:

1. **Acesse sua Conta Google:**
   - Vá para: https://myaccount.google.com/security

2. **Ative a Verificação em Duas Etapas:**
   - Procure por "Verificação em duas etapas"
   - Siga os passos para ativar

3. **Crie uma Senha de App:**
   - Após ativar a verificação em duas etapas
   - Procure por "Senhas de app"
   - Selecione "Aplicativo de e-mail" ou "Outro"
   - Copie a senha gerada (16 caracteres)

4. **Configure o .env.local:**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
NEXT_PUBLIC_URL=http://localhost:3000
```

### 3. Outros Provedores de E-mail

#### Outlook/Hotmail:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=seu-email@outlook.com
SMTP_PASS=sua-senha
```

#### Yahoo:
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=seu-email@yahoo.com
SMTP_PASS=sua-senha-de-app
```

#### Servidor SMTP Customizado:
```env
SMTP_HOST=smtp.seudominio.com.br
SMTP_PORT=587
SMTP_USER=noreply@seudominio.com.br
SMTP_PASS=sua-senha
```

## 🎨 Templates de E-mail

### E-mail de Pré-Cadastro

Enviado automaticamente quando o usuário preenche o formulário na home.

**Conteúdo:**
- ✅ Logo IGEPPS
- 📋 Dados cadastrados (nome, e-mail, WhatsApp)
- ⏳ Mensagem informando que o cadastro está em análise
- 🎨 Design responsivo e profissional

### E-mail de Aprovação

Enviado quando o admin aprova um pré-cadastro.

**Conteúdo:**
- ✅ Logo IGEPPS
- 🔑 Credenciais de acesso (e-mail e senha)
- 📚 Informações sobre cursos disponíveis
- 🔗 Link direto para acessar a plataforma
- ⚠️ Recomendação para alterar a senha

### E-mail de Cadastro Completo

Enviado quando o admin cadastra um aluno diretamente.

**Conteúdo:**
- ✅ Mesmo template do e-mail de aprovação
- 🔑 Credenciais de acesso fornecidas

## 🚀 Uso

### Pré-Cadastro (Home)

Quando um usuário preenche o formulário de pré-cadastro na home, o sistema:

1. Salva os dados no banco de dados com status "pendente"
2. **Envia automaticamente um e-mail** confirmando o recebimento
3. Informa que o cadastro está em análise

### Aprovação (Admin)

Quando o admin aprova um pré-cadastro:

1. O admin completa os dados (CPF, endereço, foto, etc.)
2. Define uma senha para o aluno
3. Vincula cursos
4. Ao salvar, o sistema **envia automaticamente um e-mail** com:
   - Confirmação de aprovação
   - Credenciais de acesso
   - Link para acessar a plataforma

### Cadastro Direto (Admin)

Quando o admin cadastra um aluno diretamente:

1. Preenche todos os dados do formulário
2. Define a senha
3. Ao salvar, o sistema **envia automaticamente um e-mail** com as credenciais

## 🛠️ Teste de E-mail

Para testar o envio de e-mails sem configurar SMTP, você pode usar serviços como:

### Mailtrap (Desenvolvimento)

1. Crie uma conta em: https://mailtrap.io
2. Configure o .env.local:

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=seu-usuario-mailtrap
SMTP_PASS=sua-senha-mailtrap
NEXT_PUBLIC_URL=http://localhost:3000
```

## ⚠️ Importante

- **Nunca commite o arquivo .env.local** (já está no .gitignore)
- Use senhas de app, não a senha real da conta
- Teste os e-mails antes de colocar em produção
- Para produção, considere usar serviços profissionais como:
  - SendGrid
  - Amazon SES
  - Mailgun
  - Postmark

## 🎯 Funcionalidades

✅ E-mail de boas-vindas no pré-cadastro
✅ E-mail com credenciais na aprovação
✅ E-mail no cadastro direto pelo admin
✅ Templates HTML responsivos
✅ Logo IGEPPS nos e-mails
✅ Design profissional e institucional
✅ Links diretos para a plataforma
✅ Tratamento de erros (não falha se e-mail falhar)

## 📝 Logs

Os e-mails são registrados no console do servidor. Verifique o terminal onde o Next.js está rodando para ver:

- `E-mail de pré-cadastro enviado: <messageId>`
- `E-mail de aprovação enviado: <messageId>`
- `Erro ao enviar e-mail: <erro>`

---

**IGEPPS Academy** - Instituto de Gestão Previdenciária do Estado do Pará
