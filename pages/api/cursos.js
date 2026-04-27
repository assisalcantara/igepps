import fs from 'fs';
import path from 'path';

const cursosFilePath = path.join(process.cwd(), 'data', 'cursos.json');

// Função para ler cursos
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

// Função para salvar cursos
function salvarCursos(cursos) {
  try {
    fs.writeFileSync(cursosFilePath, JSON.stringify(cursos, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar cursos:', error);
    return false;
  }
}

export default function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
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
        const cursoIndex = cursos.findIndex(c => c.id === id);
        
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
            const moduloIndex = cursos[cursoIndex].modulos.findIndex(m => m.id === data.moduloId);
            if (moduloIndex !== -1) {
              cursos[cursoIndex].modulos[moduloIndex] = { ...cursos[cursoIndex].modulos[moduloIndex], ...data.updates };
            }
            break;

          case 'deleteModulo':
            cursos[cursoIndex].modulos = cursos[cursoIndex].modulos.filter(m => m.id !== data.moduloId);
            break;

          case 'addAula':
            const modulo = cursos[cursoIndex].modulos.find(m => m.id === data.moduloId);
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
            const mod = cursos[cursoIndex].modulos.find(m => m.id === data.moduloId);
            if (mod) {
              const aulaIndex = mod.aulas.findIndex(a => a.id === data.aulaId);
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
