let chat = document.getElementById("chat");
const socket = io();

const messageInput = document.getElementById("message").addEventListener('input', () => (writing('user')));
const signInPage = document.getElementById('signIn');
const homePage = document.getElementById('home');
const userList = document.getElementById('usersList');
const userListDirect = document.getElementById('userListDirect');
let user = {};

let typingTimer;
let isWriting = false;

// Agregar un evento de clic al contenedor principal
homePage.addEventListener('click', function(event) {
    // Verificar si el clic fue en un botón de cierre de chat o en el icono dentro del botón
    var closeButton = event.target.closest('.chat-hide');
    if (closeButton) {
        // Encontrar el contenedor del chat correspondiente y ocultarlo
        var chatC = closeButton.closest('.main');
        if (chatC) {
            chatC.classList.remove('main-visible');
        }
    }
});


// Sign In Page
function showSignIn() {
    signInPage.style.display = 'block';
    homePage.style.display = 'none';
}

// Home Page
function showHome() {
    user.name = document.getElementById('username').value;
    user.name = document.getElementById('username').value;

    const avInput = document.getElementById('avatar-input6');
    const fileInput = document.getElementById('avatar-input7');
    const endpoint = location.origin + '/uploadAvatar';

    if (validateUserName(user.name) && validateAvatar()) {

        const file = fileInput.files[0];
        if (file) {
            const formData = new FormData();
            const randomFileName = generateRandomFileName(file); // Generar nombre aleatorio
            formData.append('file', file, randomFileName); // Adjuntar archivo con el nuevo nombre
            fetch(endpoint, {
                method: 'POST',
                body: formData
            })
                .then(data => {

                    console.log(data);
                    avInput.value = 'img:' + randomFileName;

                    updateUserAvatar();

                    socket.emit('userList', user);
                })
                .catch(error => {
                    console.error(error);
                });
        } else {
            updateUserAvatar();

            socket.emit('userList', user);
        }

        signInPage.style.display = 'none';
        homePage.style.display = 'flex';
    } else {
        errorUserName = document.getElementById('errorUserName');
        errorAvatar = document.getElementById('errorAvatar');
        validateUserName(user.name) ? errorUserName.innerHTML = '' : errorUserName.innerHTML = 'Invalid username';
        validateAvatar() ? errorAvatar.innerHTML = '' : errorAvatar.innerHTML = 'Select avatar';
    }
}

// Actualizar el user.avatar
function updateUserAvatar() {
    avatares = document.querySelectorAll('.avatar-input');
    avatares.forEach(function (avatar) {
        if (avatar.checked) {
            console.log(avatar.value)
            user.avatar = avatar.value;
        }
    });
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
        case 'img':
            message = `
            <li class="list-group-item py-4">
            <div class="row align-items-center gx-4">
                <!-- Icon -->
                <div class="col-auto">
                <div class="shared-image-list row align-items-center g-3">
                <div class="col">
                    <a class="shared-image" href="./assets/img/files/${data.fileName}">
                        <img class="img-fluid rounded-2" src="./assets/img/files/${data.fileName}" alt="preview" data-action="zoom">
                    </a>
                </div>
            </div>
                </div>
                <!-- Icon -->

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
                                    href="./assets/img/files/${data.fileName}" download="./assets/img/files/${data.fileName}">Download<i
                                        class="ri-download-line"></i></a>
                            </li>
                            <li>
                                <a class="dropdown-item d-flex align-items-center justify-content-between"
                                    href="#">Share<i class="ri-share-line"></i></a>
                            </li>
                            <li>
                                <div class="dropdown-divider"></div>
                            </li>
                            <li>
                                <a class="dropdown-item d-flex align-items-center justify-content-between"
                                    href="#">Delete<i
                                        class="ri-delete-bin-line"></i></a>
                            </li>
                        </ul>
                    </div>
                </div>
                <!-- Dropdown -->
            </div>
        </li>
            `
            break;
        case 'file':
            message = `

                <li class="list-group-item py-4">
                    <div class="row align-items-center gx-4">
                        <!-- Icon -->
                        <div class="col-auto">
                            <div class="avatar avatar-sm">
                                <span class="avatar-label">
                                    <i class="ri-file-line"></i>
                                </span>
                            </div>
                        </div>
                        <!-- Icon -->

                        <!-- Text -->
                        <div class="col overflow-hidden">
                            <h6 class="text-truncate mb-1">${data.name}</h6>
                            <ul class="list-inline m-0">
                                <li class="list-inline-item">
                                    <p class="text-uppercase text-muted mb-0 fs-6">${data.size}</p>
                                </li>

                                <li class="list-inline-item">
                                    <p class="text-uppercase text-muted mb-0 fs-6">${data.extension}</p>
                                </li>
                            </ul>
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
                                            href="./assets/img/files/${data.fileName}" download="./assets/img/files/${data.fileName}">Download<i
                                                class="ri-download-line"></i></a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item d-flex align-items-center justify-content-between"
                                            href="#">Share<i class="ri-share-line"></i></a>
                                    </li>
                                    <li>
                                        <div class="dropdown-divider"></div>
                                    </li>
                                    <li>
                                        <a class="dropdown-item d-flex align-items-center justify-content-between"
                                            href="#">Delete<i
                                                class="ri-delete-bin-line"></i></a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <!-- Dropdown -->
                    </div>
                </li>
                `
            break;
    }

    var messageContent = `
        <div ${type === 'writing' ? `id=${user.name}Writing` : ''} class="message ${self ? 'self' : ''}">
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
                    ${user.avatar.startsWith('img:') ? `<span style="background-image: url('assets/img/avatars/${user.avatar.substring(4)}'); ; background-size: cover; background-position: center;" class="avatar-label"></span>` : `<span class="avatar-label ${user.avatar} fs-6">${getInitials(user.name)}</span>`}
                </div>
                <div>
                    <h6 class="mb-0">${self ? 'Me' : user.name}</h6>
                    <small class="text-muted">${horaActual}
                        <i class="ri-check-double-line align-bottom text-success fs-5"></i>
                    </small>
                </div>
            </div>
        </div>
    `;

    chat.innerHTML += messageContent;

    inicializarMagnificPopup();
}

