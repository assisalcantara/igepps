-- =============================================================================
-- EDEP - ESCOLA DIGITAL DE EDUCAÇÃO PREVIDENCIÁRIA
-- MIGRATION: 20260811000000_init_edep_schema.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Perfis Funcionais dos Usuários (Vinculado a auth.users)
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('admin', 'professor', 'aluno')),
    status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pendente', 'inativo')),
    cpf VARCHAR(14) UNIQUE,
    whatsapp VARCHAR(20),
    data_nascimento DATE,
    cargo_funcao VARCHAR(150),
    orgao_lotacao VARCHAR(150),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON public.usuarios;
CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Cursos
CREATE TABLE IF NOT EXISTS public.cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100) DEFAULT 'Geral',
    carga_horaria INT DEFAULT 15,
    thumbnail_url TEXT,
    video_apresentacao_url TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_cursos_updated_at ON public.cursos;
CREATE TRIGGER trg_cursos_updated_at
    BEFORE UPDATE ON public.cursos
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Associação N:M de Professores por Curso
CREATE TABLE IF NOT EXISTS public.curso_professores (
    curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
    professor_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    atribuido_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (curso_id, professor_id)
);

-- 4. Módulos do Curso
CREATE TABLE IF NOT EXISTS public.modulos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    ordem INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Aulas dos Módulos
CREATE TABLE IF NOT EXISTS public.aulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modulo_id UUID NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    video_url TEXT NOT NULL,
    duracao_minutos INT DEFAULT 0,
    ordem INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Materiais de Apoio da Aula
CREATE TABLE IF NOT EXISTS public.materiais_apoio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aula_id UUID NOT NULL REFERENCES public.aulas(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'pdf',
    arquivo_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Matrículas dos Alunos nos Cursos
CREATE TABLE IF NOT EXISTS public.matriculas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
    progresso_percentual INT DEFAULT 0 CHECK (progresso_percentual BETWEEN 0 AND 100),
    status VARCHAR(20) DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluido', 'cancelado')),
    data_matricula TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_conclusao TIMESTAMP WITH TIME ZONE,
    UNIQUE(aluno_id, curso_id)
);

-- 8. Fonte de Verdade do Progresso de Aulas Concluídas
CREATE TABLE IF NOT EXISTS public.progresso_aulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matricula_id UUID NOT NULL REFERENCES public.matriculas(id) ON DELETE CASCADE,
    aula_id UUID NOT NULL REFERENCES public.aulas(id) ON DELETE CASCADE,
    concluido_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(matricula_id, aula_id)
);

-- 9. Avaliações (Prova Final do Curso)
CREATE TABLE IF NOT EXISTS public.avaliacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_id UUID UNIQUE NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    nota_minima INT DEFAULT 70,
    duracao_minutos INT DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Questões da Avaliação
CREATE TABLE IF NOT EXISTS public.questoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avaliacao_id UUID NOT NULL REFERENCES public.avaliacoes(id) ON DELETE CASCADE,
    enunciado TEXT NOT NULL,
    ordem INT DEFAULT 1
);

-- 11. Opções da Questão (Gabarito)
CREATE TABLE IF NOT EXISTS public.opcoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    questao_id UUID NOT NULL REFERENCES public.questoes(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    is_correta BOOLEAN DEFAULT FALSE,
    ordem INT DEFAULT 1
);

-- 12. Histórico da Tentativa da Prova pelo Aluno
CREATE TABLE IF NOT EXISTS public.tentativas_avaliacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    avaliacao_id UUID NOT NULL REFERENCES public.avaliacoes(id) ON DELETE CASCADE,
    nota_obtida INT NOT NULL,
    aprovado BOOLEAN NOT NULL,
    realizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Respostas da Tentativa (Preserva histórico sem CASCADE para a opção escolhida)
CREATE TABLE IF NOT EXISTS public.tentativa_respostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tentativa_id UUID NOT NULL REFERENCES public.tentativas_avaliacao(id) ON DELETE CASCADE,
    questao_id UUID NOT NULL REFERENCES public.questoes(id) ON DELETE CASCADE,
    opcao_escolhida_id UUID REFERENCES public.opcoes(id) ON DELETE SET NULL,
    texto_opcao_snapshot TEXT NOT NULL,
    is_correta BOOLEAN NOT NULL,
    UNIQUE(tentativa_id, questao_id)
);

