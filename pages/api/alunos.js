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
          // Cadastro completo pelo admin via Supabase Auth + public.usuarios
          const { nomeCompleto, email, senha, cpf, whatsapp, dataNascimento, endereco, cidade, estado, cep, foto } = req.body;

          if (!email || !senha || !nomeCompleto) {
            return res.status(400).json({ error: 'Nome completo, e-mail e senha são obrigatórios' });
          }

          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmlwgvrtissssknqpvbg.supabase.co';
          const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

          if (!supabaseServiceKey) {
            console.error('SUPABASE_SERVICE_ROLE_KEY não configurada no servidor');
            return res.status(500).json({ error: 'Configuração do servidor incompleta (Service Role Key)' });
          }

          const { createClient } = require('@supabase/supabase-js');
          const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

          // 1. Criar o usuário no Supabase Auth
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: String(email).trim().toLowerCase(),
            password: String(senha),
            email_confirm: true,
            user_metadata: {
              nome_completo: String(nomeCompleto).trim(),
              tipo: 'aluno'
            }
          });

          if (authError) {
            console.error('Erro ao criar usuário no Supabase Auth:', authError);
            if (authError.message?.includes('already registered') || authError.status === 422) {
              return res.status(409).json({ error: 'Este e-mail já está cadastrado no sistema.' });
            }
            return res.status(500).json({ error: 'Erro ao criar usuário no autenticador', detalhe: authError.message });
          }

          const newUserId = authData.user.id;

          // 2. Criar o perfil do aluno na tabela public.usuarios (com ID idêntico ao auth.users.id)
          const { data: usuarioPerfil, error: perfilError } = await supabaseAdmin
            .from('usuarios')
            .insert({
              id: newUserId,
              nome_completo: String(nomeCompleto).trim(),
              email: String(email).trim().toLowerCase(),
              cpf: cpf ? String(cpf).trim() : null,
              whatsapp: whatsapp ? String(whatsapp).trim() : null,
              data_nascimento: dataNascimento || null,
              endereco: endereco ? String(endereco).trim() : null,
              cidade: cidade ? String(cidade).trim() : null,
              estado: estado ? String(estado).trim() : null,
              cep: cep ? String(cep).trim() : null,
              foto_url: foto ? String(foto).trim() : '',
              tipo: 'aluno',
              status: 'ativo'
            })
            .select('*')
            .single();

          if (perfilError) {
            console.error('Erro ao criar perfil em public.usuarios, desfazendo Auth user:', perfilError);
            // Rollback: excluir usuário do Auth se falhar ao criar perfil
            await supabaseAdmin.auth.admin.deleteUser(newUserId);
            return res.status(500).json({ error: 'Erro ao salvar perfil do aluno no banco de dados', detalhe: perfilError.message });
          }

          const alunoFormatado = {
            id: usuarioPerfil.id,
            nomeCompleto: usuarioPerfil.nome_completo,
            email: usuarioPerfil.email,
            cpf: usuarioPerfil.cpf,
            whatsapp: usuarioPerfil.whatsapp,
            status: usuarioPerfil.status,
            tipo: usuarioPerfil.tipo,
            dataCadastro: usuarioPerfil.created_at,
            cursos: [],
            ativo: true
          };

          // Tentar enviar e-mail com credenciais
          try {
            await enviarEmailCadastroCompleto(alunoFormatado, senha);
          } catch (emailError) {
            console.error('Erro ao enviar e-mail de cadastro:', emailError);
          }

          return res.status(201).json(alunoFormatado);
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

          case 'vincularCurso': {
            const alunoId = id || data.alunoId;
            const cursoId = data.cursoId;

            if (!alunoId || !cursoId) {
              return res.status(400).json({ error: 'alunoId e cursoId são obrigatórios para realizar a matrícula' });
            }

            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmlwgvrtissssknqpvbg.supabase.co';
            const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (!supabaseServiceKey) {
              return res.status(500).json({ error: 'Configuração do servidor incompleta (Service Role Key)' });
            }

            const { createClient } = require('@supabase/supabase-js');
            const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

            // 1. Validar que o aluno existe em public.usuarios e tem tipo = 'aluno'
            const { data: usuarioAluno, error: errAluno } = await supabaseAdmin
              .from('usuarios')
              .select('id, tipo, nome_completo, email')
              .eq('id', String(alunoId))
              .single();

            if (errAluno || !usuarioAluno || usuarioAluno.tipo !== 'aluno') {
              return res.status(404).json({ error: 'Aluno não encontrado no banco de dados' });
            }

            // 2. Validar que o curso existe em public.cursos
            const { data: cursoExistente, error: errCurso } = await supabaseAdmin
              .from('cursos')
              .select('id, titulo')
              .eq('id', String(cursoId))
              .single();

            if (errCurso || !cursoExistente) {
              return res.status(404).json({ error: 'Curso não encontrado no banco de dados' });
            }

            // 3. Verificar se já existe matrícula ativa para evitar erro de UNIQUE constraint
            const { data: matriculaExistente } = await supabaseAdmin
              .from('matriculas')
              .select('*')
              .eq('aluno_id', String(alunoId))
              .eq('curso_id', String(cursoId))
              .maybeSingle();

            if (matriculaExistente) {
              return res.status(200).json({
                message: 'O aluno já está matriculado neste curso.',
                matricula: matriculaExistente
              });
            }

            // 4. Inserir nova matrícula no Supabase PostgreSQL
            const { data: novaMatricula, error: errMat } = await supabaseAdmin
              .from('matriculas')
              .insert({
                aluno_id: String(alunoId),
                curso_id: String(cursoId),
                progresso_percentual: 0,
                status: 'em_andamento'
              })
              .select('*')
              .single();

            if (errMat) {
              console.error('Erro ao criar matrícula no Supabase:', errMat);
              if (errMat.code === '23505') {
                return res.status(409).json({ error: 'O aluno já está matriculado neste curso.' });
              }
              return res.status(500).json({ error: 'Erro ao registrar matrícula no banco de dados', detalhe: errMat.message });
            }

            return res.status(201).json({
              success: true,
              message: 'Matrícula realizada com sucesso!',
              matricula: novaMatricula
            });
          }

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
