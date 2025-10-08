// Importa as funções do nosso "banco de dados"
import { 
    getCursos, 
    getCarrinho, 
    adicionarAoCarrinho, 
    removerDoCarrinho,
    getModulosConcluidos,
    marcarModuloComoConcluido,
    desmarcarModuloComoConcluido
} from './database.js'; 
import { showCustomModal } from './utils.js';


// LÓGICA DAS PÁGINAS (Renderização, Filtros, Carrinho, etc.)
// =================================================================

async function carregarCabecalho() {
    const elementoCabecalho = document.getElementById('cabecalho-principal');
    if (!elementoCabecalho) return;

    try {
        const response = await fetch('_cabecalho.html');
        if (!response.ok) throw new Error('Não foi possível carregar o cabeçalho.');
        
        const htmlCabecalho = await response.text();
        elementoCabecalho.innerHTML = htmlCabecalho;

        // --- Lógica de Autenticação do Usuário (executa APÓS o cabeçalho ser carregado) ---
        const usuarioLogado = JSON.parse(sessionStorage.getItem('usuario_logado'));
        const linkLogin = elementoCabecalho.querySelector('.navegacao a[href*="login.html"]');

        if (usuarioLogado && linkLogin) {
            const listaNavegacao = linkLogin.parentElement.parentElement; // Pega o <ul>

            // Remove o link de Login
            linkLogin.parentElement.remove();

            // Cria o dropdown do usuário
            const dropdownUsuario = document.createElement('li');
            dropdownUsuario.className = 'menu-suspenso-usuario'; // Classe para o container do dropdown
            dropdownUsuario.innerHTML = `
                <a href="#" class="gatilho-menu-suspenso nav-usuario">Olá, ${usuarioLogado.nome.split(' ')[0]} &#9662;</a>
                <ul class="menu-suspenso">
                    <li><a href="painel-aluno.html">Meus Cursos</a></li>
                    <li><a href="perfil.html">Meu Perfil</a></li>
                    <li><a href="carrinho.html">Meu Carrinho</a></li>
                    <li class="divisor"></li>
                    <li><a href="#" id="botao-sair-usuario">Sair</a></li>
                </ul>
            `;
            listaNavegacao.appendChild(dropdownUsuario);

            // Adiciona a lógica de clique para abrir/fechar o submenu
            const gatilhoDropdown = dropdownUsuario.querySelector('.gatilho-menu-suspenso');
            gatilhoDropdown.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Impede que o clique feche o menu imediatamente
                dropdownUsuario.classList.toggle('ativo');
            });

            // Adiciona a lógica de logout para o botão dentro do submenu
            const botaoSairUsuario = dropdownUsuario.querySelector('#botao-sair-usuario');
            botaoSairUsuario.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.removeItem('usuario_logado');
                window.location.href = 'login.html';
            });
        }
    } catch (error) {
        console.error('Erro ao carregar componente de cabeçalho:', error);
        elementoCabecalho.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar o menu.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Carrega o cabeçalho e depois executa o resto do código
    carregarCabecalho().then(() => {
        // --- Proteção de Rotas para Administradores ---
        if (localStorage.getItem('admin_logado') === 'true') {
            // Verifica se não estamos já numa página de admin para evitar loop
            if (!window.location.pathname.includes('/admin/')) {
                window.location.href = 'src/admin/dashboard.html';
                return;
            }
        }

        // O restante do seu código que manipula o DOM da página continua aqui...
        inicializarLogicaDaPagina();
    });

    // Adiciona um listener global para fechar o menu se clicar fora dele
    document.addEventListener('click', (e) => {
        const dropdownAtivo = document.querySelector('.menu-suspenso-usuario.ativo');
        // Se existe um dropdown ativo e o clique foi fora dele
        if (dropdownAtivo && !dropdownAtivo.contains(e.target)) {
            dropdownAtivo.classList.remove('ativo');
        }
    });
});

