// =================================================================
// MÓDULO DE BANCO DE DADOS SIMULADO (localStorage)
// Este arquivo é o único responsável por interagir com o localStorage.
// =================================================================

// Array inicial de cursos (usado apenas na primeira vez)
const cursosIniciais = [
    {
        id: 1,
        nome: 'Edição de Vídeos do Básico ao Avançado',
        descricao: 'Aprenda a editar vídeos incríveis para redes sociais, YouTube e projetos profissionais usando os principais softwares do mercado.',
        preco: 249.90,
        imagem: 'https://placehold.co/320x180/4f46e5/ffffff?text=Edição+Pro',
        categoria: 'avancado',
        curriculo: [
            { id: 'fundamentos-edicao', nome: 'Módulo 1: Fundamentos da Edição e Narrativa Visual', videoSrc: '/src/videos/video-exemplo.mp4' },
            { id: 'dominando-software', nome: 'Módulo 2: Dominando seu Software de Edição', videoSrc: '/src/videos/video-exemplo.mp4' },
            { id: 'cortes-ritmo', nome: 'Módulo 3: Cortes, Ritmo e Transições Criativas', videoSrc: '/src/videos/video-exemplo.mp4' },
            { id: 'tratamento-cor', nome: 'Módulo 4: Tratamento de Cor (Color Grading)', videoSrc: '/src/videos/video-exemplo.mp4' },
            { id: 'edicao-audio', nome: 'Módulo 5: Edição e Mixagem de Áudio', videoSrc: '/src/videos/video-exemplo.mp4' },
            { id: 'efeitos-visuais', nome: 'Módulo 6: Efeitos Visuais e Animações Simples', videoSrc: '/src/videos/video-exemplo.mp4' },
            { id: 'exportacao-mercado', nome: 'Módulo 7: Exportação e Entrega para o Mercado', videoSrc: '/src/videos/video-exemplo.mp4' }
        ]
    },
    {
        id: 2,
        nome: 'Introdução à Fotografia para Iniciantes',
        descricao: 'Domine sua câmera e aprenda os fundamentos da composição e iluminação.',
        preco: 180.50,
        imagem: 'https://placehold.co/320x180/10b981/ffffff?text=Fotografia',
        categoria: 'iniciante',
        curriculo: [
            { id: 'conhecendo-camera', nome: 'Módulo 1: Conhecendo sua Câmera', videoSrc: '/src/videos/video-exemplo.mp4' },
            { id: 'pilares-fotografia', nome: 'Módulo 2: Pilares da Fotografia (ISO, Abertura, Velocidade)', videoSrc: '/src/videos/video-exemplo.mp4' },
            { id: 'composicao-enquadramento', nome: 'Módulo 3: Composição e Enquadramento', videoSrc: '/src/videos/video-exemplo.mp4' }
        ]
    },
    {
        id: 3,
        nome: 'Animação e Motion Graphics com After Effects',
        descricao: 'Crie animações 2D e efeitos visuais profissionais para seus vídeos.',
        preco: 350.00,
        imagem: 'https://placehold.co/320x180/f59e0b/ffffff?text=Motion',
        categoria: 'avancado',
        curriculo: [
            { id: 'interface-ae', nome: 'Módulo 1: Interface do After Effects', videoSrc: '/src/videos/video-exemplo.mp4' },
            { id: 'keyframes-animacao', nome: 'Módulo 2: Keyframes e Animação Básica', videoSrc: '/src/videos/video-exemplo.mp4' },
            { id: 'shape-layers-mascaras', nome: 'Módulo 3: Shape Layers e Máscaras', videoSrc: '/src/videos/video-exemplo.mp4' }
        ]
    },
    {
        id: 4,
        nome: 'Color Grading e Correção de Cor Profissional',
        descricao: 'Transforme suas imagens com técnicas avançadas de color grading. Aprenda a corrigir cores, criar humores cinematográficos e dar um toque profissional aos seus vídeos.',
        preco: 299.90,
        imagem: '/src/imagens/Color-grading-professional.png',
        categoria: 'avancado',
        curriculo: [
            { id: 'teoria-cor', nome: 'Módulo 1: Teoria da Cor', videoSrc: '/src/videos/video-exemplo.mp4' },
            { id: 'correcao-primaria', nome: 'Módulo 2: Ferramentas de Correção Primária', videoSrc: '/src/videos/video-exemplo.mp4' },
            { id: 'looks-cinematograficos', nome: 'Módulo 3: Looks Cinematográficos', videoSrc: '/src/videos/video-exemplo.mp4' }
        ]
    },
    {
        id: 5,
        nome: 'Edição Expressa para Redes Sociais (Reels, TikTok)',
        descricao: 'Domine a arte da edição rápida e impactante para plataformas como Instagram Reels, TikTok e YouTube Shorts. Otimize seus vídeos para máxima retenção e engajamento.',
        preco: 199.90,
        imagem: 'https://placehold.co/320x180/3b82f6/ffffff?text=Redes+Sociais',
        categoria: 'iniciante',
        curriculo: [
            { id: 'formatos-proporcoes', nome: 'Módulo 1: Formatos e Proporções', videoSrc: '/src/videos/video-exemplo.mp4' },
            { id: 'edicao-dinamica', nome: 'Módulo 2: Edição Dinâmica e Cortes Rápidos', videoSrc: '/src/videos/video-exemplo.mp4' },
            { id: 'musica-efeitos', nome: 'Módulo 3: Música e Efeitos Sonoros Virais', videoSrc: '/src/videos/video-exemplo.mp4' }
        ]
    },
    {
        id: 6,
        nome: 'Motion Graphics Essencial com After Effects',
        descricao: 'Introdução completa ao Motion Graphics usando Adobe After Effects. Crie títulos animados, terços inferiores, transições dinâmicas e efeitos visuais básicos para elevar a qualidade de seus projetos.',
        preco: 320.00,
        imagem: 'https://placehold.co/320x180/8b5cf6/ffffff?text=After+Effects',
        categoria: 'avancado',
        curriculo: [
            { id: 'fundamentos-motion', nome: 'Módulo 1: Fundamentos do Motion Design', videoSrc: '/src/videos/video-exemplo.mp4' },
            { id: 'animacao-texto', nome: 'Módulo 2: Animação de Texto e Títulos', videoSrc: '/src/videos/video-exemplo.mp4' },
            { id: 'integracao-video', nome: 'Módulo 3: Integrando Gráficos com Vídeo', videoSrc: '/src/videos/video-exemplo.mp4' }
        ]
    },
    {
        id: 7,
        nome: 'Produção e Edição de Vlogs para YouTubers',
        descricao: 'Desde a gravação até a edição final, este curso ensina tudo o que um YouTuber precisa para criar vlogs cativantes. Aborda técnicas de storytelling, cortes rápidos e otimização para o YouTube.',
        preco: 220.00,
        imagem: 'https://placehold.co/320x180/ec4899/ffffff?text=Vlog',
        categoria: 'iniciante',
        curriculo: [
            { id: 'equipamentos-setup', nome: 'Módulo 1: Equipamentos e Setup de Gravação', videoSrc: '/src/videos/video-exemplo.mp4' },
            { id: 'storytelling-roteiro', nome: 'Módulo 2: Storytelling e Roteiro para Vlogs', videoSrc: '/src/videos/video-exemplo.mp4' },
            { id: 'edicao-otimizacao-yt', nome: 'Módulo 3: Edição e Otimização para YouTube', videoSrc: '/src/videos/video-exemplo.mp4' }
        ]
    }
];

