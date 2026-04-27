import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails');

  // Criar diretório se não existir
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 2 * 1024 * 1024, // 2MB
    filename: (name, ext, part, form) => {
      return `thumb_${Date.now()}${ext}`;
    },
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Erro ao processar upload:', err);
      return res.status(500).json({ error: 'Erro ao processar upload' });
    }

    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Pegar o primeiro arquivo se for array
    const uploadedFile = Array.isArray(file) ? file[0] : file;

    // Validar tipo de arquivo
    if (!uploadedFile.mimetype || !uploadedFile.mimetype.startsWith('image/')) {
      fs.unlinkSync(uploadedFile.filepath);
      return res.status(400).json({ error: 'Arquivo deve ser uma imagem' });
    }

    // Retornar URL relativa
    const fileName = path.basename(uploadedFile.filepath);
    const url = `/uploads/thumbnails/${fileName}`;

    return res.status(200).json({ url, filename: fileName });
  });
}
