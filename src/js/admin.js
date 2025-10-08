import { 
    getUsuarios, 
    getCursos,
    adicionarCurso,
    atualizarCurso,
    deletarCurso,
    getAdmins       
} from './database.js';

// Variável para armazenar o elemento do modal do admin em cache
let adminModalElement = null;

/**
 * Cria e injeta o HTML do modal do admin no DOM.
 * @returns {HTMLElement} O elemento do overlay do modal.
 */
function createAdminModalElement() {
    const modalHTML = `
        <div class="modal-box">
            <h2 id="modal-title">Aviso</h2>
            <p id="modal-message">Mensagem aqui.</p>
            <button id="modal-close-btn" class="botao-principal">OK</button>
            <button id="modal-confirm-btn" class="botao-principal" style="display: none;">Confirmar</button>
        </div>
    `;
    const overlay = document.createElement('div');
    overlay.id = 'custom-modal-overlay';
    overlay.className = 'modal-overlay hidden';
    overlay.innerHTML = modalHTML;
    document.body.appendChild(overlay);
    return overlay;
}

/**
 * Exibe um modal de notificação customizado para a área de admin.
 * @param {string} title - O título do modal.
 * @param {string} message - A mensagem a ser exibida.
 * @param {object} options - Opções como `onConfirm` para modais de confirmação.
 */
function showAdminModal(title, message, options = {}) {
    // Cria o modal na primeira vez que for chamado
    if (!adminModalElement) {
        adminModalElement = createAdminModalElement();
    }

    if (!adminModalElement) { // Fallback para alert se a criação falhar
        if (options.onConfirm) {
            if (confirm(message)) options.onConfirm();
        } else {
            alert(message);
        }
        return;
    }

    adminModalElement.querySelector('#modal-title').textContent = title;
    adminModalElement.querySelector('#modal-message').textContent = message;
    const closeBtn = adminModalElement.querySelector('#modal-close-btn');
    const confirmBtn = adminModalElement.querySelector('#modal-confirm-btn');

    if (options.onConfirm) {
        // Configura para um modal de confirmação (com botões "OK" e "Confirmar")
        closeBtn.onclick = () => {
            adminModalElement.classList.add('hidden');
            closeBtn.onclick = null;
            confirmBtn.onclick = null;
        };
        confirmBtn.style.display = 'inline-block';
        confirmBtn.onclick = () => {
            adminModalElement.classList.add('hidden');
            closeBtn.onclick = null;
            confirmBtn.onclick = null;
            options.onConfirm();
        };
    } else {
        // Configura para um modal de aviso simples (com um botão "OK")
        closeBtn.onclick = () => {
            overlay.classList.add('hidden');
            closeBtn.onclick = null; // Limpa a ação
            confirmBtn.onclick = null;
            if (typeof options.onClose === 'function') options.onClose();
        };
        confirmBtn.style.display = 'none';
    }

    adminModalElement.classList.remove('hidden');
}
/**
 * Lógica da página de Gerenciar Cursos (cursos.html)
 * Inclui renderização da tabela, modal de adição/edição e ações de exclusão.
 */
function inicializarPaginaCursos() {
    const tabelaCursos = document.getElementById('tabela-cursos');
    const modalCurso = document.getElementById('modal-curso');
    const formularioCurso = document.getElementById('form-curso');
    const botaoAbrirModal = document.getElementById('botao-abrir-modal-curso');
    const botaoCancelarModal = document.getElementById('botao-cancelar-modal');
    const modalTitulo = document.getElementById('modal-titulo');

    if (!tabelaCursos) return; // Executa somente se os elementos existirem

    function renderizarTabelaCursos() {
        const corpoTabela = tabelaCursos.querySelector('tbody');
        const cursos = getCursos();

        corpoTabela.innerHTML = '';

        cursos.forEach(curso => {
            const linha = corpoTabela.insertRow();
            linha.innerHTML = `
                <td>${curso.id}</td>
                <td>${curso.nome}</td>
                <td>R$ ${curso.preco.toFixed(2)}</td>
                <td>${curso.categoria}</td>
                <td class="acoes">
                    <button class="botao-acao botao-editar" data-id="${curso.id}">Editar</button>
                    <button class="botao-acao botao-excluir" data-id="${curso.id}">Excluir</button>
                </td>
            `;
        });
    }

    botaoAbrirModal.addEventListener('click', () => {
        formularioCurso.reset();
        document.getElementById('curso-id').value = '';
        modalTitulo.textContent = 'Adicionar Novo Curso';
        modalCurso.showModal();
    });

    botaoCancelarModal.addEventListener('click', () => {
        modalCurso.close();
    });

    formularioCurso.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const id = document.getElementById('curso-id').value;
        const dadosCurso = {
            nome: document.getElementById('curso-nome').value,
            descricao: document.getElementById('curso-descricao').value,
            preco: parseFloat(document.getElementById('curso-preco').value),
            imagem: document.getElementById('curso-imagem').value,
            categoria: document.getElementById('curso-categoria').value,
            curriculo: [] // Simulação, currículo pode ser adicionado depois
        };

        if (id) {
            atualizarCurso(parseInt(id), dadosCurso);
        } else {
            adicionarCurso(dadosCurso);
        }

        modalCurso.close();
        renderizarTabelaCursos();
    });

    tabelaCursos.addEventListener('click', (evento) => {
        const target = evento.target;
        if (!target.classList.contains('botao-acao')) return;

        const id = parseInt(target.dataset.id);

        if (target.classList.contains('botao-excluir')) {
            showAdminModal(
                'Confirmar Exclusão', 
                `Tem certeza que deseja excluir o curso com ID ${id}?`, 
                { onConfirm: () => {
                    deletarCurso(id);
                    renderizarTabelaCursos();
                }}
            );
        }

        if (target.classList.contains('botao-editar')) {
            const curso = getCursos().find(c => c.id === id);
            if (curso) {
                document.getElementById('curso-id').value = curso.id;
                document.getElementById('curso-nome').value = curso.nome;
                document.getElementById('curso-descricao').value = curso.descricao;
                document.getElementById('curso-preco').value = curso.preco;
                document.getElementById('curso-imagem').value = curso.imagem;
                document.getElementById('curso-categoria').value = curso.categoria;
                modalTitulo.textContent = `Editando Curso: ${curso.nome}`;
                modalCurso.showModal();
            }
        }
    });

    renderizarTabelaCursos();
}