// --- Funções de Cursos ---

// Em um cenário profissional, esta função faria uma chamada a uma API.
// Aqui, ela simplesmente retorna o array de cursos que está em memória.
export function getCursos() {
    return cursosIniciais;
}

// As funções abaixo simulam a alteração dos dados no "servidor".
// Em um projeto real, elas enviariam requisições (POST, PUT, DELETE) para uma API.
// As alterações serão perdidas ao recarregar a página, o que é esperado nesta simulação.
export function adicionarCurso(novoCurso) {
    const novoId = cursosIniciais.length > 0 ? Math.max(...cursosIniciais.map(c => c.id)) + 1 : 1;
    novoCurso.id = novoId;
    cursosIniciais.push(novoCurso);
}

export function atualizarCurso(id, dadosAtualizados) {
    const index = cursosIniciais.findIndex(curso => curso.id === id);
    if (index !== -1) {
        cursosIniciais[index] = { ...cursosIniciais[index], ...dadosAtualizados };
    }
}

export function deletarCurso(id) {
    const index = cursosIniciais.findIndex(curso => curso.id === id);
    if (index !== -1) {
        cursosIniciais.splice(index, 1);
    }
}

// --- Funções do Carrinho ---

export function getCarrinho() {
    return JSON.parse(localStorage.getItem('carrinho')) || [];
}