-- 14. Certificados Digitais (Preserva snapshot histórico do aluno e título do curso no momento de emissão)
CREATE TABLE IF NOT EXISTS public.certificados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_validacao VARCHAR(50) UNIQUE NOT NULL,
    aluno_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
    nome_aluno_snapshot VARCHAR(255) NOT NULL,
    titulo_curso_snapshot VARCHAR(255) NOT NULL,
    carga_horaria INT NOT NULL,
    emitido_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(aluno_id, curso_id)
);

-- INDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON public.usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_modulos_curso_ordem ON public.modulos(curso_id, ordem);
CREATE INDEX IF NOT EXISTS idx_aulas_modulo_ordem ON public.aulas(modulo_id, ordem);
CREATE INDEX IF NOT EXISTS idx_matriculas_aluno ON public.matriculas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_curso ON public.matriculas(curso_id);
CREATE INDEX IF NOT EXISTS idx_progresso_matricula ON public.progresso_aulas(matricula_id);
CREATE INDEX IF NOT EXISTS idx_tentativas_aluno_avaliacao ON public.tentativas_avaliacao(aluno_id, avaliacao_id);
CREATE INDEX IF NOT EXISTS idx_certificados_codigo ON public.certificados(codigo_validacao);

-- ROW LEVEL SECURITY (RLS) & POLICIES
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curso_professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais_apoio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opcoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tentativas_avaliacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tentativa_respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios_select_own_or_admin" ON public.usuarios;
CREATE POLICY "usuarios_select_own_or_admin" ON public.usuarios FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.tipo = 'admin'));

DROP POLICY IF EXISTS "usuarios_update_own_or_admin" ON public.usuarios;
CREATE POLICY "usuarios_update_own_or_admin" ON public.usuarios FOR UPDATE USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.tipo = 'admin'));

DROP POLICY IF EXISTS "cursos_public_read_active" ON public.cursos;
CREATE POLICY "cursos_public_read_active" ON public.cursos FOR SELECT USING (ativo = TRUE OR EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.tipo IN ('admin', 'professor')));

DROP POLICY IF EXISTS "modulos_public_read" ON public.modulos;
CREATE POLICY "modulos_public_read" ON public.modulos FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "aulas_public_read" ON public.aulas;
CREATE POLICY "aulas_public_read" ON public.aulas FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "materiais_public_read" ON public.materiais_apoio;
CREATE POLICY "materiais_public_read" ON public.materiais_apoio FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "matriculas_select_own" ON public.matriculas;
CREATE POLICY "matriculas_select_own" ON public.matriculas FOR SELECT USING (aluno_id = auth.uid() OR EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.tipo IN ('admin', 'professor')));

DROP POLICY IF EXISTS "matriculas_insert_own" ON public.matriculas;
CREATE POLICY "matriculas_insert_own" ON public.matriculas FOR INSERT WITH CHECK (aluno_id = auth.uid());

DROP POLICY IF EXISTS "progresso_select_own" ON public.progresso_aulas;
CREATE POLICY "progresso_select_own" ON public.progresso_aulas FOR SELECT USING (EXISTS (SELECT 1 FROM public.matriculas m WHERE m.id = matricula_id AND m.aluno_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.tipo IN ('admin', 'professor')));

DROP POLICY IF EXISTS "progresso_insert_own" ON public.progresso_aulas;
CREATE POLICY "progresso_insert_own" ON public.progresso_aulas FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.matriculas m WHERE m.id = matricula_id AND m.aluno_id = auth.uid()));

DROP POLICY IF EXISTS "avaliacoes_select_enrolled" ON public.avaliacoes;
CREATE POLICY "avaliacoes_select_enrolled" ON public.avaliacoes FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "questoes_select_enrolled" ON public.questoes;
CREATE POLICY "questoes_select_enrolled" ON public.questoes FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "opcoes_select_enrolled" ON public.opcoes;
CREATE POLICY "opcoes_select_enrolled" ON public.opcoes FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "tentativas_select_own" ON public.tentativas_avaliacao;
CREATE POLICY "tentativas_select_own" ON public.tentativas_avaliacao FOR SELECT USING (aluno_id = auth.uid() OR EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.tipo IN ('admin', 'professor')));

DROP POLICY IF EXISTS "tentativas_insert_own" ON public.tentativas_avaliacao;
CREATE POLICY "tentativas_insert_own" ON public.tentativas_avaliacao FOR INSERT WITH CHECK (aluno_id = auth.uid());

DROP POLICY IF EXISTS "certificados_public_read_by_code" ON public.certificados;
CREATE POLICY "certificados_public_read_by_code" ON public.certificados FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "certificados_insert_own" ON public.certificados;
CREATE POLICY "certificados_insert_own" ON public.certificados FOR INSERT WITH CHECK (aluno_id = auth.uid());
