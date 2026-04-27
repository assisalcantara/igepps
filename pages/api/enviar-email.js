import fs from 'fs';
import path from 'path';

const emailsFilePath = path.join(process.cwd(), 'data', 'emails-enviados.json');

// Função para ler histórico de e-mails
function lerHistoricoEmails() {
  try {
    if (!fs.existsSync(emailsFilePath)) {
      fs.writeFileSync(emailsFilePath, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(emailsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler histórico:', error);
    return [];
  }
}

// Função para salvar histórico
function salvarHistoricoEmails(emails) {
  try {
    fs.writeFileSync(emailsFilePath, JSON.stringify(emails, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar histórico:', error);
    return false;
  }
}

// Importar funções de e-mail
import { enviarEmailPersonalizado } from '../../lib/emailService';

// Importar dados de alunos
const alunosFilePath = path.join(process.cwd(), 'data', 'alunos.json');
function lerAlunos() {
  try {
    if (!fs.existsSync(alunosFilePath)) {
      return [];
    }
    const data = fs.readFileSync(alunosFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler alunos:', error);
    return [];
  }
}

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        // Retornar histórico de e-mails enviados
        const historico = lerHistoricoEmails();
        return res.status(200).json(historico);
      }

      case 'POST': {
        const { destinatarios, assunto, mensagem, tipoDestinatarios } = req.body;

        if (!assunto || !mensagem) {
          return res.status(400).json({ error: 'Assunto e mensagem são obrigatórios' });
        }

        let listaDestinatarios = [];
        const alunos = lerAlunos();

        // Definir destinatários baseado no tipo
        switch (tipoDestinatarios) {
          case 'todos':
            listaDestinatarios = alunos
              .filter(a => a.status === 'aprovado' && a.ativo)
              .map(a => ({ email: a.email, nome: a.nomeCompleto }));
            break;

          case 'ativos':
            listaDestinatarios = alunos
              .filter(a => a.status === 'aprovado' && a.ativo === true)
              .map(a => ({ email: a.email, nome: a.nomeCompleto }));
            break;

          case 'inativos':
            listaDestinatarios = alunos
              .filter(a => a.status === 'aprovado' && a.ativo === false)
              .map(a => ({ email: a.email, nome: a.nomeCompleto }));
            break;

          case 'selecionados':
            // destinatarios deve ser um array de emails
            listaDestinatarios = destinatarios.map(email => {
              const aluno = alunos.find(a => a.email === email);
              return { email, nome: aluno?.nomeCompleto || 'Aluno' };
            });
            break;

          default:
            return res.status(400).json({ error: 'Tipo de destinatários inválido' });
        }

        if (listaDestinatarios.length === 0) {
          return res.status(400).json({ error: 'Nenhum destinatário encontrado' });
        }

        // Enviar e-mails
        const resultados = {
          total: listaDestinatarios.length,
          sucesso: 0,
          falhas: 0,
          erros: []
        };

        for (const destinatario of listaDestinatarios) {
          try {
            await enviarEmailPersonalizado(
              destinatario.email,
              destinatario.nome,
              assunto,
              mensagem
            );
            resultados.sucesso++;
          } catch (error) {
            resultados.falhas++;
            resultados.erros.push({
              email: destinatario.email,
              erro: error.message
            });
          }
        }

        // Salvar no histórico
        const historico = lerHistoricoEmails();
        const novoEmail = {
          id: Date.now(),
          assunto,
          mensagem,
          tipoDestinatarios,
          totalDestinatarios: resultados.total,
          enviados: resultados.sucesso,
          falhas: resultados.falhas,
          dataEnvio: new Date().toISOString(),
          remetente: req.body.remetente || 'Admin'
        };
        historico.unshift(novoEmail); // Adiciona no início
        
        // Manter apenas os últimos 100 registros
        if (historico.length > 100) {
          historico.splice(100);
        }
        
        salvarHistoricoEmails(historico);

        return res.status(200).json({
          success: true,
          resultados,
          historico: novoEmail
        });
      }

      case 'DELETE': {
        // Limpar histórico
        salvarHistoricoEmails([]);
        return res.status(200).json({ success: true, message: 'Histórico limpo' });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Erro na API de envio de e-mails:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
