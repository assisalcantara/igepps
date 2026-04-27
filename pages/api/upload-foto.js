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

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'fotos');
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filename: (name, ext, part, form) => {
        return `${Date.now()}-${part.originalFilename}`;
      },
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Erro ao fazer upload:', err);
        return res.status(500).json({ error: 'Erro ao fazer upload da foto' });
      }

      const file = files.foto;
      if (!file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      // Verificar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const fileArray = Array.isArray(file) ? file : [file];
      const uploadedFile = fileArray[0];

      if (!allowedTypes.includes(uploadedFile.mimetype)) {
        fs.unlinkSync(uploadedFile.filepath);
        return res.status(400).json({ error: 'Tipo de arquivo não permitido. Use imagem JPG ou PNG' });
      }

      const filename = path.basename(uploadedFile.filepath);
      const url = `/uploads/fotos/${filename}`;

      return res.status(200).json({
        success: true,
        url,
        nome: uploadedFile.originalFilename
      });
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