export function adicionarAoCarrinho(cursoId) {
    const carrinho = getCarrinho();
    if (!carrinho.includes(cursoId)) {
        carrinho.push(cursoId);
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
    }
}

export function removerDoCarrinho(cursoId) {
    let carrinho = getCarrinho();
    carrinho = carrinho.filter(id => id !== cursoId);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

// --- Funções de Usuários ---

export function getUsuarios() {
    return JSON.parse(localStorage.getItem('usuarios')) || [];
}

export function registrarUsuario(novoUsuario) {
    const usuarios = getUsuarios();
    const emailExistente = usuarios.find(usuario => usuario.email === novoUsuario.email);

    if (emailExistente) {
        return false; // Indica que o email já está em uso
    }

    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    return true; // Indica sucesso no registro
}

export function loginUsuario(email, senha) {
    const usuarios = getUsuarios();
    const usuarioEncontrado = usuarios.find(usuario => usuario.email === email && usuario.senha === senha);
    
    return usuarioEncontrado || null; // Retorna o usuário encontrado ou null se não encontrar
}

// --- Funções de Admin ---

export function getAdmins() {
    // Em um projeto real, isso viria de um local seguro.
    return [
        { email: 'admin@admin.com', senha: 'admin123' },
        { email: 'gestor@projeto.com', senha: 'gestor123' }
    ];
}

// --- Funções de Progresso do Aluno ---

/**
 * Retorna o objeto de progresso de todos os usuários.
 * A estrutura é: { "email_usuario": { "cursoId": ["moduloId1", "moduloId2"] } }
 */
function getProgressoGeral() {
    return JSON.parse(localStorage.getItem('progresso_usuarios')) || {};
}

/**
 * Retorna um array com os IDs dos módulos concluídos por um usuário em um curso específico.
 * @param {string} usuarioEmail - O email do usuário logado.
 * @param {number} cursoId - O ID do curso.
 * @returns {string[]} Array de IDs dos módulos concluídos.
 */
export function getModulosConcluidos(usuarioEmail, cursoId) {
    const progressoGeral = getProgressoGeral();
    return progressoGeral[usuarioEmail]?.[cursoId] || [];
}

/**
 * Marca um módulo como concluído para um usuário.
 * @param {string} usuarioEmail - O email do usuário logado.
 * @param {number} cursoId - O ID do curso.
 * @param {string} moduloId - O ID do módulo a ser marcado como concluído.
 */
export function marcarModuloComoConcluido(usuarioEmail, cursoId, moduloId) {
    const progressoGeral = getProgressoGeral();
    if (!progressoGeral[usuarioEmail]) progressoGeral[usuarioEmail] = {};
    if (!progressoGeral[usuarioEmail][cursoId]) progressoGeral[usuarioEmail][cursoId] = [];
    if (!progressoGeral[usuarioEmail][cursoId].includes(moduloId)) {
        progressoGeral[usuarioEmail][cursoId].push(moduloId);
    }
    localStorage.setItem('progresso_usuarios', JSON.stringify(progressoGeral));
}

/**
 * Desmarca um módulo como concluído para um usuário.
 * @param {string} usuarioEmail - O email do usuário logado.
 * @param {number} cursoId - O ID do curso.
 * @param {string} moduloId - O ID do módulo a ser desmarcado.
 */
export function desmarcarModuloComoConcluido(usuarioEmail, cursoId, moduloId) {
    const progressoGeral = getProgressoGeral();
    if (progressoGeral[usuarioEmail]?.[cursoId]) {
        progressoGeral[usuarioEmail][cursoId] = progressoGeral[usuarioEmail][cursoId].filter(id => id !== moduloId);
        localStorage.setItem('progresso_usuarios', JSON.stringify(progressoGeral));
    }
}