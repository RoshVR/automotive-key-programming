-- Script de inicialización para PostgreSQL N8N Workflow
-- Crea la tabla n8n_chat_histories necesaria para la memoria de conversaciones

CREATE TABLE IF NOT EXISTS public.n8n_chat_histories (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    message JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para mejorar el rendimiento en búsquedas por session_id
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_session_id 
ON public.n8n_chat_histories(session_id);

-- Índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_created_at 
ON public.n8n_chat_histories(created_at DESC);

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_n8n_chat_histories_updated_at ON public.n8n_chat_histories;
CREATE TRIGGER update_n8n_chat_histories_updated_at
    BEFORE UPDATE ON public.n8n_chat_histories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE public.n8n_chat_histories IS 'Almacena el historial de conversaciones para N8N AI Agent';
COMMENT ON COLUMN public.n8n_chat_histories.session_id IS 'Identificador único de la sesión (teléfono, email, etc)';
COMMENT ON COLUMN public.n8n_chat_histories.message IS 'Mensaje en formato JSON con type (human/ai), content y metadata';
COMMENT ON COLUMN public.n8n_chat_histories.created_at IS 'Fecha y hora de creación del mensaje';
COMMENT ON COLUMN public.n8n_chat_histories.updated_at IS 'Fecha y hora de última actualización';

-- Datos de ejemplo (opcional, comentar si no se desea)
-- INSERT INTO public.n8n_chat_histories (session_id, message) VALUES
-- ('+1234567890', '{"type": "human", "content": "Hola", "additional_kwargs": {}, "response_metadata": {}}'::jsonb),
-- ('+1234567890', '{"type": "ai", "content": "¡Hola! ¿En qué puedo ayudarte?", "additional_kwargs": {}, "response_metadata": {}}'::jsonb);

-- Permisos (asegurar que el usuario tenga todos los permisos necesarios)
GRANT ALL PRIVILEGES ON TABLE public.n8n_chat_histories TO n8n_user;
GRANT USAGE, SELECT ON SEQUENCE n8n_chat_histories_id_seq TO n8n_user;
