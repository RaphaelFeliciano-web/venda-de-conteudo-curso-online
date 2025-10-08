// Variável para armazenar o elemento do modal em cache e evitar recriá-lo
let modalElement = null;

/**
 * Cria e injeta o HTML do modal no DOM.
 * @returns {HTMLElement} O elemento do overlay do modal.
 */
function createModalElement() {
    const modalHTML = `
        <div class="modal-box">
            <h2 id="modal-title">Aviso</h2>
            <p id="modal-message">Mensagem aqui.</p>
            <button id="modal-close-btn" class="botao-principal">OK</button>
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
 * Exibe um modal de notificação customizado.
 * @param {string} title - O título do modal.
 * @param {string} message - A mensagem a ser exibida.
 * @param {function} onClose - Uma função a ser executada quando o modal for fechado.
 */
export function showCustomModal(title, message, onClose) {
    // Se o modal ainda não foi criado, cria e armazena em cache.
    if (!modalElement) {
        modalElement = createModalElement();
    }

    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const closeBtn = document.getElementById('modal-close-btn');

    modalTitle.textContent = title;
    modalMessage.textContent = message;

    closeBtn.onclick = () => {
        modalElement.classList.add('hidden');
        closeBtn.onclick = null; 
        if (typeof onClose === 'function') onClose();
    };

    modalElement.classList.remove('hidden');
}