import nodemailer from 'nodemailer';

// Configuração do transporte de e-mail
// IMPORTANTE: Configure as variáveis de ambiente no arquivo .env.local
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.SMTP_USER, // seu email
    pass: process.env.SMTP_PASS  // senha de app ou senha do email
  }
});

// Template de e-mail de pré-cadastro
export function templatePrecadastro(aluno) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pré-Cadastro Realizado - IGEPPS Academy</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              
              <!-- Header com Logo -->
              <tr>
                <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
                  <img src="https://www.igepps.pa.gov.br/sites/default/files/logo-igepps_2.png" alt="IGEPPS" style="max-width: 200px; height: auto; margin-bottom: 20px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">IGEPPS Academy</h1>
                  <p style="color: #fbbf24; margin: 10px 0 0 0; font-size: 16px;">Educação a Distância</p>
                </td>
              </tr>
              
              <!-- Conteúdo -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1e3a8a; margin: 0 0 20px 0; font-size: 24px;">Pré-Cadastro Realizado com Sucesso! 🎉</h2>
                  
                  <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0; font-size: 16px;">
                    Olá, <strong>${aluno.nomeCompleto}</strong>!
                  </p>
                  
                  <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0; font-size: 16px;">
                    Recebemos seu pré-cadastro na plataforma <strong>IGEPPS Academy</strong> com sucesso!
                  </p>
                  
                  <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 5px;">
                    <h3 style="color: #1e3a8a; margin: 0 0 15px 0; font-size: 18px;">📋 Seus Dados:</h3>
                    <table style="width: 100%;">
                      <tr>
                        <td style="padding: 5px 0; color: #6b7280; font-weight: bold;">Nome:</td>
                        <td style="padding: 5px 0; color: #374151;">${aluno.nomeCompleto}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #6b7280; font-weight: bold;">E-mail:</td>
                        <td style="padding: 5px 0; color: #374151;">${aluno.email}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #6b7280; font-weight: bold;">WhatsApp:</td>
                        <td style="padding: 5px 0; color: #374151;">${aluno.whatsapp}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <div style="background-color: #fef3c7; border-left: 4px solid #fbbf24; padding: 20px; margin: 25px 0; border-radius: 5px;">
                    <p style="color: #92400e; margin: 0; line-height: 1.6;">
                      <strong>⏳ Próximos Passos:</strong><br>
                      Seu cadastro está em análise pela equipe administrativa do IGEPPS. Você receberá um novo e-mail com suas credenciais de acesso assim que seu cadastro for aprovado.
                    </p>
                  </div>
                  
                  <p style="color: #374151; line-height: 1.6; margin: 25px 0 0 0; font-size: 16px;">
                    Agradecemos pelo interesse em fazer parte da <strong>IGEPPS Academy</strong>!
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #1e3a8a; padding: 30px; text-align: center;">
                  <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 14px;">
                    <strong>IGEPPS - Instituto de Gestão Previdenciária do Estado do Pará</strong>
                  </p>
                  <p style="color: #93c5fd; margin: 0; font-size: 12px; line-height: 1.6;">
                    Travessa Padre Eutíquio, 1309 - Batista Campos, Belém - PA<br>
                    Tel: (91) 3202-8400 | www.igepps.pa.gov.br
                  </p>
                  <div style="margin-top: 20px;">
                    <a href="https://www.igepps.pa.gov.br" style="color: #fbbf24; text-decoration: none; margin: 0 10px; font-size: 12px;">Site Oficial</a>
                    <span style="color: #60a5fa;">|</span>
                    <a href="mailto:contato@igepps.pa.gov.br" style="color: #fbbf24; text-decoration: none; margin: 0 10px; font-size: 12px;">Contato</a>
                  </div>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Template de e-mail de aprovação com credenciais
