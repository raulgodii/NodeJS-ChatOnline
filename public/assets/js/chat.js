let chat = document.getElementById("chat");
const socket = io();

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
    }

    var messageContent = `
        <div class="message ${self ? 'self' : ''}">
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


/** ---|| ENVIAR ||--- */
// Enviar mensaje
function sendMessage() {
    const messageInput = document.getElementById("message");
    const message = messageInput.value.trim();

    if (message !== '') {
        addMessageToChat(message, 'Me', 'msg')

        messageInput.value = '';
        socket.emit('sendMessage', message, 'User');
    }
}

// Enviar Sticker
function attachSticker(stickerSrc) {
    addMessageToChat(stickerSrc, 'Me', 'sticker');
    socket.emit('attachSticker', stickerSrc, 'User');
}