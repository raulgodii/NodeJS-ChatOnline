let chat = document.getElementById("chat");
const socket = io();

const messageInput = document.getElementById("message").addEventListener('input', () => (writing('user')));
const signInPage = document.getElementById('signIn');
const signUpPage = document.getElementById('signUp');
const homePage = document.getElementById('home');
let userName;

let typingTimer;
let isWriting = false;

// Sign In Page
function showSignIn(){
    signInPage.style.display = 'block';
    signUpPage.style.display = 'none';
    homePage.style.display = 'none';
}

// Sign Up Page
function showSignUp(){
    signInPage.style.display = 'none';
    signUpPage.style.display = 'block';
    homePage.style.display = 'none';
}

// Home Page
function showHome(){
    userName = document.getElementById('username').value;

    signInPage.style.display = 'none';
    signUpPage.style.display = 'none';
    homePage.style.display = 'flex';
}


// Hora actual
function getCurrentTime() {
    var fechaActual = new Date();
    var hora = fechaActual.getHours();
    var minutos = fechaActual.getMinutes();
    if (minutos < 10) {
        minutos = "0" + minutos;
    }
    return hora + ':' + minutos;
}

// Iniciales del nombre
function getInitials(name) {
    const words = name.split(' ');

    let initials = words[0].charAt(0).toUpperCase();

    if (words.length > 1) {
        initials += words[1].charAt(0).toUpperCase();
    }

    return initials;
}

// Plantilla mensaje
function addMessageToChat(data, user, type = 'msg', self = true) {
    var horaActual = getCurrentTime();

    switch (type) {
        case 'msg':
            message = `
                <div class="message-content">
                    <span>${data}</span>
                </div>
            `
            break;
        case 'sticker':
            message = `
                <img class='sticker' src='assets/img/stickers/${data}'></img>
            `
            break;
        case 'writing':
            message = `
                <div class="message-content">
                    <div>Writing
                        <div class="type-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            `
            break;
    }

    var messageContent = `
        <div ${type === 'writing' ? `id=${user}Writing` : ''} class="message ${self ? 'self' : ''}">
            <div class="message-wrap">                                    
                <div class="message-item">

                    ${message}

                    <div class="dropdown align-self-center">
                        <button class="btn btn-icon btn-base btn-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="ri-more-2-fill"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <a class="dropdown-item d-flex align-items-center justify-content-between" href="#">Edit
                                    <i class="ri-edit-line"></i>
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item d-flex align-items-center justify-content-between" href="#">Share
                                    <i class="ri-share-line"></i>
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item d-flex align-items-center justify-content-between" href="#">Delete
                                    <i class="ri-delete-bin-line"></i>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="message-info">
                <div class="avatar avatar-sm">
                    <span class="avatar-label bg-soft-success text-success fs-6">${self ? 'ME' : getInitials(user)}</span>
                </div>
                <div>
                    <h6 class="mb-0">${user}</h6>
                    <small class="text-muted">${horaActual}
                        <i class="ri-check-double-line align-bottom text-success fs-5"></i>
                    </small>
                </div>
            </div>
        </div>
    `;

    chat.innerHTML += messageContent;
}


/** ---|| RECIBIR ||--- */
// Usuarios conectados
socket.on('usersConnected', (usersConnected) => {
    usersConnectedElement = document.getElementById('usersConnected');

    usersConnectedElement.innerHTML = usersConnected + ' online';
});

// Recibir mensaje
socket.on('sendMessage', (response) => {
    response = JSON.parse(response);

    addMessageToChat(response.msg, response.user, 'msg', false)
});

// Recibir sticker
socket.on('attachSticker', (stickerSrc, user) => {
    addMessageToChat(stickerSrc, user, 'sticker', false);
});

// Recibir escribiendo
socket.on('writing', (user) => {
    addMessageToChat('', user, 'writing', false);
});

// Recibir dejar de escribir
socket.on('stopWriting', (user) => {
    var writingElement = document.getElementById(user+'Writing');

    writingElement.remove();
});


/** ---|| ENVIAR ||--- */
// Enviar mensaje
function sendMessage() {
    const messageInput = document.getElementById("message");
    const message = messageInput.value.trim();

    if (message !== '') {
        addMessageToChat(message, 'Me', 'msg')

        messageInput.value = '';
        socket.emit('sendMessage', message, userName);
    }
}

// Enviar Sticker
function attachSticker(stickerSrc) {
    addMessageToChat(stickerSrc, 'Me', 'sticker');
    socket.emit('attachSticker', stickerSrc, userName);
}

// Enviar escribiendo
function writing() {
    // Si el usuario ya está escribiendo, reiniciar el temporizador y no hacer nada más
    if (isWriting) {
        clearTimeout(typingTimer); 
        typingTimer = setTimeout(function() {
            isWriting = false;
            socket.emit('stopWriting', userName);
        }, 2500); // 2500 milisegundos
        return;
    }

    isWriting = true;

    typingTimer = setTimeout(function() {
        isWriting = false;
        socket.emit('stopWriting', userName);
    }, 2500); 

    socket.emit('writing', userName);
}