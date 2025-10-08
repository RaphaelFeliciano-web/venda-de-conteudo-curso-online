import { registrarUsuario, loginUsuario, getAdmins, adicionarAoCarrinho } from './database.js';
import { showCustomModal } from './utils.js';

async function carregarCabecalhoLogin() {
    const elementoCabecalho = document.getElementById('cabecalho-principal');
    if (!elementoCabecalho) return;

    try {
        const response = await fetch('_cabecalho.html');
        if (!response.ok) throw new Error('Não foi possível carregar o cabeçalho.');
        
        const htmlCabecalho = await response.text();
        elementoCabecalho.innerHTML = htmlCabecalho;

        // Na página de login, não precisamos da lógica de usuário logado,
        // pois se ele estivesse logado, já teria sido redirecionado.

    } catch (error) {
        console.error('Erro ao carregar componente de cabeçalho:', error);
        elementoCabecalho.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar o menu.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarCabecalhoLogin();

    // --- Proteção de Rotas para Administradores ---
    // Se um admin logado tentar acessar a página de login, redireciona para o dashboard.
    if (localStorage.getItem('admin_logado') === 'true') {
        window.location.href = 'src/admin/dashboard.html';
        return; 
    }

    // --- Proteção de Rotas para Usuários Comuns ---
    // Se um usuário comum já logado tentar acessar a página de login, redireciona para o painel.
    if (sessionStorage.getItem('usuario_logado')) {
        // Verifica se há um curso pendente para adicionar, para manter o fluxo de compra
        const cursoPendenteId = localStorage.getItem('cursoParaAdicionarAposLogin');
        if (cursoPendenteId) {
            adicionarAoCarrinho(parseInt(cursoPendenteId));
            localStorage.removeItem('cursoParaAdicionarAposLogin');
            showCustomModal('Aviso', 'Você já está logado. O curso foi adicionado ao seu carrinho.', () => {
                window.location.href = 'carrinho.html';
            });
        } else {
            showCustomModal('Aviso', 'Você já está logado. Redirecionando para o seu painel.', () => {
                window.location.href = 'painel-aluno.html';
            });
        }
        return;
    }

    // --- Lógica para alternar entre formulários de Login e Registro ---
    const secaoLogin = document.getElementById('formulario-login');
    const secaoRegistro = document.getElementById('formulario-registro');
    const linkMostrarRegistro = document.getElementById('link-mostrar-registro');
    const linkMostrarLogin = document.getElementById('link-mostrar-login');

    if (linkMostrarRegistro) {
        linkMostrarRegistro.addEventListener('click', (e) => {
            e.preventDefault();
            secaoLogin.classList.add('hidden');
            secaoRegistro.classList.remove('hidden');
        });
    }

    if (linkMostrarLogin) {
        linkMostrarLogin.addEventListener('click', (e) => {
            e.preventDefault();
            secaoRegistro.classList.add('hidden');
            secaoLogin.classList.remove('hidden');
        });
    }


    // --- Lógica do Formulário de Registro ---
    const formRegistro = document.getElementById('form-registro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', (evento) => {
            evento.preventDefault();

            const nome = document.getElementById('registro-nome').value;
            const email = document.getElementById('registro-email').value;
            const senha = document.getElementById('registro-senha').value;

            const sucesso = registrarUsuario({ nome, email, senha });

            if (sucesso) {
                showCustomModal('Sucesso!', 'Registro realizado com sucesso! Agora você pode fazer o login.');
                formRegistro.reset(); // Limpa os campos do formulário
            } else {
                showCustomModal('Erro', 'Este e-mail já está cadastrado. Por favor, tente fazer o login ou use outro e-mail.');
            }
        });
    }

    // --- Lógica do Formulário de Login ---
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', (evento) => {
            evento.preventDefault();

            const email = document.getElementById('login-email').value;
            const senha = document.getElementById('login-senha').value;

            // 1. Otimização: Verifica se é um administrador apenas se o email corresponder ao padrão
            const ehPotencialAdmin = email.endsWith('@admin.com') || email.endsWith('@projeto.com');
            if (ehPotencialAdmin) {
                const adminUsers = getAdmins();
                const adminEncontrado = adminUsers.find(admin => admin.email === email && admin.senha === senha); // A variável 'adminUsers' já está em inglês na origem
                if (adminEncontrado) {
                    showCustomModal('Login de Admin', 'Login de administrador detectado. Redirecionando para o painel.', () => {
                        localStorage.setItem('admin_logado', 'true');
                        window.location.href = 'src/admin/dashboard.html';
                    });
                    return; // Encerra a função aqui
                }
            }

            // 2. Se não for admin, tenta logar como usuário comum
            const usuarioComum = loginUsuario(email, senha);

            if (usuarioComum) {
                sessionStorage.setItem('usuario_logado', JSON.stringify(usuarioComum));

                // Verifica se há um curso para adicionar ao carrinho após o login
                const cursoPendenteId = localStorage.getItem('cursoParaAdicionarAposLogin');
                if (cursoPendenteId) {
                    adicionarAoCarrinho(parseInt(cursoPendenteId));
                    localStorage.removeItem('cursoParaAdicionarAposLogin'); // Limpa o item
                    showCustomModal('Login bem-sucedido!', 'O curso foi adicionado ao seu carrinho.', () => {
                        window.location.href = 'painel-aluno.html'; // Redireciona para o painel do aluno
                    });
                } else {
                    showCustomModal('Login bem-sucedido!', `Bem-vindo(a), ${usuarioComum.nome}!`, () => {
                        window.location.href = 'painel-aluno.html'; // Redireciona para o painel do aluno
                    });
                }
            } else {
                showCustomModal('Erro de Login', 'E-mail ou senha incorretos.');
            }
        });
    }
});