/**
 * Lógica da página de Gerenciar Usuários (usuarios.html)
 */
function inicializarPaginaUsuarios() {
    const tabelaUsuarios = document.getElementById('tabela-usuarios');
    if (!tabelaUsuarios) return;

    const corpoTabela = tabelaUsuarios.querySelector('tbody');
    const usuarios = getUsuarios();

    corpoTabela.innerHTML = '';

    if (usuarios.length === 0) {
        corpoTabela.innerHTML = '<tr><td colspan="3">Nenhum usuário registrado.</td></tr>';
    } else {
        usuarios.forEach(usuario => {
            const linha = corpoTabela.insertRow();
            linha.innerHTML = `
                <td>${usuario.nome}</td>
                <td>${usuario.email}</td>
                <td>${usuario.senha}</td>
            `;
        });
    }
}

/**
 * Lógica da página de Dashboard (dashboard.html)
 */
function inicializarDashboard() {
    const totalAlunosEl = document.getElementById('total-alunos');
    if (!totalAlunosEl) return;

    const totalCursosEl = document.getElementById('total-cursos');
    const tabelaCursos = document.getElementById('tabela-cursos')?.querySelector('tbody');

    const usuarios = getUsuarios();
    const cursos = getCursos();

    totalAlunosEl.textContent = usuarios.length;
    totalCursosEl.textContent = cursos.length;

    if (tabelaCursos) {
        tabelaCursos.innerHTML = '';
        // Mostra apenas os 5 cursos mais recentes no dashboard
        cursos.slice(-5).reverse().forEach(curso => {
            const linha = tabelaCursos.insertRow();
            linha.innerHTML = `
                <td>${curso.id}</td>
                <td>${curso.nome}</td>
                <td>R$ ${curso.preco.toFixed(2)}</td>
                <td class="acoes">
                    <button class="botao-acao botao-editar" data-id="${curso.id}">Editar</button>
                </td>
            `;
        });

        tabelaCursos.addEventListener('click', (evento) => {
            if (evento.target.classList.contains('botao-editar')) {
                // Ao clicar em editar no dashboard, leva para a página de cursos
                window.location.href = 'cursos.html';
            }
        });
    }
}

/**
 * Lógica da página de Login do Admin (index.html)
 */
function inicializarLoginAdmin() {
    const formAdminLogin = document.getElementById('form-admin-login');
    if (!formAdminLogin) return;

    formAdminLogin.addEventListener('submit', (evento) => {
        evento.preventDefault();

        const email = document.getElementById('admin-email').value;
        const senha = document.getElementById('admin-senha').value;

        const adminUsers = getAdmins();
        const adminEncontrado = adminUsers.find(admin => admin.email === email && admin.senha === senha);

        if (adminEncontrado) {
            showAdminModal('Sucesso!', 'Login bem-sucedido! Redirecionando...', {
                onClose: () => {
                    localStorage.setItem('admin_logado', 'true');
                    window.location.href = 'dashboard.html';
                }});
        } else {
            showAdminModal('Erro', 'E-mail ou senha incorretos.');
        }
    });
}

/**
 * Função principal que roda em todas as páginas do admin
 */
document.addEventListener('DOMContentLoaded', () => {
    const naPaginaDeLogin = window.location.pathname.includes('/src/admin/index.html');

    // 1. Guarda de Rota (Route Guard)
    if (!naPaginaDeLogin && localStorage.getItem('admin_logado') !== 'true') {
        showAdminModal('Acesso Negado', 'Por favor, faça o login como administrador.', { onClose: () => {
            window.location.href = 'index.html';
        }});
        return;
    }

    // 2. Lógica de Logout (presente em todas as páginas, exceto login)
    const botaoSair = document.getElementById('botao-sair') || document.getElementById('btn-logout');
    if (botaoSair) {
        botaoSair.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('admin_logado');
            window.location.href = '../../pagina-principal.html';
        });
    }

    // 3. Roteador: chama a função correta para a página atual
    if (naPaginaDeLogin) {
        inicializarLoginAdmin();
    } else if (window.location.pathname.includes('dashboard.html')) {
        inicializarDashboard();
    } else if (window.location.pathname.includes('cursos.html')) {
        inicializarPaginaCursos();
    } else if (window.location.pathname.includes('usuarios.html')) {
        inicializarPaginaUsuarios();
    }
});