// Función para inicializar Magnific Popup
function inicializarMagnificPopup() {
    $('.shared-image').magnificPopup({
        type: 'image',
        gallery: {
            enabled: true
        }
    });
}

// Open chat from panel
function openChat() {
    const children = homePage.children;

    // Iterar sobre cada elemento hijo
    for (let i = 0; i < children.length; i++) {
        if (children[i].id.startsWith('chat-')) {
            // Ocultar el elemento hijo si cumple la condición
            children[i].style.display = 'none';
        }
    }

    group = document.getElementById('chat-group1');

    if (group.classList.contains("main-visible")) {
        group.classList.remove("main-visible");
    } else {
        group.classList.add("main-visible");
    }

    if (group.style.display == 'none') {
        group.style.display = 'block';
    }
}

function openPrivateChat(uid) {
    group = document.getElementById('chat-group1');

    group.style.display = 'none';

    const children = homePage.children;

    // Iterar sobre cada elemento hijo
    for (let i = 0; i < children.length; i++) {
        if (children[i].id.startsWith('chat-')) {
            // Ocultar el elemento hijo si cumple la condición
            children[i].style.display = 'none';
        }
    }

    chatP = document.getElementById('chat-' + uid);

    if (chatP) {
        if (chatP.classList.contains("main-visible")) {
            chatP.classList.remove("main-visible");
        } else {
            chatP.classList.add("main-visible");
        }

        if (chatP.style.display == 'none') {
            chatP.style.display = 'block';
        }
    } else {
        chatP = document.createElement('div');
        chatP.id = 'chat-' + uid;
        chatP.className = 'main main-visible overflow-hidden h-100';
        chatP.innerHTML = `
            <div class="chat d-flex flex-row h-100">
                <!-- Chat -->
                <div class="chat-body h-100 w-100 d-flex flex-column">
                    <!-- Chat Header -->
                    <div class="chat-header d-flex align-items-center border-bottom px-2">
                        <div class="container-fluid">
                            <div class="row align-items-center g-0">
                                <div class="col-8 col-sm-5">
                                    <div class="d-flex align-items-center">
                                        <!-- Close Chat Button -->
                                        <div class="d-block d-xl-none me-3">
                                            <button class="chat-hide btn btn-icon btn-base btn-sm" type="button">
                                                <i class="ri-arrow-left-s-line"></i>
                                            </button>
                                        </div>
                                        <!-- Close Chat Button -->

                                        <!-- Avatar -->
                                        <div class="avatar avatar-sm me-3">
                                            <span class="avatar-label bg-primary text-white fs-6">G</span>
                                        </div>
                                        <!-- Avatar -->

                                        <!-- Text -->
                                        <div class="flex-grow-1 overflow-hidden">
                                            <h6 class="d-block text-truncate mb-1">${uid}</h6>
                                            <p class="d-block text-truncate text-muted fs-6 mb-0"> 0
                                                online</p>
                                        </div>
                                        <!-- Text -->
                                    </div>
                                </div>

                                <div class="col-4 col-sm-7">
                                    <ul class="list-inline text-end mb-0">
                                        <!-- Search Button -->
                                        <li class="list-inline-item d-none d-sm-inline-block">
                                            <button class="btn btn-icon btn-base" type="button" title="Search"
                                                data-bs-toggle="collapse" data-bs-target="#search-chat"
                                                aria-expanded="false">
                                                <i class="ri-search-line"></i>
                                            </button>
                                        </li>
                                        <!-- Search Button -->

                                        <!-- Chat Info Button -->
                                        <li class="list-inline-item d-none d-sm-inline-block">
                                            <button class="chat-info-toggle btn btn-icon btn-base" title="Chat info"
                                                type="button">
                                                <i class="ri-user-3-line"></i>
                                            </button>
                                        </li>
                                        <!-- Chat Info Button -->

                                        <!-- Dropdown -->
                                        <li class="list-inline-item">
                                            <div class="dropdown">
                                                <button class="btn btn-icon btn-base" type="button" title="Menu"
                                                    data-bs-toggle="dropdown" aria-expanded="false">
                                                    <i class="ri-more-fill"></i>
                                                </button>
                                                <ul class="dropdown-menu dropdown-menu-end">
                                                    <li class="d-block d-sm-none">
                                                        <a class="dropdown-item d-flex align-items-center justify-content-between"
                                                            href="#" data-bs-toggle="collapse"
                                                            data-bs-target="#search-chat" aria-expanded="false">Search
                                                            <i class="ri-search-line"></i>
                                                        </a>
                                                    </li>
                                                    <li class="d-block d-sm-none">
                                                        <a class="chat-info-toggle dropdown-item d-flex align-items-center justify-content-between"
                                                            href="#">Chat Info
                                                            <i class="ri-information-line"></i>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a class="dropdown-item d-flex align-items-center justify-content-between"
                                                            href="#">Archive
                                                            <i class="ri-archive-line"></i>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a class="dropdown-item d-flex align-items-center justify-content-between"
                                                            href="#">Mute
                                                            <i class="ri-volume-mute-line"></i>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <div class="dropdown-divider"></div>
                                                    </li>
                                                    <li>
                                                        <a class="dropdown-item d-flex align-items-center justify-content-between"
                                                            href="#">Block
                                                            <i class="ri-forbid-line"></i>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </li>
                                        <!-- Dropdown -->
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Chat Header -->

                    <!-- Chat Content -->
                    <div class="chat-content hide-scrollbar h-100">
                        <!-- Messages -->
                        <div id="chat-${uid}" class="container-fluid g-0 p-4">

                        </div>
                        <!-- Messages -->

                        <!-- Scroll Chat to Bottom -->
                        <div class="js-scroll-to-bottom"></div>
                        <!-- Scroll Chat to Bottom -->
                    </div>
                    <!-- Chat Content -->

                    <!-- Chat Stickers -->
                    <div>
                        <div class="border-bottom collapse" id="chat-stickers-${uid}">
                            <div class="px-1 py-4">
                                <div class="container-fluid">
                                    <div class="row">
                                        <div class="col">
                                            <div class="input-group">
                                                <img class="sticker" onclick="attachSticker('sticker1.jpg')"
                                                    class="sticker" src="assets/img/stickers/sticker1.jpg" alt="">
                                                <img class="sticker" onclick="attachSticker('sticker2.jpg')" class="sticker"
                                                    src="assets/img/stickers/sticker2.jpg" alt="">
                                                <img class="sticker" onclick="attachSticker('sticker3.webp')"
                                                    class="sticker" src="assets/img/stickers/sticker3.webp" alt="">
                                                <img class="sticker" onclick="attachSticker('sticker4.jpg')"
                                                    class="sticker" src="assets/img/stickers/sticker4.jpg" alt="">
                                                <img class="sticker" onclick="attachSticker('sticker5.png')"
                                                    class="sticker" src="assets/img/stickers/sticker5.png" alt="">
                                                <img class="sticker" onclick="attachSticker('sticker6.webp')"
                                                    class="sticker" src="assets/img/stickers/sticker6.webp" alt="">
                                                <img class="sticker" onclick="attachSticker('sticker7.jpg')"
                                                    class="sticker" src="assets/img/stickers/sticker7.jpg" alt="">
                                                <img class="sticker" onclick="attachSticker('sticker8.jpg')"
                                                    class="sticker" src="assets/img/stickers/sticker8.jpg" alt="">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Chat Stickers -->

                    <!-- Chat Footer -->
                    <div class="chat-footer d-flex align-items-center border-top px-2">
                        <div class="container-fluid">
                            <div class="row align-items-center g-4">
                                <!-- Input -->
                                <div class="col">
                                    <div class="input-group">
                                        <label for="attach-file" class="btn btn-white btn-lg border" type="button"><i
                                                class="ri-attachment-2"></i></label>
                                        <input id="message-${uid}" type="text" class="form-control form-control-lg"
                                            placeholder="Type message" aria-label="type message">
                                        <input type="file" name="file"
                                            class="visually-hidden" id="attach-file-${uid}"
                                            onchange="attachFile()">
                                        <button data-bs-toggle="collapse" data-bs-target="#chat-stickers"
                                            class="btn btn-white btn-lg border" type="button"><i
                                                class="ri-chat-smile-2-line"></i></button>
                                    </div>
                                </div>
                                <!-- Input -->

                                <!-- Button -->
                                <div class="col-auto">
                                    <ul class="list-inline d-flex align-items-center mb-0">
                                        <li class="list-inline-item">
                                            <button onclick="sendMessage()" type="submit"
                                                class="btn btn-icon btn-primary btn-lg rounded-circle">
                                                <i class="ri-send-plane-fill"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                                <!-- Button -->
                            </div>
                        </div>
                    </div>
                    <!-- Chat Footer -->
                </div>
                <!-- Chat -->

                <!-- Chat Info -->
                <div class="chat-info h-100 border-start">
                    <div class="d-flex flex-column h-100">
                        <!-- Header -->
                        <div class="chat-info-header d-flex align-items-center border-bottom">
                            <ul class="d-flex justify-content-between align-items-center list-unstyled w-100 mx-4 mb-0">
                                <!-- Title -->
                                <li>
                                    <h3 class="mb-0">Group Info</h3>
                                </li>
                                <!-- Title -->

                                <!-- Close Button -->
                                <li>
                                    <button class="chat-info-close btn btn-icon btn-base px-0">
                                        <i class="ri-close-line"></i>
                                    </button>
                                </li>
                                <!-- Close Button -->
                            </ul>
                        </div>
                        <!-- Header -->

                        <!-- Content -->
                        <div class="hide-scrollbar h-100">
                            <!-- User Info -->
                            <div class="text-center p-4 pt-14">
                                <!-- Avatar -->
                                <div class="avatar avatar-xl mb-4">
                                    <span class="avatar-label bg-primary text-white fs-3">G</span>
                                </div>
                                <!-- Avatar -->

                                <!-- Text -->
                                <h5>General</h5>
                                <!-- Text -->

                                <!-- Text -->
                                <div class="text-center">
                                    <span class="text-muted mb-0">Communication on any subject.</span>
                                </div>
                                <!-- Text -->
                            </div>
                            <!-- User Info -->

                            <!-- Tab Content -->
                            <div class="tab-content" id="pills-tab-group-content-${uid}">
                                <!-- Users -->
                                <div class="tab-pane fade show active" id="pills-users-${uid}" role="tabpanel"
                                    aria-labelledby="pills-users-tab">
                                    <ul id="usersList-${uid}" class="list-group list-group-flush">
                                        <!-- User 1 -->
                                        <li class="list-group-item py-4">
                                            <div class="row align-items-center gx-4">
                                                <!-- Avatar -->
                                                <div class="col-auto">
                                                    <div class="avatar avatar-sm">
                                                        <span class="avatar-label fs-6">0</span>
                                                    </div>
                                                </div>
                                                <!-- Avatar -->

                                                <!-- Text -->
                                                <div class="col overflow-hidden">
                                                    <h6 class="text-truncate mb-1">No users</h6>
                                                </div>
                                                <!-- Text -->
                                            </div>
                                        </li>
                                        <!-- User 1 -->
                                    </ul>
                                </div>
                                <!-- Users -->

                                <!-- Files -->
                                <div class="tab-pane fade" id="pills-files-${uid}" role="tabpanel"
                                    aria-labelledby="pills-files-tab">
                                    <ul class="list-group list-group-flush" id="fileList-${uid}">
                                        
                                    </ul>
                                </div>
                                <!-- Files -->
                            </div>
                            <!-- Tab Content -->
                        </div>
                        <!-- Content -->
                    </div>
                </div>
                <!-- Chat Info -->
            </div>
        </div>
        `;
        document.getElementById('home').appendChild(chatP);
    }

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

// Actualizar avatar en el sign in
function updateAvatarLabel(input) {
    const label = document.getElementById('avatar-label');
    const div = document.getElementById('avatar-div');
    const avInput = document.getElementById('avatar-input6');

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            label.style.backgroundImage = `url(${e.target.result})`;
            label.style.backgroundSize = 'cover';
            label.style.backgroundPosition = 'center';
            avInput.checked = true;
            div.style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    } else {
        label.style.backgroundImage = 'none';
        label.textContent = '+';
    }
}