export function templateAprovacao(aluno, senhaTemporaria) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bem-vindo à IGEPPS Academy!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              
              <!-- Header com Logo -->
              <tr>
                <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
                  <img src="https://www.igepps.pa.gov.br/sites/default/files/logo-igepps_2.png" alt="IGEPPS" style="max-width: 200px; height: auto; margin-bottom: 20px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">IGEPPS Academy</h1>
                  <p style="color: #fbbf24; margin: 10px 0 0 0; font-size: 16px;">Bem-vindo(a)!</p>
                </td>
              </tr>
              
              <!-- Conteúdo -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #10b981; margin: 0 0 20px 0; font-size: 24px;">✅ Cadastro Aprovado!</h2>
                  
                  <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0; font-size: 16px;">
                    Parabéns, <strong>${aluno.nomeCompleto}</strong>!
                  </p>
                  
                  <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0; font-size: 16px;">
                    Seu cadastro foi aprovado e agora você tem acesso completo à plataforma <strong>IGEPPS Academy</strong>!
                  </p>
                  
                  <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 5px;">
                    <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px;">🔑 Suas Credenciais de Acesso:</h3>
                    <table style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0; color: #065f46; font-weight: bold;">E-mail:</td>
                        <td style="padding: 8px 0; color: #047857; font-family: monospace; font-size: 15px;">${aluno.email}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #065f46; font-weight: bold;">Senha:</td>
                        <td style="padding: 8px 0; color: #047857; font-family: monospace; font-size: 15px; background-color: #ffffff; padding: 5px 10px; border-radius: 4px;"><strong>${senhaTemporaria}</strong></td>
                      </tr>
                    </table>
                  </div>
                  
                  <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 5px;">
                    <h3 style="color: #1e3a8a; margin: 0 0 15px 0; font-size: 18px;">📚 Cursos Disponíveis:</h3>
                    <p style="color: #374151; margin: 0; line-height: 1.6;">
                      Você foi matriculado em <strong>${aluno.cursos ? aluno.cursos.length : 0} curso(s)</strong>. Acesse a plataforma para começar seus estudos!
                    </p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/login" style="display: inline-block; background-color: #1e3a8a; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      Acessar Plataforma
                    </a>
                  </div>
                  
                  <div style="background-color: #fef3c7; border-left: 4px solid #fbbf24; padding: 20px; margin: 25px 0; border-radius: 5px;">
                    <p style="color: #92400e; margin: 0; line-height: 1.6; font-size: 14px;">
                      <strong>⚠️ Importante:</strong><br>
                      Recomendamos que você altere sua senha no primeiro acesso. Acesse: <strong>Meu Perfil → Alterar Senha</strong>
                    </p>
                  </div>
                  
                  <p style="color: #374151; line-height: 1.6; margin: 25px 0 0 0; font-size: 16px;">
                    Bons estudos! Se tiver dúvidas, entre em contato conosco.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #1e3a8a; padding: 30px; text-align: center;">
                  <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 14px;">
                    <strong>IGEPPS - Instituto de Gestão Previdenciária do Estado do Pará</strong>
                  </p>
                  <p style="color: #93c5fd; margin: 0; font-size: 12px; line-height: 1.6;">
                    Travessa Padre Eutíquio, 1309 - Batista Campos, Belém - PA<br>
                    Tel: (91) 3202-8400 | www.igepps.pa.gov.br
                  </p>
                  <div style="margin-top: 20px;">
                    <a href="https://www.igepps.pa.gov.br" style="color: #fbbf24; text-decoration: none; margin: 0 10px; font-size: 12px;">Site Oficial</a>
                    <span style="color: #60a5fa;">|</span>
                    <a href="mailto:contato@igepps.pa.gov.br" style="color: #fbbf24; text-decoration: none; margin: 0 10px; font-size: 12px;">Contato</a>
                  </div>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Função para enviar e-mail de pré-cadastro
