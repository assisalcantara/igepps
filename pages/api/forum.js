import fs from 'fs';
import path from 'path';

const forumPath = path.join(process.cwd(), 'data', 'forum.json');
const cursosPath = path.join(process.cwd(), 'data', 'cursos.json');
const professoresPath = path.join(process.cwd(), 'data', 'professores.json');

// Criar arquivo se não existir
if (!fs.existsSync(forumPath)) {
  fs.writeFileSync(forumPath, JSON.stringify([], null, 2));
}

export default function handler(req, res) {
  try {
    let topicos = JSON.parse(fs.readFileSync(forumPath, 'utf8'));
    const cursos = JSON.parse(fs.readFileSync(cursosPath, 'utf8'));
    const professores = JSON.parse(fs.readFileSync(professoresPath, 'utf8'));

    if (req.method === 'GET') {
      const { cursoId } = req.query;
      
      // Se cursoId for fornecido, retorna apenas tópicos daquele curso
      if (cursoId) {
        const topicosFiltrados = topicos.filter(t => t.cursoId === parseInt(cursoId));
        return res.status(200).json(topicosFiltrados);
      }
      
      // Retorna todos os tópicos com informações de curso
      const topicosComInfo = topicos.map(topico => {
        const curso = cursos.find(c => c.id === topico.cursoId);
        return {
          ...topico,
          cursoTitulo: curso?.titulo || 'Curso não encontrado'
        };
      });
      
      return res.status(200).json(topicosComInfo);
    }

    if (req.method === 'POST') {
      const { cursoId, autorId, autorNome, autorTipo, titulo, conteudo } = req.body;

      if (!cursoId || !autorId || !titulo || !conteudo) {
        return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
      }

      const novoTopico = {
        id: Date.now(),
        cursoId: parseInt(cursoId),
        autorId,
        autorNome,
        autorTipo, // 'aluno', 'professor' ou 'admin'
        titulo,
        conteudo,
        respostas: [],
        visualizacoes: 0,
        fixado: false,
        fechado: false,
        dataCriacao: new Date().toISOString(),
        dataUltimaResposta: new Date().toISOString()
      };

      topicos.push(novoTopico);
      fs.writeFileSync(forumPath, JSON.stringify(topicos, null, 2));
      
      return res.status(201).json(novoTopico);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { acao, ...dados } = req.body;
      
      const topicoIndex = topicos.findIndex(t => t.id === parseInt(id));

      if (topicoIndex === -1) {
        return res.status(404).json({ erro: 'Tópico não encontrado' });
      }

      // Diferentes ações
      if (acao === 'responder') {
        const novaResposta = {
          id: Date.now(),
          autorId: dados.autorId,
          autorNome: dados.autorNome,
          autorTipo: dados.autorTipo,
          conteudo: dados.conteudo,
          dataCriacao: new Date().toISOString()
        };

        topicos[topicoIndex].respostas.push(novaResposta);
        topicos[topicoIndex].dataUltimaResposta = new Date().toISOString();
      } else if (acao === 'fixar') {
        topicos[topicoIndex].fixado = !topicos[topicoIndex].fixado;
      } else if (acao === 'fechar') {
        topicos[topicoIndex].fechado = !topicos[topicoIndex].fechado;
      } else if (acao === 'visualizar') {
        topicos[topicoIndex].visualizacoes += 1;
      } else {
        // Atualização geral
        topicos[topicoIndex] = {
          ...topicos[topicoIndex],
          ...dados,
          dataAtualizacao: new Date().toISOString()
        };
      }

      fs.writeFileSync(forumPath, JSON.stringify(topicos, null, 2));
      
      return res.status(200).json(topicos[topicoIndex]);
    }

    if (req.method === 'DELETE') {
      const { id, respostaId } = req.query;
      
      if (respostaId) {
        // Deletar uma resposta específica
        const topicoIndex = topicos.findIndex(t => t.id === parseInt(id));
        if (topicoIndex !== -1) {
          topicos[topicoIndex].respostas = topicos[topicoIndex].respostas.filter(
            r => r.id !== parseInt(respostaId)
          );
        }
      } else {
        // Deletar o tópico inteiro
        topicos = topicos.filter(t => t.id !== parseInt(id));
      }
      
      fs.writeFileSync(forumPath, JSON.stringify(topicos, null, 2));
      
      return res.status(200).json({ mensagem: 'Excluído com sucesso' });
    }

    return res.status(405).json({ erro: 'Método não permitido' });

  } catch (error) {
    console.error('Erro na API do fórum:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}
