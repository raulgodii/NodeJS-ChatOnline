let chat = document.getElementById("chat");
const socket = io();

const messageInput = document.getElementById("message").addEventListener('input', () => (writing('user')));
const signInPage = document.getElementById('signIn');
const signUpPage = document.getElementById('signUp');
const homePage = document.getElementById('home');
const userList = document.getElementById('usersList');
let userName;

let typingTimer;
let isWriting = false;

// Sign In Page
function showSignIn() {
    signInPage.style.display = 'block';
    signUpPage.style.display = 'none';
    homePage.style.display = 'none';
}

// Sign Up Page
function showSignUp() {
    signInPage.style.display = 'none';
    signUpPage.style.display = 'block';
    homePage.style.display = 'none';
}

// Home Page
function showHome() {
    userName = document.getElementById('username').value;

    if (validateUserName(userName) && validateAvatar()) {
        signInPage.style.display = 'none';
        signUpPage.style.display = 'none';
        homePage.style.display = 'flex';

        socket.emit('userList', userName);
    } else {
        errorUserName = document.getElementById('errorUserName');
        errorAvatar= document.getElementById('errorAvatar');
        validateUserName(userName) ? errorUserName.innerHTML = '' : errorUserName.innerHTML = 'Invalid username';
        validateAvatar() ? errorAvatar.innerHTML = '' : errorAvatar.innerHTML = 'Select avatar';
    }
}

// Validar avatar inicio de sesión
function validateAvatar() {
    var avatarInputs = document.querySelectorAll('.avatar-input');

    for (var i = 0; i < avatarInputs.length; i++) {
        if ((avatarInputs[i].type === 'radio' || avatarInputs[i].type === 'file') && avatarInputs[i].checked) {
            return true;
        }
    }

    return false;
}

// Validar nombre usuario inicio de sesión
function validateUserName(username) {
    var regex = /^[a-zA-Z0-9]+$/;

    if (!username || username.trim() === '' || !regex.test(username)) {
        return false;
    }

    return true;
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

// Open chat from panel
function openChat(){
    group = document.getElementById('group1');
    if (group.classList.contains("main-visible")) {
        group.classList.remove("main-visible");
    } else {
        group.classList.add("main-visible");
    }
}

// Scroll to bottom
function scrollToBottom() {
    var chatContent = document.querySelector('.chat-content');
    chatContent.scrollTop = chatContent.scrollHeight;
}

// Actulizar avatar en el sign in
function updateAvatarLabel(input) {
    const label = document.getElementById('avatar-label');
    const div = document.getElementById('avatar-div');
    const avInput = document.getElementById('avatar-input6');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            label.style.backgroundImage = `url(${e.target.result})`;
            avInput.checked = true;
            div.style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    } else {
        label.style.backgroundImage = 'none';
        label.textContent = '+';
    }
}


/** ---|| RECIBIR ||--- */
// Usuarios conectados
socket.on('usersConnected', (usersConnected) => {
    usersConnectedElement = document.getElementById('usersConnected');

    usersConnectedElement.innerHTML = usersConnected + ' online';
});

// Lista de usuarios conectados
socket.on('userList', (response) => {
    response = JSON.parse(response);

    members = document.getElementById('members');
    members.innerHTML = response.length + ' Members';

    userList.innerHTML = '';

    response.forEach(user => {
        userElement = document.createElement('li');
        userElement.className = 'list-group-item py-4';
        userElement.innerHTML = `<div class="row align-items-center gx-4">
        <!-- Avatar -->
        <div class="col-auto">
            <div class="avatar avatar-sm ${user.online ? 'avatar-online':''}">
                <span
                    class="avatar-label bg-soft-success text-success fs-6">${getInitials(user.name)}</span>
            </div>
        </div>
        <!-- Avatar -->

        <!-- Text -->
        <div class="col overflow-hidden">
            <h6 class="text-truncate mb-1">${user.name}</h6>
            <p class=" ${user.online ? 'text-success':'text-muted'}  mb-0 fs-6">${user.online ? 'Online':'Disconnected'}</p>
        </div>
        <!-- Text -->

        <!-- Dropdown -->
        <div class="col-auto">
            <div class="dropdown">
                <button class="btn btn-icon btn-base btn-sm" type="button"
                    data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="ri-more-fill"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-right">
                    <li>
                        <a class="dropdown-item d-flex align-items-center justify-content-between"
                            href="#">Invite<i class="ri-user-add-line"></i></a>
                    </li>
                    <li>
                        <a class="dropdown-item d-flex align-items-center justify-content-between"
                            href="#">Block<i class="ri-forbid-line"></i></a>
                    </li>
                </ul>
            </div>
        </div>
        <!-- Dropdown -->
    </div>`
        userList.appendChild(userElement)
    });
});

// User join to the chat
socket.on('newUser', (user) => {
    chat.innerHTML += `
    <!-- Separator -->
        <div class="separator">
            <span class="separator-title fs-7 ls-1">'${user}' has joined the chat</span>
        </div>
    <!-- Separator -->
    `;
});

// User entry to the chat
socket.on('leftUser', (user) => {
    chat.innerHTML += `
    <!-- Separator -->
        <div class="separator">
            <span class="separator-title fs-7 ls-1">'${user}' has left the chat</span>
        </div>
    <!-- Separator -->
    `;
});

// Recibir mensaje
socket.on('sendMessage', (response) => {
    response = JSON.parse(response);

    addMessageToChat(response.msg, response.user, 'msg', false);

    scrollToBottom();
});

// Recibir sticker
socket.on('attachSticker', (stickerSrc, user) => {
    addMessageToChat(stickerSrc, user, 'sticker', false);

    scrollToBottom();
});

// Recibir escribiendo
socket.on('writing', (user) => {
    addMessageToChat('', user, 'writing', false);

    scrollToBottom();
});

// Recibir dejar de escribir
socket.on('stopWriting', (user) => {
    var writingElement = document.getElementById(user + 'Writing');

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
        isWriting = false;
        socket.emit('stopWriting', userName);
        socket.emit('sendMessage', message, userName);

        scrollToBottom();
    }
}

// Enviar Sticker
function attachSticker(stickerSrc) {
    addMessageToChat(stickerSrc, 'Me', 'sticker');
    socket.emit('attachSticker', stickerSrc, userName);

    scrollToBottom();
}

// Enviar escribiendo
function writing() {
    // Si el usuario ya está escribiendo, reiniciar el temporizador y no hacer nada más
    if (isWriting) {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(function () {
            isWriting = false;
            socket.emit('stopWriting', userName);
        }, 2500); // 2500 milisegundos
        return;
    }

    isWriting = true;

    typingTimer = setTimeout(function () {
        isWriting = false;
        socket.emit('stopWriting', userName);
    }, 2500);

    socket.emit('writing', userName);
}