function inicializarLogicaDaPagina() {

    // --- Lógica da Página de Cursos (cursos.html) ---
    const containerCursosPopulares = document.querySelector('#cursos-populares .container-cursos');
    const containerCursos = document.querySelector('#lista-cursos .container-cursos');
    const campoBusca = document.getElementById('campo-busca');
    const filtroCategoria = document.getElementById('filtro-categoria');
    const containerPaginacao = document.getElementById('container-paginacao');

    // Variáveis de estado para a paginação
    let paginaAtual = 1;
    const cursosPorPagina = 6; // Defina quantos cursos quer por página

    function renderizarCursos(cursosParaRenderizar, container) {
        if (!container) return; // Sai se o container não existir na página atual

        container.innerHTML = ''; // Limpa o container antes de renderizar

        if (cursosParaRenderizar.length === 0) {
            container.innerHTML = '<p>Nenhum curso encontrado.</p>';
            return;
        }

        const usuarioLogado = JSON.parse(sessionStorage.getItem('usuario_logado'));
        const cursosComprados = usuarioLogado ? getCarrinho() : [];

        cursosParaRenderizar.forEach(curso => {
            const cartao = document.createElement('div');
            cartao.className = 'cartao-curso';

            const jaPossuiCurso = cursosComprados.includes(curso.id);
            let botaoHtml;

            if (jaPossuiCurso) {
                const idPrimeiroModulo = curso.curriculo && curso.curriculo.length > 0 ? curso.curriculo[0].id : '#';
                const linkAcesso = `modulo.html?cursoId=${curso.id}&moduloId=${idPrimeiroModulo}`;
                botaoHtml = `<a href="${linkAcesso}" class="botao-principal" style="width: 100%; box-sizing: border-box;">Acessar Conteúdo</a>`;
            } else {
                botaoHtml = `<a href="curso-detalhe.html?id=${curso.id}" class="botao-principal" style="width: 100%; box-sizing: border-box;">Saiba Mais</a>`;
            }

            cartao.innerHTML = `
                <img src="${curso.imagem}" alt="Capa do curso ${curso.nome}">
                <div class="cartao-curso-conteudo">
                    <h3>${curso.nome}</h3>
                    <p>${curso.descricao}</p>
                    ${botaoHtml}
                </div>
            `;
            container.appendChild(cartao);
        });
    }

    // Função para renderizar os controles da paginação
    function renderizarPaginacao(totalDeCursos) {
        if (!containerPaginacao) return;

        containerPaginacao.innerHTML = '';
        const totalPaginas = Math.ceil(totalDeCursos / cursosPorPagina);

        if (totalPaginas <= 1) return; // Não mostra paginação se só tem 1 página

        // Botão "Anterior"
        const btnAnterior = document.createElement('button');
        btnAnterior.textContent = 'Anterior';
        btnAnterior.disabled = paginaAtual === 1;
        btnAnterior.addEventListener('click', () => {
            paginaAtual--;
            aplicarFiltros();
        });
        containerPaginacao.appendChild(btnAnterior);

        // A lógica de paginação avançada só deve ser montada se houver mais de uma página.
        if (totalPaginas > 1) {
            const criarBotaoPagina = (numeroPagina) => {
                const btn = document.createElement('button');
                btn.textContent = numeroPagina;
                if (numeroPagina === paginaAtual) btn.classList.add('ativo');
                btn.addEventListener('click', () => {
                    paginaAtual = numeroPagina;
                    aplicarFiltros();
                });
                containerPaginacao.appendChild(btn);
            };
    
            const criarReticencias = () => {
                const span = document.createElement('span');
                span.textContent = '...';
                span.className = 'paginacao-reticencias'; // Para estilização opcional
                containerPaginacao.appendChild(span);
            };
    
            // Lógica de exibição dos botões
            // Sempre mostra a primeira página
            criarBotaoPagina(1);
    
            // Mostra reticências se a página atual estiver longe do início
            if (paginaAtual > 3) {
                criarReticencias();
            }
    
            // Mostra as páginas ao redor da página atual
            for (let i = paginaAtual - 1; i <= paginaAtual + 1; i++) {
                if (i > 1 && i < totalPaginas) {
                    criarBotaoPagina(i);
                }
            }

            // Mostra reticências se a página atual estiver longe do final
            if (paginaAtual < totalPaginas - 2) {
                criarReticencias();
            }
    
            // Sempre mostra a última página
            criarBotaoPagina(totalPaginas);
    
            // Botão "Próximo"
            const btnProximo = document.createElement('button');
            btnProximo.textContent = 'Próximo';
            btnProximo.disabled = paginaAtual === totalPaginas;
            btnProximo.addEventListener('click', () => {
                paginaAtual++;
                aplicarFiltros();
            });
            containerPaginacao.appendChild(btnProximo);
        }
    }

    // Função para aplicar os filtros e a busca
    function aplicarFiltros() {
        const todosOsCursos = getCursos();
        const termoBusca = campoBusca ? campoBusca.value.toLowerCase() : ''; // Defensive check
        const categoriaSelecionada = filtroCategoria ? filtroCategoria.value : '';
        const usuarioLogado = JSON.parse(sessionStorage.getItem('usuario_logado'));

        let cursosFiltrados = todosOsCursos;

        // 1. Filtrar por termo de busca
        if (termoBusca) {
            cursosFiltrados = cursosFiltrados.filter(curso =>
                curso.nome.toLowerCase().includes(termoBusca)
            );
        }

        // 2. Filtrar por categoria
        if (categoriaSelecionada) {
            cursosFiltrados = cursosFiltrados.filter(curso =>
                curso.categoria === categoriaSelecionada
            );
        }

        // Lógica de Paginação
        const totalCursosFiltrados = cursosFiltrados.length;
        const indiceInicial = (paginaAtual - 1) * cursosPorPagina;
        const indiceFinal = indiceInicial + cursosPorPagina;
        const cursosDaPagina = cursosFiltrados.slice(indiceInicial, indiceFinal);

        renderizarCursos(cursosDaPagina, containerCursos);
        renderizarPaginacao(totalCursosFiltrados);
    }

    // Verifica se estamos na página de cursos e configura os eventos
    if (containerCursos) {
        aplicarFiltros(); // Renderiza a lista inicial (sem filtros)
        campoBusca.addEventListener('input', () => { paginaAtual = 1; aplicarFiltros(); });
        filtroCategoria.addEventListener('change', () => { paginaAtual = 1; aplicarFiltros(); });
    }

    // Verifica se estamos na página inicial e renderiza os cursos populares
    if (containerCursosPopulares) {
        const cursosPopulares = getCursos().slice(0, 3); // Pega os 3 primeiros cursos
        renderizarCursos(cursosPopulares, containerCursosPopulares);
    }

    const containerDetalheCurso = document.getElementById('detalhe-curso');

    if (containerDetalheCurso) {
        const parametrosUrl = new URLSearchParams(window.location.search);
        const idCurso = parseInt(parametrosUrl.get('id'));

        if (idCurso) {
            const curso = getCursos().find(c => c.id === idCurso);

            if (curso) {
                document.title = `Detalhes: ${curso.nome}`;

                const container = containerDetalheCurso.querySelector('.container-detalhe-curso');
                container.querySelector('h1').textContent = curso.nome;
                container.querySelector('.coluna-conteudo p').textContent = curso.descricao;
                
                // Renderiza o currículo dinamicamente
                const listaCurriculo = container.querySelector('.lista-curriculo');
                if (curso.curriculo && listaCurriculo) {
                    listaCurriculo.innerHTML = ''; // Limpa a lista
                    curso.curriculo.forEach(modulo => {
                        const itemLista = document.createElement('li'); // A classe CSS já tem o contador
                        itemLista.innerHTML = `<a href="modulo.html?cursoId=${curso.id}&moduloId=${modulo.id}">${modulo.nome}</a>`;
                        listaCurriculo.appendChild(itemLista);
                    });

                    // Adiciona um listener para verificar o acesso antes de navegar
                    listaCurriculo.addEventListener('click', (e) => {
                        if (e.target.tagName === 'A') {
                            e.preventDefault(); // Impede a navegação imediata

                            const usuarioLogado = JSON.parse(sessionStorage.getItem('usuario_logado'));
                            const cursosComprados = getCarrinho();
                            const url = new URL(e.target.href);
                            const idCursoClicado = parseInt(url.searchParams.get('cursoId'));

                            if (usuarioLogado && cursosComprados.includes(idCursoClicado)) {
                                // Se o usuário está logado e possui o curso, permite o acesso
                                window.location.href = e.target.href;
                            } else {
                                // Caso contrário, exibe o modal
                                showCustomModal('Acesso Restrito', 'Você precisa adquirir este curso para acessar o conteúdo.');
                                // Opcional: se não estiver logado, poderia redirecionar para o login após o modal.
                            }
                        }
                    });
                }


                const colunaCompra = container.querySelector('.coluna-compra');
                const imagemCurso = colunaCompra.querySelector('.imagem-dos-cursos img');
                
                if (imagemCurso) {
                    imagemCurso.src = curso.imagem;
                    imagemCurso.alt = `Imagem do curso ${curso.nome}`;
                }

                colunaCompra.querySelector('.preco').textContent = `R$ ${curso.preco.toFixed(2).replace('.', ',')}`;
                
                // Lógica para mostrar/ocultar o vídeo
                const tituloCurso = container.querySelector('h1');
                const containerVideo = container.querySelector('.container-video');
                tituloCurso.addEventListener('click', () => {
                    containerVideo.classList.toggle('video-oculto');
                });
                
                // Lógica do botão de ação (Comprar ou Acessar)
                const botaoComprar = document.getElementById('botao-comprar');
                const usuarioLogado = JSON.parse(sessionStorage.getItem('usuario_logado'));
                const cursosComprados = getCarrinho();

                if (usuarioLogado && cursosComprados.includes(idCurso)) {
                    // Se o usuário está logado e já possui o curso
                    botaoComprar.textContent = 'Acessar Conteúdo';
                    botaoComprar.addEventListener('click', () => {
                        const idPrimeiroModulo = curso.curriculo && curso.curriculo.length > 0 ? curso.curriculo[0].id : '#';
                        window.location.href = `modulo.html?cursoId=${curso.id}&moduloId=${idPrimeiroModulo}`;
                    });
                } else {
                    // Se o usuário não possui o curso ou não está logado
                    botaoComprar.textContent = 'Comprar / Matricular';
                    botaoComprar.addEventListener('click', () => {
                        if (usuarioLogado) {
                            // Se está logado, apenas adiciona ao carrinho e vai para a página
                            adicionarAoCarrinho(idCurso);
                            showCustomModal('Sucesso!', 'Curso adicionado ao carrinho.', () => window.location.href = 'carrinho.html');
                        } else {
                            // Se não está logado, avisa e redireciona para o login
                            localStorage.setItem('cursoParaAdicionarAposLogin', idCurso);
                            showCustomModal('Login Necessário', 'Você precisa fazer login para comprar um curso.', () => window.location.href = 'login.html');
                        }
                    });
                }

            } else {
                containerDetalheCurso.innerHTML = '<h1>Curso não encontrado</h1><p>O curso que você procura não existe. <a href="cursos.html">Voltar aos cursos</a>.</p>';
            }
        }
    }

    const containerItensCarrinho = document.getElementById('itens-carrinho');
    function renderizarCarrinho() {
        const paginaCarrinho = document.getElementById('carrinho');
        if (!paginaCarrinho) return; // Sai se não estiver na página do carrinho

        const containerItens = paginaCarrinho.querySelector('#itens-carrinho');
        const mensagemVazio = paginaCarrinho.querySelector('#carrinho-vazio');
        const idsCarrinho = getCarrinho();
        const todosCursos = getCursos();
        let total = 0;

        containerItens.innerHTML = ''; // Limpa o container

        if (idsCarrinho.length === 0) {
            mensagemVazio.classList.remove('hidden');
            document.getElementById('total-carrinho').innerHTML = '<strong>Total: R$ 0,00</strong>';
            return;
        }

        idsCarrinho.forEach(id => {
            const curso = todosCursos.find(c => c.id === id);
            if (curso) {
                total += curso.preco;
                const itemCarrinho = document.createElement('div');
                itemCarrinho.className = 'item-carrinho';
                itemCarrinho.innerHTML = `
                    <div class="info-item-carrinho"><span>${curso.nome}</span><span>R$ ${curso.preco.toFixed(2).replace('.', ',')}</span></div>
                    <button class="botao-remover-item" data-id="${curso.id}" title="Remover item">&times;</button>
                `;
                containerItens.appendChild(itemCarrinho);
            }
        });

        // Atualiza o total
        const elementoTotalCarrinho = document.getElementById('total-carrinho');
        elementoTotalCarrinho.innerHTML = `<strong>Total: R$ ${total.toFixed(2).replace('.', ',')}</strong>`;
    }

    renderizarCarrinho();
    if (document.getElementById('itens-carrinho')) {
        document.getElementById('itens-carrinho').addEventListener('click', (evento) => {
            if (evento.target.classList.contains('botao-remover-item')) {
                const idCurso = parseInt(evento.target.dataset.id);
                removerDoCarrinho(idCurso);
                renderizarCarrinho(); // Re-renderiza o carrinho para refletir a remoção
            }
        });
    }

    // --- Lógica da Página do Módulo (modulo.html) ---
    const containerModulo = document.getElementById('conteudo-modulo');
    if (containerModulo) {
        const parametrosUrl = new URLSearchParams(window.location.search);
        const idCurso = parseInt(parametrosUrl.get('cursoId'));
        const idModulo = parametrosUrl.get('moduloId');

        // --- Guarda de Rota (Route Guard) ---
        const usuarioLogado = JSON.parse(sessionStorage.getItem('usuario_logado'));


        // 1. Verifica se o usuário está logado
        if (!usuarioLogado) {
            showCustomModal('Acesso Negado', 'Você precisa estar logado para acessar o conteúdo do curso.', () => {
                window.location.href = 'login.html';
            });
            return; // Interrompe a execução
        }

        // 2. Verifica se o curso foi "comprado"
        const cursosComprados = getCarrinho();
        if (!cursosComprados.includes(idCurso)) {
            showCustomModal('Acesso Negado', 'Você ainda não adquiriu este curso.', () => {
                window.location.href = `curso-detalhe.html?id=${idCurso}`;
            });
            return; // Interrompe a execução
        }
        // --- Fim da Guarda de Rota ---

        const curso = getCursos().find(c => c.id === idCurso);
        
        if (curso && curso.curriculo) {
            // Pega a lista de módulos já concluídos por este usuário neste curso
            const modulosConcluidos = getModulosConcluidos(usuarioLogado.email, idCurso);

            const modulo = curso.curriculo.find(m => m.id === idModulo);

            if (modulo) {
                document.title = modulo.nome;
                containerModulo.querySelector('#titulo-modulo').textContent = modulo.nome;
                // Carrega a descrição e o link de voltar
                containerModulo.querySelector('#descricao-modulo').textContent = `Conteúdo detalhado para o "${modulo.nome}".`;
                containerModulo.querySelector('#link-voltar').href = `curso-detalhe.html?id=${curso.id}`;

                // Carrega o vídeo dinamicamente
                const reprodutorVideo = containerModulo.querySelector('video');
                if (reprodutorVideo && modulo.videoSrc) {
                    reprodutorVideo.src = modulo.videoSrc;
                }

                // --- Lógica do Controle de Conclusão (Checkbox) ---
                const controleConclusaoAntigo = document.getElementById('controle-conclusao');
                // Clonamos o nó para remover quaisquer event listeners antigos
                const controleConclusaoNovo = controleConclusaoAntigo.cloneNode(true);
                controleConclusaoAntigo.parentNode.replaceChild(controleConclusaoNovo, controleConclusaoAntigo);

                const iconeCheckbox = controleConclusaoNovo.querySelector('.checkbox-icone');
                const textoCheckbox = controleConclusaoNovo.querySelector('.checkbox-texto');

                function atualizarInterfaceConclusao() {
                    const modulosAtuaisConcluidos = getModulosConcluidos(usuarioLogado.email, idCurso);
                    const estaConcluido = modulosAtuaisConcluidos.includes(idModulo);
                    const linkSidebar = document.querySelector(`#lista-modulos-barra-lateral a[href*="moduloId=${idModulo}"]`);

                    if (estaConcluido) {
                        controleConclusaoNovo.classList.add('concluido');
                        iconeCheckbox.innerHTML = '&#10003;'; // Adiciona o ícone de "check"
                        textoCheckbox.textContent = 'Aula concluída';
                        linkSidebar?.classList.add('concluido');
                    } else {
                        controleConclusaoNovo.classList.remove('concluido');
                        iconeCheckbox.innerHTML = ''; // Remove o ícone de "check"
                        textoCheckbox.textContent = 'Marcar como concluída';
                        linkSidebar?.classList.remove('concluido');
                    }
                }

                // Adiciona o evento de clique ao novo nó, garantindo que seja o único
                controleConclusaoNovo.addEventListener('click', () => {
                    // Re-verificamos o estado no momento do clique para garantir consistência
                    const modulosAtuaisConcluidos = getModulosConcluidos(usuarioLogado.email, idCurso);
                    const estaConcluido = modulosAtuaisConcluidos.includes(idModulo);

                    // Alterna o estado
                    estaConcluido 
                        ? desmarcarModuloComoConcluido(usuarioLogado.email, idCurso, idModulo)
                        : marcarModuloComoConcluido(usuarioLogado.email, idCurso, idModulo);
                    
                    atualizarInterfaceConclusao(); // Atualiza a interface após a ação
                });

                atualizarInterfaceConclusao(); // Define o estado visual inicial

                // Popula a barra lateral com a lista de módulos
                const barraLateral = document.querySelector('.barra-lateral-modulos');
                if (barraLateral) {
                    barraLateral.querySelector('#titulo-curso-barra-lateral').textContent = curso.nome;
                    const listaBarraLateral = barraLateral.querySelector('#lista-modulos-barra-lateral');
                    listaBarraLateral.innerHTML = '';
                    curso.curriculo.forEach(mod => {
                        const itemLista = document.createElement('li');
                        const link = document.createElement('a');
                        link.href = `modulo.html?cursoId=${curso.id}&moduloId=${mod.id}`;
                        link.textContent = mod.nome;

                        if (mod.id === idModulo) itemLista.classList.add('ativo'); // Destaca o módulo atual
                        if (modulosConcluidos.includes(mod.id)) link.classList.add('concluido'); // Adiciona indicador de conclusão
                        
                        itemLista.appendChild(link);
                        listaBarraLateral.appendChild(itemLista);
                    });
                }
            } else {
                containerModulo.innerHTML = '<h1>Módulo não encontrado.</h1>';
            }
        } else {
            containerModulo.innerHTML = '<h1>Curso não encontrado.</h1>';
        }
    }

    // --- Lógica da Página Painel do Aluno ---
    const containerCursosComprados = document.getElementById('cursos-comprados');
    if (containerCursosComprados) {
        // Guarda de Rota: Verifica se o usuário está logado
        const usuario = JSON.parse(sessionStorage.getItem('usuario_logado'));
        if (!usuario) {
            showCustomModal('Acesso Negado', 'Você precisa estar logado para acessar esta página.', () => {
                window.location.href = 'login.html';
            });
            return;
        }

        // Para esta simulação, consideramos os cursos no carrinho como "comprados"
        const idsCursosComprados = getCarrinho();
        const todosCursos = getCursos();

        containerCursosComprados.innerHTML = ''; // Limpa o conteúdo estático

        if (idsCursosComprados.length === 0) {
            containerCursosComprados.innerHTML = '<p>Você ainda não adquiriu nenhum curso. <a href="cursos.html">Ver cursos disponíveis</a>.</p>';
        } else {
            idsCursosComprados.forEach(id => {
                const curso = todosCursos.find(c => c.id === id);
                if (curso) {
                    const divCurso = document.createElement('div');
                    divCurso.className = 'curso-adquirido';

                    // --- Lógica de Cálculo de Progresso ---
                    const totalModulos = curso.curriculo?.length || 0;
                    const modulosConcluidos = getModulosConcluidos(usuario.email, curso.id);
                    const numModulosConcluidos = modulosConcluidos.length;
                    const progresso = totalModulos > 0 ? (numModulosConcluidos / totalModulos) * 100 : 0;

                    // Cria um link para o primeiro módulo do curso
                    const idPrimeiroModulo = curso.curriculo && curso.curriculo.length > 0 ? curso.curriculo[0].id : '#';
                    const linkAcesso = `modulo.html?cursoId=${curso.id}&moduloId=${idPrimeiroModulo}`;

                    divCurso.innerHTML = `
                        <h3>${curso.nome}</h3>
                        <div class="progresso-info-container">
                            <div class="progresso-curso">
                                <div class="barra-progresso" style="width: ${progresso}%;"></div>
                            </div>
                            <span>${Math.round(progresso)}% concluído</span>
                        </div>
                        <a href="${linkAcesso}" class="botao-principal">Acessar Conteúdo</a>
                    `;
                    containerCursosComprados.appendChild(divCurso);
                }
            });
        }
    }

    // --- Lógica da Página de Perfil do Aluno ---
    const formularioPerfil = document.getElementById('formulario-perfil');
    if (formularioPerfil) {
        // Guarda de Rota: Apenas usuários logados podem ver o perfil
        if (!usuarioLogado) {
            showCustomModal('Acesso Negado', 'Você precisa estar logado para acessar esta página.', () => {
                window.location.href = 'login.html';
            });
            return;
        }

        // Preenche o formulário com os dados do usuário
        document.getElementById('perfil-nome').value = usuarioLogado.nome;
        document.getElementById('perfil-email').value = usuarioLogado.email;

        formularioPerfil.addEventListener('submit', (e) => {
            e.preventDefault();
            // Em um projeto real, aqui você chamaria uma função para atualizar os dados no banco.
            // Por enquanto, vamos apenas simular a atualização e dar um feedback.
            const nomeAtualizado = document.getElementById('perfil-nome').value;
            usuarioLogado.nome = nomeAtualizado;
            sessionStorage.setItem('usuario_logado', JSON.stringify(usuarioLogado));
            showCustomModal('Sucesso!', 'Perfil atualizado com sucesso!', () => {
                window.location.reload(); // Recarrega a página para mostrar o nome atualizado no menu
            });
        });
    }
}