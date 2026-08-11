import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmlwgvrtissssknqpvbg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  if (!supabaseServiceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY não configurada no servidor');
    return res.status(500).json({ error: 'Configuração do servidor incompleta (Service Role Key)' });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Erro ao processar formulário:', err);
        return res.status(500).json({ error: 'Erro ao processar upload do arquivo' });
      }

      const file = files.material;
      if (!file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const fileArray = Array.isArray(file) ? file : [file];
      const uploadedFile = fileArray[0];

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(uploadedFile.mimetype)) {
        if (fs.existsSync(uploadedFile.filepath)) fs.unlinkSync(uploadedFile.filepath);
        return res.status(400).json({ error: 'Tipo de arquivo não permitido. Use PDF ou imagem (JPG, PNG)' });
      }

      try {
        const fileBuffer = fs.readFileSync(uploadedFile.filepath);
        const sanitizeFilename = (uploadedFile.originalFilename || 'material.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `${Date.now()}-${sanitizeFilename}`;

        // Upload para o Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('materiais')
          .upload(storagePath, fileBuffer, {
            contentType: uploadedFile.mimetype,
            upsert: true
          });

        // Limpar arquivo temporário local
        if (fs.existsSync(uploadedFile.filepath)) {
          fs.unlinkSync(uploadedFile.filepath);
        }

        if (uploadError) {
          console.error('Erro no upload para o Supabase Storage:', uploadError);
          return res.status(500).json({ error: 'Erro ao armazenar arquivo no Supabase Storage', detalhe: uploadError.message });
        }

        // Obter URL pública do arquivo
        const { data: publicUrlData } = supabaseAdmin.storage
          .from('materiais')
          .getPublicUrl(storagePath);

        const url = publicUrlData.publicUrl;
        const tipo = uploadedFile.mimetype === 'application/pdf' ? 'pdf' : 'imagem';

        return res.status(200).json({
          success: true,
          url,
          path: storagePath,
          tipo,
          nome: uploadedFile.originalFilename
        });
      } catch (errUpload) {
        console.error('Erro ao ler ou enviar arquivo:', errUpload);
        if (fs.existsSync(uploadedFile.filepath)) fs.unlinkSync(uploadedFile.filepath);
        return res.status(500).json({ error: 'Falha ao processar arquivo para o Storage' });
      }
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