// Función para generar un nombre aleatorio para el archivo
function generateRandomFileName(file) {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    return `${randomString}_${timestamp}.${fileExtension}`;
}

// Añdir archivo a lista de archivos del chat
function addFileToList(file) {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML += `
    <!-- File -->
    <li class="list-group-item py-4">
        <div class="row align-items-center gx-4">
            <!-- Icon -->
            <div class="col-auto">
                <div class="avatar avatar-sm">
                    <span class="avatar-label">
                        <i class="ri-file-line"></i>
                    </span>
                </div>
            </div>
            <!-- Icon -->

            <!-- Text -->
            <div class="col overflow-hidden">
                <h6 class="text-truncate mb-1">${file.name}</h6>
                <ul class="list-inline m-0">
                    <li class="list-inline-item">
                        <p class="text-uppercase text-muted mb-0 fs-6">${file.size}</p>
                    </li>

                    <li class="list-inline-item">
                        <p class="text-uppercase text-muted mb-0 fs-6">${file.extension}</p>
                    </li>
                </ul>
            </div>
            <!-- Text -->

            <!-- Dropdown -->
            <div class="col-auto">
                <div class="dropdown">
                    <button class="btn btn-icon btn-base btn-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="ri-more-fill"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-right">
                        <li>
                            <a class="dropdown-item d-flex align-items-center justify-content-between" href="./assets/img/files/${file.fileName}" download="./assets/img/files/${file.fileName}">Download<i class="ri-download-line"></i></a>
                        </li>
                        <li>
                            <a class="dropdown-item d-flex align-items-center justify-content-between" href="#">Share<i class="ri-share-line"></i></a>
                        </li>
                        <li>
                            <div class="dropdown-divider"></div>
                        </li>
                        <li>
                            <a class="dropdown-item d-flex align-items-center justify-content-between" href="#">Delete<i class="ri-delete-bin-line"></i></a>
                        </li>
                    </ul>
                </div>
            </div>
            <!-- Dropdown -->
        </div>
    </li>
    <!-- File -->
    `;
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

    response.sort((a, b) => {
        if (a.online && !b.online) {
            return -1;
        } else if (!a.online && b.online) {
            return 1;
        } else {
            return 0;
        }
    });

    members = document.getElementById('members');
    members.innerHTML = response.length + ' Members';

    userListDirect.innerHTML = '';

    userList.innerHTML = '';

    response.forEach(user => {
        userElement = document.createElement('li');
        userElement.className = 'list-group-item py-4';
        userElement.innerHTML = `<div class="row align-items-center gx-4">
        <!-- Avatar -->
        <div class="col-auto">
            <div class="avatar avatar-sm ${user.online ? 'avatar-online' : ''}">
            ${user.avatar.startsWith('img:') ? `<span style="background-image: url('assets/img/avatars/${user.avatar.substring(4)}'); ; background-size: cover; background-position: center;" class="avatar-label"></span>` : `<span class="avatar-label ${user.avatar} fs-6">${getInitials(user.name)}</span>`}
            </div>
        </div>
        <!-- Avatar -->

        <!-- Text -->
        <div class="col overflow-hidden">
            <h6 class="text-truncate mb-1">${user.name}</h6>
            <p class=" ${user.online ? 'text-success' : 'text-muted'}  mb-0 fs-6">${user.online ? 'Online' : 'Disconnected'}</p>
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

    response.forEach(user => {
        userElement = document.createElement('li');
        userElement.className = 'card contact-item mb-3';
        userElement.innerHTML = `
        <!-- Chat Link -->
            <a href="#" onclick="openPrivateChat('${user.uid}')" class="contact-link"></a>
            <div class="card-body">
                <div class="d-flex align-items-center ">
                    <!-- Avatar -->
                    <div class="avatar ${user.online ? 'avatar-online' : ''} me-4">
                        <span class="avatar-label">${user.avatar.startsWith('img:') ? `<span style="background-image: url('assets/img/avatars/${user.avatar.substring(4)}'); ; background-size: cover; background-position: center;" class="avatar-label"></span>` : `<span class="avatar-label ${user.avatar} fs-6">${getInitials(user.name)}</span>`}</span>
                    </div>
                    <!-- Avatar -->

                    <!-- Content -->
                    <div class="flex-grow-1 overflow-hidden">
                        <div class="d-flex align-items-center mb-1">
                            <h5 class="text-truncate mb-0 me-auto">${user.name}</h5>
                            <p class="small ${user.online ? 'text-success' : 'text-muted'} text-nowrap ms-4 mb-0">${user.online ? 'Online' : 'Disconnected'}
                            </p>
                        </div>
                        <div class="d-flex align-items-center">
                            <div class="line-clamp me-auto">Tap to chat
                            </div>
                            <span class="badge rounded-pill bg-primary ms-2">0</span>
                        </div>
                    </div>
                    <!-- Content -->
                </div>
            </div>
        <!-- Chat Link-->`
        userListDirect.appendChild(userElement)
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

    addMessageToChat(response.msg, response, 'msg', false);

    scrollToBottom();
});

// Recibir sticker
socket.on('attachSticker', (stickerSrc, user) => {
    addMessageToChat(stickerSrc, user, 'sticker', false);

    scrollToBottom();
});

// Recibir imagen
socket.on('attachImg', (file, user) => {
    addMessageToChat(file, user, 'img', false);

    addFileToList(file);

    scrollToBottom();
});

// Recibir archivo
socket.on('attachFile', (file, user) => {
    addMessageToChat(file, user, 'file', false);

    addFileToList(file);

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
        addMessageToChat(message, user, 'msg')

        messageInput.value = '';
        isWriting = false;
        socket.emit('stopWriting', user.name);
        socket.emit('sendMessage', message, user);

        scrollToBottom();
    }
}

// Enviar Sticker
function attachSticker(stickerSrc) {
    addMessageToChat(stickerSrc, user, 'sticker');
    socket.emit('attachSticker', stickerSrc, user);

    scrollToBottom();
}

// Adjuntar archivo en el chat
function attachFile() {
    const endpoint = location.origin + '/uploadFile';
    const fileInput = document.getElementById('attach-file');
    const file = fileInput.files[0];
    if (file) {
        const formData = new FormData();
        const randomFileName = generateRandomFileName(file); // Generar nombre aleatorio
        formData.append('file', file, randomFileName);
        fetch(endpoint, {
            method: 'POST',
            body: formData
        })
            .then(data => {
                const fileType = getFileType(file);
                if (fileType === 'image') {
                    // Si es una imagen
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        fileUp = getFileDetails(file, randomFileName);
                        addMessageToChat(fileUp, user, 'img');
                        addFileToList(fileUp);
                        scrollToBottom();
                        socket.emit('attachImg', fileUp, user);
                    };
                    reader.readAsDataURL(file);
                } else {
                    // Si es otro tipo de archivo
                    fileUp = getFileDetails(file, randomFileName);
                    addMessageToChat(fileUp, user, 'file');
                    addFileToList(fileUp);
                    scrollToBottom();
                    socket.emit('attachFile', fileUp, user);
                }
            })
            .catch(error => {
                console.error(error);
            });
    } else {
        console.log("File upload error");
    }
}

// Función para obtener el tipo de archivo
function getFileType(file) {
    const fileType = file.type.split('/')[0];
    return fileType;
}

// Función para obtener detalles del archivo (nombre, extensión y tamaño)
function getFileDetails(file, randomFileName) {
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop();
    const fileSize = (file.size / 1024).toFixed(2) + 'KB';
    return {
        name: fileName,
        extension: fileExtension.toUpperCase(),
        size: fileSize,
        fileName: randomFileName
    };
}


// Enviar escribiendo
function writing() {
    // Si el usuario ya está escribiendo, reiniciar el temporizador y no hacer nada más
    if (isWriting) {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(function () {
            isWriting = false;
            socket.emit('stopWriting', user.name);
        }, 2500); // 2500 milisegundos
        return;
    }

    isWriting = true;

    typingTimer = setTimeout(function () {
        isWriting = false;
        socket.emit('stopWriting', user.name);
    }, 2500);

    socket.emit('writing', user);
}