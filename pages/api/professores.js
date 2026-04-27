import fs from 'fs';
import path from 'path';

const professoresPath = path.join(process.cwd(), 'data', 'professores.json');

// Criar arquivo se não existir
if (!fs.existsSync(professoresPath)) {
  fs.writeFileSync(professoresPath, JSON.stringify([], null, 2));
}

export default function handler(req, res) {
  try {
    let professores = JSON.parse(fs.readFileSync(professoresPath, 'utf8'));

    if (req.method === 'GET') {
      return res.status(200).json(professores);
    }

    if (req.method === 'POST') {
      const novoProfessor = {
        id: Date.now(),
        ...req.body,
        dataCriacao: new Date().toISOString()
      };

      professores.push(novoProfessor);
      fs.writeFileSync(professoresPath, JSON.stringify(professores, null, 2));
      
      return res.status(201).json(novoProfessor);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const professorIndex = professores.findIndex(p => p.id === parseInt(id));

      if (professorIndex === -1) {
        return res.status(404).json({ erro: 'Professor não encontrado' });
      }

      professores[professorIndex] = {
        ...professores[professorIndex],
        ...req.body,
        dataAtualizacao: new Date().toISOString()
      };

      fs.writeFileSync(professoresPath, JSON.stringify(professores, null, 2));
      
      return res.status(200).json(professores[professorIndex]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      professores = professores.filter(p => p.id !== parseInt(id));
      
      fs.writeFileSync(professoresPath, JSON.stringify(professores, null, 2));
      
      return res.status(200).json({ mensagem: 'Professor excluído com sucesso' });
    }

    return res.status(405).json({ erro: 'Método não permitido' });

  } catch (error) {
    console.error('Erro na API de professores:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}
