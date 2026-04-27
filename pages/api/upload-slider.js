import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

const slidesDirectory = path.join(process.cwd(), 'public', 'images', 'slider');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      if (!fs.existsSync(slidesDirectory)) {
        fs.mkdirSync(slidesDirectory, { recursive: true });
      }

      const form = new IncomingForm({
        uploadDir: slidesDirectory,
        keepExtensions: true,
        filename: (name, ext, part, form) => {
          // Garante um nome de arquivo único para evitar sobreposições
          return `${Date.now()}-${part.originalFilename}`;
        }
      });

      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Erro no parse do formulário:', err);
          return res.status(500).json({ error: 'Erro ao processar o upload.' });
        }

        const file = files.sliderImage[0];
        const newFileName = path.basename(file.filepath);
        const newSlide = {
          id: Date.now(),
          url: `/images/slider/${newFileName}`,
          nome: newFileName,
        };

        // Aqui, em um app real, você salvaria os metadados do slide em um JSON ou banco de dados.
        // Por enquanto, o arquivo está salvo na pasta.

        res.status(201).json(newSlide);
      });

    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({ error: 'Ocorreu um erro no servidor durante o upload.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Método ${req.method} não permitido.`);
  }
}
