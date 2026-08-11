import fs from 'fs';
import path from 'path';
import { supabase } from '../../lib/supabase';

const cursosFilePath = path.join(process.cwd(), 'data', 'cursos.json');

// Função para ler cursos do JSON local (Fallback)
function lerCursos() {
  try {
    if (!fs.existsSync(cursosFilePath)) {
      fs.writeFileSync(cursosFilePath, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(cursosFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler cursos:', error);
    return [];
  }
}

// Função para buscar e adaptar a árvore completa de cursos do Supabase PostgreSQL
async function lerCursosSupabase() {
  try {
    const { data: dbCursos, error } = await supabase
      .from('cursos')
      .select('id, titulo, descricao, categoria, carga_horaria, thumbnail_url, video_apresentacao_url, ativo, created_at, modulos ( id, titulo, descricao, ordem, aulas ( id, titulo, descricao, video_url, duracao_minutos, ordem, materiais_apoio ( id, titulo, tipo, arquivo_url ) ) ), avaliacoes!avaliacoes_curso_id_fkey ( id, titulo, descricao, nota_minima, duracao_minutos, questoes ( id, enunciado, ordem, opcoes ( id, texto, is_correta, ordem ) ) )');

    if (error || !dbCursos || dbCursos.length === 0) {
      return null;
    }

    return dbCursos.map(c => {
      const avalDb = Array.isArray(c.avaliacoes) ? c.avaliacoes[0] : c.avaliacoes;
      
      let avaliacaoObj = null;
      if (avalDb) {
        const questoesOrdenadas = (avalDb.questoes || []).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
        const questoesFormatadas = questoesOrdenadas.map(q => {
          const opcoesOrdenadas = (q.opcoes || []).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
          const respostaCorretaIdx = opcoesOrdenadas.findIndex(op => op.is_correta);
          return {
            id: q.id,
            enunciado: q.enunciado,
            opcoes: opcoesOrdenadas.map(op => op.texto),
            respostaCorreta: respostaCorretaIdx !== -1 ? respostaCorretaIdx : 0
          };
        });

        avaliacaoObj = {
          id: avalDb.id,
          titulo: avalDb.titulo,
          descricao: avalDb.descricao,
          notaMinima: avalDb.nota_minima,
          duracaoMinutos: avalDb.duracao_minutos,
          questoes: questoesFormatadas
        };
      }

      const modulosOrdenados = (c.modulos || []).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
      const modulosFormatados = modulosOrdenados.map(m => {
        const aulasOrdenadas = (m.aulas || []).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
        const aulasFormatadas = aulasOrdenadas.map(a => {
          const materiaisFormatados = (a.materiais_apoio || []).map(mat => ({
            id: mat.id,
            titulo: mat.titulo,
            tipo: mat.tipo || 'pdf',
            url: mat.arquivo_url
          }));

          return {
            id: a.id,
            titulo: a.titulo,
            descricao: a.descricao,
            videoUrl: a.video_url,
            duracao: String(a.duracao_minutos || 0),
            ordem: a.ordem,
            materiais: materiaisFormatados,
            questoes: []
          };
        });

        return {
          id: m.id,
          titulo: m.titulo,
          descricao: m.descricao,
          ordem: m.ordem,
          aulas: aulasFormatadas
        };
      });

      return {
        id: c.id,
        titulo: c.titulo,
        descricao: c.descricao,
        categoria: c.categoria || 'Geral',
        cargaHoraria: String(c.carga_horaria || 15),
        thumbnail: c.thumbnail_url || '',
        videoApresentacao: c.video_apresentacao_url || '',
        ativo: c.ativo !== false,
        dataCriacao: c.created_at,
        modulos: modulosFormatados,
        avaliacao: avaliacaoObj
      };
    });
  } catch (err) {
    console.error('Erro na consulta Supabase cursos:', err);
    return null;
  }
}

// Função para salvar cursos (mantida para compatibilidade local)
function salvarCursos(cursos) {
  try {
    fs.writeFileSync(cursosFilePath, JSON.stringify(cursos, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar cursos:', error);
    return false;
  }
}

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const dbCursos = await lerCursosSupabase();
        if (dbCursos) {
          return res.status(200).json(dbCursos);
        }
        const cursos = lerCursos();
        return res.status(200).json(cursos);
      }

      case 'POST': {
        const cursos = lerCursos();
        const novoCurso = {
          id: Date.now(),
          titulo: req.body.titulo,
          descricao: req.body.descricao,
          categoria: req.body.categoria,
          cargaHoraria: req.body.cargaHoraria,
          thumbnail: req.body.thumbnail || '',
          videoApresentacao: req.body.videoApresentacao || '',
          ativo: req.body.ativo !== false,
          dataCriacao: new Date().toISOString(),
          modulos: []
        };
        cursos.push(novoCurso);
        salvarCursos(cursos);
        return res.status(201).json(novoCurso);
      }

      case 'PUT': {
        const { id, action, data } = req.body;
        const cursos = lerCursos();
        const cursoIndex = cursos.findIndex(c => String(c.id) === String(id));
        
        if (cursoIndex === -1) {
          return res.status(404).json({ error: 'Curso não encontrado' });
        }

        switch (action) {
          case 'updateCurso':
            cursos[cursoIndex] = { 
              ...cursos[cursoIndex], 
              titulo: data.titulo,
              descricao: data.descricao,
              categoria: data.categoria,
              cargaHoraria: data.cargaHoraria,
              thumbnail: data.thumbnail || cursos[cursoIndex].thumbnail || '',
              videoApresentacao: data.videoApresentacao || cursos[cursoIndex].videoApresentacao || '',
              ativo: data.ativo !== undefined ? data.ativo : cursos[cursoIndex].ativo
            };
            break;

          case 'addModulo':
            const novoModulo = {
              id: Date.now(),
              titulo: data.titulo,
              descricao: data.descricao,
              ordem: cursos[cursoIndex].modulos.length + 1,
              aulas: []
            };
            cursos[cursoIndex].modulos.push(novoModulo);
            break;

          case 'updateModulo':
            const moduloIndex = cursos[cursoIndex].modulos.findIndex(m => String(m.id) === String(data.moduloId));
            if (moduloIndex !== -1) {
              cursos[cursoIndex].modulos[moduloIndex] = { ...cursos[cursoIndex].modulos[moduloIndex], ...data.updates };
            }
            break;

          case 'deleteModulo':
            cursos[cursoIndex].modulos = cursos[cursoIndex].modulos.filter(m => String(m.id) !== String(data.moduloId));
            break;

          case 'addAula':
            const modulo = cursos[cursoIndex].modulos.find(m => String(m.id) === String(data.moduloId));
            if (modulo) {
              const novaAula = {
                id: Date.now(),
                titulo: data.titulo,
                descricao: data.descricao,
                videoUrl: data.videoUrl,
                duracao: data.duracao,
                ordem: modulo.aulas.length + 1,
                materiais: [],
                questoes: []
              };
              modulo.aulas.push(novaAula);
            }
            break;

          case 'updateAula':
            const mod = cursos[cursoIndex].modulos.find(m => String(m.id) === String(data.moduloId));
            if (mod) {
              const aulaIndex = mod.aulas.findIndex(a => String(a.id) === String(data.aulaId));
              if (aulaIndex !== -1) {
                mod.aulas[aulaIndex] = {
                  ...mod.aulas[aulaIndex],
                  titulo: data.titulo,
                  descricao: data.descricao,
                  videoUrl: data.videoUrl,
                  duracao: data.duracao
                };
              }
            }
            break;

          case 'deleteAula':
            const moduloAula = cursos[cursoIndex].modulos.find(m => m.id === data.moduloId);
            if (moduloAula) {
              moduloAula.aulas = moduloAula.aulas.filter(a => a.id !== data.aulaId);
            }
            break;

          case 'addMaterial':
            const moduloMat = cursos[cursoIndex].modulos.find(m => m.id === data.moduloId);
            if (moduloMat) {
              const aulaMat = moduloMat.aulas.find(a => a.id === data.aulaId);
              if (aulaMat) {
                const novoMaterial = {
                  id: Date.now(),
                  titulo: data.titulo,
                  tipo: data.tipo, // 'pdf' ou 'imagem'
                  url: data.url
                };
                aulaMat.materiais.push(novoMaterial);
              }
            }
            break;

          case 'deleteMaterial':
            const moduloDelMat = cursos[cursoIndex].modulos.find(m => m.id === data.moduloId);
            if (moduloDelMat) {
              const aulaDelMat = moduloDelMat.aulas.find(a => a.id === data.aulaId);
              if (aulaDelMat) {
                aulaDelMat.materiais = aulaDelMat.materiais.filter(m => m.id !== data.materialId);
              }
            }
            break;

          case 'addQuestao':
            const moduloQuest = cursos[cursoIndex].modulos.find(m => m.id === data.moduloId);
            if (moduloQuest) {
              const aulaQuest = moduloQuest.aulas.find(a => a.id === data.aulaId);
              if (aulaQuest) {
                const novaQuestao = {
                  id: Date.now(),
                  pergunta: data.pergunta,
                  alternativas: data.alternativas, // array de strings
                  respostaCorreta: data.respostaCorreta, // índice da alternativa correta
                  explicacao: data.explicacao || ''
                };
                aulaQuest.questoes.push(novaQuestao);
              }
            }
            break;

          case 'updateQuestao':
            const moduloUpQuest = cursos[cursoIndex].modulos.find(m => m.id === data.moduloId);
            if (moduloUpQuest) {
              const aulaUpQuest = moduloUpQuest.aulas.find(a => a.id === data.aulaId);
              if (aulaUpQuest) {
                const questaoIndex = aulaUpQuest.questoes.findIndex(q => q.id === data.questaoId);
                if (questaoIndex !== -1) {
                  aulaUpQuest.questoes[questaoIndex] = { ...aulaUpQuest.questoes[questaoIndex], ...data.updates };
                }
              }
            }
            break;

          case 'deleteQuestao':
            const moduloDelQuest = cursos[cursoIndex].modulos.find(m => m.id === data.moduloId);
            if (moduloDelQuest) {
              const aulaDelQuest = moduloDelQuest.aulas.find(a => a.id === data.aulaId);
              if (aulaDelQuest) {
                aulaDelQuest.questoes = aulaDelQuest.questoes.filter(q => q.id !== data.questaoId);
              }
            }
            break;

          default:
            return res.status(400).json({ error: 'Ação inválida' });
        }

        salvarCursos(cursos);
        return res.status(200).json(cursos[cursoIndex]);
      }

      case 'DELETE': {
        const { id } = req.query;
        const cursos = lerCursos();
        const novosCursos = cursos.filter(c => c.id !== parseInt(id));
        salvarCursos(novosCursos);
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Erro na API de cursos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
