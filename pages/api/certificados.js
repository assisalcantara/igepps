import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const certificadosFile = path.join(dataDir, 'certificados.json');

const lerCertificados = () => {
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

const salvarCertificados = (certificados) => {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(certificadosFile, JSON.stringify(certificados, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar certificados:', err);
  }
};

export default function handler(req, res) {
  const { method, query } = req;

  // GET: Validar por código de validação ou buscar por aluno/curso
  if (method === 'GET') {
    const { codigo, alunoId, cursoId } = query;
    const certificados = lerCertificados();

    if (codigo) {
      const cert = certificados.find(c => c.codigoValidacao.toUpperCase() === codigo.toUpperCase());
      if (!cert) {
        return res.status(404).json({ error: 'Certificado não encontrado ou inválido' });
      }
      return res.status(200).json(cert);
    }

    if (alunoId && cursoId) {
      const cert = certificados.find(c => c.alunoId === parseInt(alunoId) && c.cursoId === parseInt(cursoId));
      return res.status(200).json(cert || null);
    }

    return res.status(200).json(certificados);
  }

  // POST: Registrar/Gerar novo certificado
  if (method === 'POST') {
    const { alunoId, alunoNome, cursoId, cursoTitulo, cargaHoraria } = req.body;

    if (!alunoId || !alunoNome || !cursoId || !cursoTitulo) {
      return res.status(400).json({ error: 'Dados incompletos para emissão do certificado' });
    }

    const certificados = lerCertificados();

    // Verificar se já existe certificado emitido para este aluno e curso
    let certExistente = certificados.find(c => c.alunoId === parseInt(alunoId) && c.cursoId === parseInt(cursoId));

    if (certExistente) {
      return res.status(200).json(certExistente);
    }

    // Gerar Código Único de Validação EDEP (ex: EDEP-2026-A8B9C0)
    const hashUnico = Math.random().toString(36).substring(2, 8).toUpperCase();
    const codigoValidacao = `EDEP-2026-${hashUnico}`;

    const novoCertificado = {
      id: Date.now(),
      codigoValidacao,
      alunoId: parseInt(alunoId),
      alunoNome,
      cursoId: parseInt(cursoId),
      cursoTitulo,
      cargaHoraria: cargaHoraria || "30",
      dataEmissao: new Date().toISOString(),
      emissor: "EDEP - Escola Digital de Educação Previdenciária / IGEPPS"
    };

    certificados.push(novoCertificado);
    salvarCertificados(certificados);

    return res.status(201).json(novoCertificado);
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
