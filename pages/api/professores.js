import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';

const professoresPath = path.join(process.cwd(), 'data', 'professores.json');

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      try {
        const { data: profsDb, error: errDb } = await supabase
          .from('usuarios')
          .select(`
            id, nome_completo, email, foto_url,
            curso_professores ( curso_id )
          `)
          .eq('tipo', 'professor');

        if (!errDb && profsDb) {
          const professoresFormatados = profsDb.map(p => ({
            id: p.id,
            nome: p.nome_completo,
            nomeCompleto: p.nome_completo,
            email: p.email,
            avatar: p.foto_url,
            cursosResponsaveis: (p.curso_professores || []).map(cp => cp.curso_id)
          }));
          return res.status(200).json(professoresFormatados);
        }
      } catch (err) {
        console.warn('Erro ao consultar professores no Supabase, usando fallback local:', err);
      }

      // Fallback local
      if (fs.existsSync(professoresPath)) {
        const professores = JSON.parse(fs.readFileSync(professoresPath, 'utf8'));
        return res.status(200).json(professores);
      }
      return res.status(200).json([]);
    }

    return res.status(405).json({ erro: 'Método não permitido' });
  } catch (error) {
    console.error('Erro na API de professores:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}
