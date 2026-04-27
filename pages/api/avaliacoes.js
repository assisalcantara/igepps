import fs from 'fs';
import path from 'path';

const avaliacoesPath = path.join(process.cwd(), 'data', 'avaliacoes.json');

// Garantir que o arquivo existe
if (!fs.existsSync(avaliacoesPath)) {
  fs.writeFileSync(avaliacoesPath, JSON.stringify([], null, 2));
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = fs.readFileSync(avaliacoesPath, 'utf8');
      const avaliacoes = JSON.parse(data);
      res.status(200).json(avaliacoes);
    } catch (error) {
      console.error('Erro ao ler avaliações:', error);
      res.status(500).json({ error: 'Erro ao carregar avaliações' });
    }
  } else if (req.method === 'POST') {
    try {
      const { cursoId, aulaId, alunoId, alunoNome, estrelas, comentario } = req.body;

      if (!cursoId || !aulaId || !alunoId || !estrelas) {
        return res.status(400).json({ error: 'Dados incompletos' });
      }

      const data = fs.readFileSync(avaliacoesPath, 'utf8');
      const avaliacoes = JSON.parse(data);

      const novaAvaliacao = {
        id: Date.now(),
        cursoId,
        aulaId,
        alunoId,
        alunoNome,
        estrelas,
        comentario: comentario || '',
        data: new Date().toISOString()
      };

      avaliacoes.push(novaAvaliacao);

      fs.writeFileSync(avaliacoesPath, JSON.stringify(avaliacoes, null, 2));

      res.status(201).json({ message: 'Avaliação salva com sucesso', avaliacao: novaAvaliacao });
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      res.status(500).json({ error: 'Erro ao salvar avaliação' });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
