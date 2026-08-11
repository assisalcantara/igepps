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

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { cursosResponsaveis, foto, telefone, especialidade, biografia } = req.body;

      const professorIdStr = String(id || req.body.id);

      if (!professorIdStr) {
        return res.status(400).json({ erro: 'ID do professor é obrigatório' });
      }

      // Validar se o usuário é realmente do tipo professor no Supabase
      const { data: usuarioProf, error: errProf } = await supabase
        .from('usuarios')
        .select('id, tipo, nome_completo, email')
        .eq('id', professorIdStr)
        .single();

      if (errProf || !usuarioProf || usuarioProf.tipo !== 'professor') {
        return res.status(404).json({ erro: 'Professor não encontrado no banco de dados' });
      }

      // Se foi enviada a lista de cursos responsáveis, sincronizar na tabela public.curso_professores
      if (Array.isArray(cursosResponsaveis)) {
        // Remover vínculos atuais desse professor
        const { error: errDel } = await supabase
          .from('curso_professores')
          .delete()
          .eq('professor_id', professorIdStr);

        if (errDel) {
          console.error('Erro ao remover vínculos antigos de curso_professores:', errDel);
          return res.status(500).json({ erro: 'Erro ao atualizar vínculos do professor', detalhe: errDel.message });
        }

        // Se houver cursos selecionados, inserir os novos vínculos sem duplicatas
        if (cursosResponsaveis.length > 0) {
          const vinculosUnicos = Array.from(new Set(cursosResponsaveis)).map(cursoId => ({
            curso_id: String(cursoId),
            professor_id: professorIdStr
          }));

          const { error: errIns } = await supabase
            .from('curso_professores')
            .insert(vinculosUnicos);

          if (errIns) {
            console.error('Erro ao inserir novos vínculos em curso_professores:', errIns);
            return res.status(500).json({ erro: 'Erro ao gravar novos vínculos no banco de dados', detalhe: errIns.message });
          }
        }
      }

      // Opcional: atualizar foto no perfil do usuário se enviada
      if (foto) {
        await supabase
          .from('usuarios')
          .update({ foto_url: String(foto) })
          .eq('id', professorIdStr);
      }

      return res.status(200).json({
        id: usuarioProf.id,
        nome: usuarioProf.nome_completo,
        email: usuarioProf.email,
        cursosResponsaveis: cursosResponsaveis || []
      });
    }

    return res.status(405).json({ erro: 'Método não permitido' });
  } catch (error) {
    console.error('Erro na API de professores:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}
