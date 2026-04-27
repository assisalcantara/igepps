import fs from 'fs';
import path from 'path';

const sliderDataPath = path.join(process.cwd(), 'data', 'slider.json');
const slidesDirectory = path.join(process.cwd(), 'public', 'images', 'slider');

function getSliderData() {
  if (!fs.existsSync(sliderDataPath)) {
    return [];
  }
  const fileContent = fs.readFileSync(sliderDataPath, 'utf-8');
  return JSON.parse(fileContent);
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const sliderInfo = getSliderData(); // Info from slider.json

      if (!fs.existsSync(slidesDirectory)) {
        return res.status(200).json([]);
      }

      const imageFiles = fs.readdirSync(slidesDirectory)
        .filter(fileName => /\.(jpg|jpeg|png|gif)$/i.test(fileName));

      const slides = imageFiles.map((fileName, index) => {
        const slideData = sliderInfo.find(s => s.fileName === fileName);
        return {
          id: index + 1,
          url: `/images/slider/${fileName}`,
          nome: fileName,
          titulo: slideData?.title || `Slide ${index + 1}`,
          descricao: slideData?.description || `Descrição do slide ${index + 1}.`
        };
      });

      console.log('API /api/slider - Slides encontrados:', slides);
      res.status(200).json(slides);
    } catch (error) {
      console.error('Erro ao listar slides:', error);
      res.status(500).json({ error: 'Erro ao buscar imagens do slider.' });
    }
  } else if (req.method === 'POST') { // Adicionando o método POST para salvar os metadados
    try {
        const { fileName, title, description } = req.body;

        if (!fileName || !title) {
            return res.status(400).json({ error: 'Nome do arquivo e título são obrigatórios.' });
        }

        const sliderInfo = getSliderData();
        
        const existingSlideIndex = sliderInfo.findIndex(s => s.fileName === fileName);

        if (existingSlideIndex > -1) {
            // Atualiza o slide existente
            sliderInfo[existingSlideIndex] = { fileName, title, description };
        } else {
            // Adiciona um novo slide
            sliderInfo.push({ fileName, title, description });
        }

        fs.writeFileSync(sliderDataPath, JSON.stringify(sliderInfo, null, 2));

        res.status(200).json({ success: true, message: 'Dados do slide salvos com sucesso.' });

    } catch (error) {
        console.error('Erro ao salvar dados do slide:', error);
        res.status(500).json({ error: 'Erro ao salvar dados do slide.' });
    }
  }
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Método ${req.method} não permitido.`);
  }
}