export async function enviarEmailPrecadastro(aluno) {
  try {
    const mailOptions = {
      from: `"IGEPPS Academy" <${process.env.SMTP_USER}>`,
      to: aluno.email,
      subject: 'Pré-Cadastro Realizado - IGEPPS Academy',
      html: templatePrecadastro(aluno)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail de pré-cadastro enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar e-mail de pré-cadastro:', error);
    return { success: false, error: error.message };
  }
}

// Função para enviar e-mail de aprovação
export async function enviarEmailAprovacao(aluno, senhaTemporaria) {
  try {
    const mailOptions = {
      from: `"IGEPPS Academy" <${process.env.SMTP_USER}>`,
      to: aluno.email,
      subject: 'Bem-vindo à IGEPPS Academy - Cadastro Aprovado! 🎉',
      html: templateAprovacao(aluno, senhaTemporaria)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail de aprovação enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar e-mail de aprovação:', error);
    return { success: false, error: error.message };
  }
}

// Função para enviar e-mail de cadastro completo (pelo admin)
export async function enviarEmailCadastroCompleto(aluno, senhaTemporaria) {
  try {
    const mailOptions = {
      from: `"IGEPPS Academy" <${process.env.SMTP_USER}>`,
      to: aluno.email,
      subject: 'Bem-vindo à IGEPPS Academy! 🎓',
      html: templateAprovacao(aluno, senhaTemporaria)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail de cadastro completo enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar e-mail de cadastro completo:', error);
    return { success: false, error: error.message };
  }
}

// Template de e-mail personalizado (para comunicações gerais)
export function templatePersonalizado(nomeAluno, assunto, mensagem) {
  // Converter quebras de linha em <br> e parágrafos
  const mensagemFormatada = mensagem
    .split('\n\n')
    .map(paragrafo => `<p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0; font-size: 16px;">${paragrafo.replace(/\n/g, '<br>')}</p>`)
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${assunto}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              
              <!-- Header com Logo -->
              <tr>
                <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
                  <img src="https://www.igepps.pa.gov.br/sites/default/files/logo-igepps_2.png" alt="IGEPPS" style="max-width: 200px; height: auto; margin-bottom: 20px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">IGEPPS Academy</h1>
                  <p style="color: #fbbf24; margin: 10px 0 0 0; font-size: 16px;">Comunicado</p>
                </td>
              </tr>
              
              <!-- Conteúdo -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1e3a8a; margin: 0 0 20px 0; font-size: 24px;">${assunto}</h2>
                  
                  <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0; font-size: 16px;">
                    Olá, <strong>${nomeAluno}</strong>!
                  </p>
                  
                  ${mensagemFormatada}
                  
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.6;">
                      Esta é uma mensagem automática da plataforma IGEPPS Academy. 
                      Para acessar sua conta, <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/login" style="color: #3b82f6; text-decoration: none;">clique aqui</a>.
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #1e3a8a; padding: 30px; text-align: center;">
                  <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 14px;">
                    <strong>IGEPPS - Instituto de Gestão Previdenciária do Estado do Pará</strong>
                  </p>
                  <p style="color: #93c5fd; margin: 0; font-size: 12px; line-height: 1.6;">
                    Travessa Padre Eutíquio, 1309 - Batista Campos, Belém - PA<br>
                    Tel: (91) 3202-8400 | www.igepps.pa.gov.br
                  </p>
                  <div style="margin-top: 20px;">
                    <a href="https://www.igepps.pa.gov.br" style="color: #fbbf24; text-decoration: none; margin: 0 10px; font-size: 12px;">Site Oficial</a>
                    <span style="color: #60a5fa;">|</span>
                    <a href="mailto:contato@igepps.pa.gov.br" style="color: #fbbf24; text-decoration: none; margin: 0 10px; font-size: 12px;">Contato</a>
                  </div>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Função para enviar e-mail personalizado
export async function enviarEmailPersonalizado(email, nomeAluno, assunto, mensagem) {
  try {
    const mailOptions = {
      from: `"IGEPPS Academy" <${process.env.SMTP_USER}>`,
      to: email,
      subject: assunto,
      html: templatePersonalizado(nomeAluno, assunto, mensagem)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail personalizado enviado para:', email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar e-mail personalizado:', error);
    throw error;
  }
}
