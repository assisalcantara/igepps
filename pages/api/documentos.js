import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

const documentosPath = path.join(process.cwd(), 'data', 'documentos.json');

// Garantir que o arquivo existe
if (!fs.existsSync(documentosPath)) {
  fs.writeFileSync(documentosPath, JSON.stringify([], null, 2));
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = fs.readFileSync(documentosPath, 'utf8');
      const documentos = JSON.parse(data);
      res.status(200).json(documentos);
    } catch (error) {
      console.error('Erro ao ler documentos:', error);
      res.status(500).json({ error: 'Erro ao carregar documentos' });
    }
  } else if (req.method === 'POST') {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documentos');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filename: (name, ext, part) => {
        return `${Date.now()}-${part.originalFilename}`;
      }
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Erro ao fazer upload:', err);
        return res.status(500).json({ error: 'Erro ao fazer upload do documento' });
      }

      try {
        const file = files.documento[0];
        const fileName = path.basename(file.filepath);

        const data = fs.readFileSync(documentosPath, 'utf8');
        const documentos = JSON.parse(data);

        const novoDocumento = {
          id: Date.now(),
          cursoId: fields.cursoId[0],
          cursoNome: fields.cursoNome[0],
          aulaId: fields.aulaId[0],
          aulaNome: fields.aulaNome[0],
          alunoId: fields.alunoId[0],
          alunoNome: fields.alunoNome[0],
          descricao: fields.descricao[0] || '',
          arquivo: fileName,
          arquivoOriginal: file.originalFilename,
          tamanho: file.size,
          tipo: file.mimetype,
          url: `/uploads/documentos/${fileName}`,
          status: 'pendente',
          data: new Date().toISOString(),
          visualizado: false
        };

        documentos.push(novoDocumento);

        fs.writeFileSync(documentosPath, JSON.stringify(documentos, null, 2));

        res.status(201).json({ 
          message: 'Documento enviado com sucesso', 
          documento: novoDocumento 
        });
      } catch (error) {
        console.error('Erro ao salvar documento:', error);
        res.status(500).json({ error: 'Erro ao salvar documento' });
      }
    });
  } else if (req.method === 'PUT') {
    try {
      const { id, status, comentario, visualizado } = req.body;

      const data = fs.readFileSync(documentosPath, 'utf8');
      const documentos = JSON.parse(data);

      const index = documentos.findIndex(d => d.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Documento não encontrado' });
      }

      if (status) documentos[index].status = status;
      if (comentario !== undefined) documentos[index].comentario = comentario;
      if (visualizado !== undefined) documentos[index].visualizado = visualizado;
      documentos[index].dataAtualizacao = new Date().toISOString();

      fs.writeFileSync(documentosPath, JSON.stringify(documentos, null, 2));

      res.status(200).json({ 
        message: 'Documento atualizado com sucesso', 
        documento: documentos[index] 
      });
    } catch (error) {
      console.error('Erro ao atualizar documento:', error);
      res.status(500).json({ error: 'Erro ao atualizar documento' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      const data = fs.readFileSync(documentosPath, 'utf8');
      const documentos = JSON.parse(data);

      const index = documentos.findIndex(d => d.id === parseInt(id));
      if (index === -1) {
        return res.status(404).json({ error: 'Documento não encontrado' });
      }

      const documento = documentos[index];
      const filePath = path.join(process.cwd(), 'public', documento.url);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      documentos.splice(index, 1);
      fs.writeFileSync(documentosPath, JSON.stringify(documentos, null, 2));

      res.status(200).json({ message: 'Documento excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      res.status(500).json({ error: 'Erro ao excluir documento' });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
