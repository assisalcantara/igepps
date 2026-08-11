-- =============================================================================
-- EDEP - ESCOLA DIGITAL DE EDUCAÇÃO PREVIDENCIÁRIA
-- MIGRATION: 20260811000001_forum.sql
-- Descrição: Cria as tabelas do Fórum de Discussões da plataforma EDEP,
--            com índices de performance, RLS habilitado e policies por perfil.
-- Dependências: 20260811000000_init_edep_schema.sql
--               (requer public.usuarios, public.cursos, public.curso_professores)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- TABELA 1: forum_topicos
-- Armazena os tópicos de discussão vinculados a um curso e a um autor.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forum_topicos (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_id       UUID          NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
    autor_id       UUID          NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo         VARCHAR(255)  NOT NULL,
    conteudo       TEXT          NOT NULL,
    fixado         BOOLEAN       NOT NULL DEFAULT FALSE,
    fechado        BOOLEAN       NOT NULL DEFAULT FALSE,
    visualizacoes  INT           NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Trigger: atualiza updated_at automaticamente em cada UPDATE
DROP TRIGGER IF EXISTS trg_forum_topicos_updated_at ON public.forum_topicos;
CREATE TRIGGER trg_forum_topicos_updated_at
    BEFORE UPDATE ON public.forum_topicos
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- TABELA 2: forum_respostas
-- Armazena as respostas a um tópico, vinculadas a um autor.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forum_respostas (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    topico_id  UUID         NOT NULL REFERENCES public.forum_topicos(id) ON DELETE CASCADE,
    autor_id   UUID         NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    conteudo   TEXT         NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Trigger: atualiza updated_at automaticamente em cada UPDATE
DROP TRIGGER IF EXISTS trg_forum_respostas_updated_at ON public.forum_respostas;
CREATE TRIGGER trg_forum_respostas_updated_at
    BEFORE UPDATE ON public.forum_respostas
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- ÍNDICES DE PERFORMANCE
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_forum_topicos_curso_id
    ON public.forum_topicos(curso_id);

CREATE INDEX IF NOT EXISTS idx_forum_topicos_autor_id
    ON public.forum_topicos(autor_id);

CREATE INDEX IF NOT EXISTS idx_forum_topicos_created_at
    ON public.forum_topicos(created_at);

CREATE INDEX IF NOT EXISTS idx_forum_respostas_topico_id
    ON public.forum_respostas(topico_id);

CREATE INDEX IF NOT EXISTS idx_forum_respostas_autor_id
    ON public.forum_respostas(autor_id);

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
ALTER TABLE public.forum_topicos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_respostas ENABLE ROW LEVEL SECURITY;

-- ===========================================================================
-- POLICIES: forum_topicos
-- ===========================================================================

-- SELECT: qualquer usuário autenticado pode ler tópicos
DROP POLICY IF EXISTS "forum_topicos_select_authenticated" ON public.forum_topicos;
CREATE POLICY "forum_topicos_select_authenticated"
    ON public.forum_topicos
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- INSERT: alunos e professores autenticados podem criar tópicos
DROP POLICY IF EXISTS "forum_topicos_insert_aluno_professor" ON public.forum_topicos;
CREATE POLICY "forum_topicos_insert_aluno_professor"
    ON public.forum_topicos
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.usuarios u
            WHERE u.id = auth.uid()
              AND u.tipo IN ('aluno', 'professor', 'admin')
        )
        AND autor_id = auth.uid()
    );

-- UPDATE: autor pode editar o próprio tópico; professor modera tópicos do
--         curso ao qual está vinculado; admin modera tudo
DROP POLICY IF EXISTS "forum_topicos_update_moderacao" ON public.forum_topicos;
CREATE POLICY "forum_topicos_update_moderacao"
    ON public.forum_topicos
    FOR UPDATE
    USING (
        -- Próprio autor
        autor_id = auth.uid()
        OR
        -- Professor vinculado ao curso do tópico
        EXISTS (
            SELECT 1 FROM public.curso_professores cp
            WHERE cp.professor_id = auth.uid()
              AND cp.curso_id = forum_topicos.curso_id
        )
        OR
        -- Administrador
        EXISTS (
            SELECT 1 FROM public.usuarios u
            WHERE u.id = auth.uid()
              AND u.tipo = 'admin'
        )
    );

-- DELETE: professor vinculado ao curso ou admin podem excluir tópicos
DROP POLICY IF EXISTS "forum_topicos_delete_moderacao" ON public.forum_topicos;
CREATE POLICY "forum_topicos_delete_moderacao"
    ON public.forum_topicos
    FOR DELETE
    USING (
        -- Próprio autor
        autor_id = auth.uid()
        OR
        -- Professor vinculado ao curso do tópico
        EXISTS (
            SELECT 1 FROM public.curso_professores cp
            WHERE cp.professor_id = auth.uid()
              AND cp.curso_id = forum_topicos.curso_id
        )
        OR
        -- Administrador
        EXISTS (
            SELECT 1 FROM public.usuarios u
            WHERE u.id = auth.uid()
              AND u.tipo = 'admin'
        )
    );

-- ===========================================================================
-- POLICIES: forum_respostas
-- ===========================================================================

-- SELECT: qualquer usuário autenticado pode ler respostas
DROP POLICY IF EXISTS "forum_respostas_select_authenticated" ON public.forum_respostas;
CREATE POLICY "forum_respostas_select_authenticated"
    ON public.forum_respostas
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- INSERT: alunos e professores autenticados podem responder (somente em
--         tópicos abertos)
DROP POLICY IF EXISTS "forum_respostas_insert_aluno_professor" ON public.forum_respostas;
CREATE POLICY "forum_respostas_insert_aluno_professor"
    ON public.forum_respostas
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND autor_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.usuarios u
            WHERE u.id = auth.uid()
              AND u.tipo IN ('aluno', 'professor', 'admin')
        )
        AND EXISTS (
            SELECT 1 FROM public.forum_topicos ft
            WHERE ft.id = topico_id
              AND ft.fechado = FALSE
        )
    );

-- UPDATE: apenas o próprio autor pode editar sua resposta
DROP POLICY IF EXISTS "forum_respostas_update_own" ON public.forum_respostas;
CREATE POLICY "forum_respostas_update_own"
    ON public.forum_respostas
    FOR UPDATE
    USING (autor_id = auth.uid());

-- DELETE: autor, professor vinculado ao curso do tópico ou admin podem excluir
DROP POLICY IF EXISTS "forum_respostas_delete_moderacao" ON public.forum_respostas;
CREATE POLICY "forum_respostas_delete_moderacao"
    ON public.forum_respostas
    FOR DELETE
    USING (
        -- Próprio autor
        autor_id = auth.uid()
        OR
        -- Professor vinculado ao curso do tópico associado à resposta
        EXISTS (
            SELECT 1
            FROM public.forum_topicos ft
            JOIN public.curso_professores cp ON cp.curso_id = ft.curso_id
            WHERE ft.id = forum_respostas.topico_id
              AND cp.professor_id = auth.uid()
        )
        OR
        -- Administrador
        EXISTS (
            SELECT 1 FROM public.usuarios u
            WHERE u.id = auth.uid()
              AND u.tipo = 'admin'
        )
    );
