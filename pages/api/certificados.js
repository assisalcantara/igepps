import fs from 'fs';
import path from 'path';
import { supabase } from '../../lib/supabase';

const dataDir = path.join(process.cwd(), 'data');
const certificadosFile = path.join(dataDir, 'certificados.json');

const lerCertificadosLocal = () => {
  try {
    if (fs.existsSync(certificadosFile)) {
      const data = fs.readFileSync(certificadosFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Erro ao ler certificados:', err);
  }
  return [];
};

const salvarCertificadosLocal = (certificados) => {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(certificadosFile, JSON.stringify(certificados, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar certificados:', err);
  }
};

export default async function handler(req, res) {
  const { method, query } = req;

  // GET: Validar por código de validação ou buscar por aluno/curso
  if (method === 'GET') {
    const { codigo, alunoId, cursoId } = query;

    try {
      if (codigo) {
        const { data: certDb } = await supabase
          .from('certificados')
          .select('id, codigo_validacao, aluno_id, curso_id, nome_aluno_snapshot, titulo_curso_snapshot, carga_horaria, emitido_em')
          .ilike('codigo_validacao', codigo.trim())
          .maybeSingle();

        if (certDb) {
          return res.status(200).json({
            id: certDb.id,
            codigoValidacao: certDb.codigo_validacao,
            alunoId: certDb.aluno_id,
            alunoNome: certDb.nome_aluno_snapshot,
            cursoId: certDb.curso_id,
            cursoTitulo: certDb.titulo_curso_snapshot,
            cargaHoraria: String(certDb.carga_horaria),
            dataEmissao: certDb.emitido_em,
            emissor: "EDEP - Escola Digital de Educação Previdenciária / IGEPPS"
          });
        }

        // Fallback local
        const certsLocal = lerCertificadosLocal();
        const certLocal = certsLocal.find(c => String(c.codigoValidacao).toUpperCase() === codigo.toUpperCase());
        if (certLocal) {
          return res.status(200).json(certLocal);
        }

        return res.status(404).json({ error: 'Certificado não encontrado ou inválido' });
      }

      if (alunoId && cursoId) {
        const { data: certDb } = await supabase
          .from('certificados')
          .select('id, codigo_validacao, aluno_id, curso_id, nome_aluno_snapshot, titulo_curso_snapshot, carga_horaria, emitido_em')
          .eq('aluno_id', alunoId)
          .eq('curso_id', cursoId)
          .maybeSingle();

        if (certDb) {
          return res.status(200).json({
            id: certDb.id,
            codigoValidacao: certDb.codigo_validacao,
            alunoId: certDb.aluno_id,
            alunoNome: certDb.nome_aluno_snapshot,
            cursoId: certDb.curso_id,
            cursoTitulo: certDb.titulo_curso_snapshot,
            cargaHoraria: String(certDb.carga_horaria),
            dataEmissao: certDb.emitido_em,
            emissor: "EDEP - Escola Digital de Educação Previdenciária / IGEPPS"
          });
        }

        // Fallback local
        const certsLocal = lerCertificadosLocal();
        const certLocal = certsLocal.find(c => String(c.alunoId) === String(alunoId) && String(c.cursoId) === String(cursoId));
        return res.status(200).json(certLocal || null);
      }
    } catch (err) {
      console.error('Erro na consulta Supabase certificados:', err);
    }

    const certsLocal = lerCertificadosLocal();
    return res.status(200).json(certsLocal);
  }

  // POST: Registrar/Gerar novo certificado
  if (method === 'POST') {
    const { alunoId, alunoNome, cursoId, cursoTitulo, cargaHoraria } = req.body;

    if (!alunoId || !alunoNome || !cursoId || !cursoTitulo) {
      return res.status(400).json({ error: 'Dados incompletos para emissão do certificado' });
    }

    try {
      // 1. Localizar avaliação do curso no Supabase
      const { data: avalDb } = await supabase
        .from('avaliacoes')
        .select('id')
        .eq('curso_id', cursoId)
        .maybeSingle();

      // 2. Verificar elegibilidade (tentativa aprovada = true em public.tentativas_avaliacao)
      if (avalDb) {
        const { data: tentAprovada } = await supabase
          .from('tentativas_avaliacao')
          .select('id, aprovado')
          .eq('aluno_id', alunoId)
          .eq('avaliacao_id', avalDb.id)
          .eq('aprovado', true)
          .limit(1);

        if (!tentAprovada || tentAprovada.length === 0) {
          return res.status(403).json({ error: 'Para emitir o certificado, é necessário realizar a Prova do Curso e obter aprovação (Nota mínima 70%).' });
        }
      }

      // 3. Respeitar UNIQUE(aluno_id, curso_id) - Retornar se já existe no Supabase
      const { data: certExistenteDb } = await supabase
        .from('certificados')
        .select('id, codigo_validacao, aluno_id, curso_id, nome_aluno_snapshot, titulo_curso_snapshot, carga_horaria, emitido_em')
        .eq('aluno_id', alunoId)
        .eq('curso_id', cursoId)
        .maybeSingle();

      if (certExistenteDb) {
        return res.status(200).json({
          id: certExistenteDb.id,
          codigoValidacao: certExistenteDb.codigo_validacao,
          alunoId: certExistenteDb.aluno_id,
          alunoNome: certExistenteDb.nome_aluno_snapshot,
          cursoId: certExistenteDb.curso_id,
          cursoTitulo: certExistenteDb.titulo_curso_snapshot,
          cargaHoraria: String(certExistenteDb.carga_horaria),
          dataEmissao: certExistenteDb.emitido_em,
          emissor: "EDEP - Escola Digital de Educação Previdenciária / IGEPPS"
        });
      }

      // 4. Gerar Código Único EDEP-2026-XXXXXX e gravar em public.certificados
      const hashUnico = Math.random().toString(36).substring(2, 8).toUpperCase();
      const codigoValidacao = `EDEP-2026-${hashUnico}`;

      const { data: novoCertDb, error: insertErr } = await supabase
        .from('certificados')
        .insert({
          codigo_validacao: codigoValidacao,
          aluno_id: alunoId,
          curso_id: cursoId,
          nome_aluno_snapshot: alunoNome,
          titulo_curso_snapshot: cursoTitulo,
          carga_horaria: parseInt(cargaHoraria) || 15,
          emitido_em: new Date().toISOString()
        })
        .select()
        .single();

      if (!insertErr && novoCertDb) {
        const certRes = {
          id: novoCertDb.id,
          codigoValidacao: novoCertDb.codigo_validacao,
          alunoId: novoCertDb.aluno_id,
          alunoNome: novoCertDb.nome_aluno_snapshot,
          cursoId: novoCertDb.curso_id,
          cursoTitulo: novoCertDb.titulo_curso_snapshot,
          cargaHoraria: String(novoCertDb.carga_horaria),
          dataEmissao: novoCertDb.emitido_em,
          emissor: "EDEP - Escola Digital de Educação Previdenciária / IGEPPS"
        };

        // Espelhar localmente para fallback
        const certsLocal = lerCertificadosLocal();
        certsLocal.push(certRes);
        salvarCertificadosLocal(certsLocal);

        return res.status(201).json(certRes);
      }
    } catch (err) {
      console.error('Erro ao emitir certificado no Supabase:', err);
    }

    // Fallback local caso falhe a conexão com Supabase
    const certsLocal = lerCertificadosLocal();
    let certExistente = certsLocal.find(c => String(c.alunoId) === String(alunoId) && String(c.cursoId) === String(cursoId));
    if (certExistente) return res.status(200).json(certExistente);

    const hashUnico = Math.random().toString(36).substring(2, 8).toUpperCase();
    const codigoValidacao = `EDEP-2026-${hashUnico}`;
    const novoCertificado = {
      id: Date.now(),
      codigoValidacao,
      alunoId,
      alunoNome,
      cursoId,
      cursoTitulo,
      cargaHoraria: String(cargaHoraria || "15"),
      dataEmissao: new Date().toISOString(),
      emissor: "EDEP - Escola Digital de Educação Previdenciária / IGEPPS"
    };

    certsLocal.push(novoCertificado);
    salvarCertificadosLocal(certsLocal);
    return res.status(201).json(novoCertificado);
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
