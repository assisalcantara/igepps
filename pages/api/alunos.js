import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { enviarEmailPrecadastro, enviarEmailAprovacao, enviarEmailCadastroCompleto } from '../../lib/emailService';

const alunosFilePath = path.join(process.cwd(), 'data', 'alunos.json');

// Função para ler alunos
function lerAlunos() {
  try {
    if (!fs.existsSync(alunosFilePath)) {
      fs.writeFileSync(alunosFilePath, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(alunosFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler alunos:', error);
    return [];
  }
}

// Função para salvar alunos
function salvarAlunos(alunos) {
  try {
    fs.writeFileSync(alunosFilePath, JSON.stringify(alunos, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar alunos:', error);
    return false;
  }
}

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const alunos = lerAlunos();
        const { status } = req.query;
        
        if (status) {
          const alunosFiltrados = alunos.filter(a => a.status === status);
          return res.status(200).json(alunosFiltrados);
        }
        
        return res.status(200).json(alunos);
      }

      case 'POST': {
        const alunos = lerAlunos();
        const { tipo } = req.body; // 'precadastro' ou 'completo'

        if (tipo === 'precadastro') {
          // Pré-cadastro da home (sem senha)
          const novoAluno = {
            id: Date.now(),
            nomeCompleto: req.body.nomeCompleto,
            email: req.body.email,
            whatsapp: req.body.whatsapp,
            status: 'pendente', // pendente, aprovado, rejeitado
            tipo: 'aluno',
            dataCadastro: new Date().toISOString(),
            cursos: []
          };
          alunos.push(novoAluno);
          salvarAlunos(alunos);
          
          // Enviar e-mail de pré-cadastro
          try {
            await enviarEmailPrecadastro(novoAluno);
          } catch (emailError) {
            console.error('Erro ao enviar e-mail:', emailError);
            // Não falha o cadastro se o e-mail falhar
          }
          
          return res.status(201).json({ success: true, message: 'Pré-cadastro realizado com sucesso!' });
        } else {
          // Cadastro completo pelo admin
          // Verificar se email já existe
          const emailExiste = alunos.find(a => a.email === req.body.email);
          if (emailExiste) {
            return res.status(400).json({ error: 'Email já cadastrado' });
          }

          // Hash da senha
          const senhaHash = await bcrypt.hash(req.body.senha, 10);

          const novoAluno = {
            id: Date.now(),
            nomeCompleto: req.body.nomeCompleto,
            email: req.body.email,
            senha: senhaHash,
            cpf: req.body.cpf,
            whatsapp: req.body.whatsapp,
            dataNascimento: req.body.dataNascimento,
            endereco: req.body.endereco,
            cidade: req.body.cidade,
            estado: req.body.estado,
            cep: req.body.cep,
            foto: req.body.foto || '',
            status: 'aprovado',
            tipo: 'aluno',
            dataCadastro: new Date().toISOString(),
            cursos: req.body.cursos || [],
            ativo: true
          };
          alunos.push(novoAluno);
          salvarAlunos(alunos);
          
          // Enviar e-mail com credenciais
          try {
            await enviarEmailCadastroCompleto(novoAluno, req.body.senha);
          } catch (emailError) {
            console.error('Erro ao enviar e-mail:', emailError);
            // Não falha o cadastro se o e-mail falhar
          }
          
          return res.status(201).json(novoAluno);
        }
      }

      case 'PUT': {
        const { id, action, data } = req.body;
        const alunos = lerAlunos();
        const alunoIndex = alunos.findIndex(a => a.id === id);
        
        if (alunoIndex === -1) {
          return res.status(404).json({ error: 'Aluno não encontrado' });
        }

        switch (action) {
          case 'aprovar':
            // Aprovar pré-cadastro e completar dados
            const senhaHash = await bcrypt.hash(data.senha, 10);
            const senhaTemporaria = data.senha; // Guardar antes de fazer hash
            alunos[alunoIndex] = {
              ...alunos[alunoIndex],
              ...data,
              senha: senhaHash,
              status: 'aprovado',
              dataAprovacao: new Date().toISOString()
            };
            
            // Enviar e-mail de aprovação com credenciais
            try {
              await enviarEmailAprovacao(alunos[alunoIndex], senhaTemporaria);
            } catch (emailError) {
              console.error('Erro ao enviar e-mail de aprovação:', emailError);
            }
            break;

          case 'rejeitar':
            alunos[alunoIndex].status = 'rejeitado';
            alunos[alunoIndex].dataRejeicao = new Date().toISOString();
            alunos[alunoIndex].motivoRejeicao = data.motivo || '';
            break;

          case 'atualizar':
            // Atualizar dados do aluno
            const dadosAtualizados = { ...data };
            
            // Se estiver mudando a senha, fazer hash
            if (data.senha) {
              dadosAtualizados.senha = await bcrypt.hash(data.senha, 10);
            }
            
            alunos[alunoIndex] = { ...alunos[alunoIndex], ...dadosAtualizados };
            break;

          case 'vincularCurso':
            if (!alunos[alunoIndex].cursos.includes(data.cursoId)) {
              alunos[alunoIndex].cursos.push(data.cursoId);
            }
            break;

          case 'desvincularCurso':
            alunos[alunoIndex].cursos = alunos[alunoIndex].cursos.filter(
              c => c !== data.cursoId
            );
            break;

          case 'alterarStatus':
            alunos[alunoIndex].ativo = data.ativo;
            break;

          default:
            return res.status(400).json({ error: 'Ação inválida' });
        }

        salvarAlunos(alunos);
        
        // Remover senha da resposta
        const alunoResposta = { ...alunos[alunoIndex] };
        delete alunoResposta.senha;
        
        return res.status(200).json(alunoResposta);
      }

      case 'DELETE': {
        const { id } = req.query;
        const alunos = lerAlunos();
        const novosAlunos = alunos.filter(a => a.id !== parseInt(id));
        salvarAlunos(novosAlunos);
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Erro na API de alunos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
