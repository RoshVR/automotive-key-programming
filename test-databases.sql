-- ============================================
-- Script de Prueba para Bases de Datos N8N Workflow
-- ============================================

-- 1. INSERTAR MENSAJES DE PRUEBA
-- Simulamos una conversación de usuario
INSERT INTO public.n8n_chat_histories (session_id, message) VALUES
('+5215512345678', '{"type": "human", "content": "Hola, necesito ayuda con una llave de auto", "additional_kwargs": {}, "response_metadata": {}}'::jsonb),
('+5215512345678', '{"type": "ai", "content": "¡Hola! Claro que sí, estoy aquí para ayudarte. ¿Qué tipo de llave necesitas?", "additional_kwargs": {}, "response_metadata": {}}'::jsonb),
('+5215512345678', '{"type": "human", "content": "Es para un Honda Civic 2020, perdí mi llave principal", "additional_kwargs": {}, "response_metadata": {}}'::jsonb),
('+5215512345678', '{"type": "ai", "content": "Entiendo, para un Honda Civic 2020 necesitarás una llave con chip programado. ¿Tienes alguna llave de respaldo?", "additional_kwargs": {}, "response_metadata": {}}'::jsonb);

-- 2. CONSULTAR CONVERSACIONES POR USUARIO
SELECT 
    session_id,
    message->>'type' as tipo_mensaje,
    message->>'content' as contenido,
    created_at
FROM public.n8n_chat_histories
WHERE session_id = '+5215512345678'
ORDER BY created_at ASC;

-- 3. CONSULTAR ÚLTIMOS 5 MENSAJES DE CUALQUIER USUARIO
SELECT 
    session_id,
    message->>'type' as tipo_mensaje,
    LEFT(message->>'content', 50) || '...' as contenido_resumido,
    created_at
FROM public.n8n_chat_histories
ORDER BY created_at DESC
LIMIT 5;

-- 4. CONTAR MENSAJES POR SESIÓN
SELECT 
    session_id,
    COUNT(*) as total_mensajes,
    MAX(created_at) as ultimo_mensaje
FROM public.n8n_chat_histories
GROUP BY session_id
ORDER BY ultimo_mensaje DESC;

-- 5. VERIFICAR ÍNDICES
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'n8n_chat_histories';
