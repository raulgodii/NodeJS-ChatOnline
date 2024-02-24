let chat = document.getElementById("chat");
const socket = io();

socket.on('sendMessage', (response) => {
    response = JSON.parse(response);
    console.log('Recibo ' + response.msg)

    const chatMessages = document.getElementById("chat-messages");
    const messageContent = `
    <div class="message">
        <div class="message-wrap">
            <div class="message-item">
                <div class="message-content">
                    <span>${response.msg}</span>
                </div>
                <div class="dropdown align-self-center">
                    <button class="btn btn-icon btn-base btn-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="ri-more-2-fill"></i>
                    </button>
                    <ul class="dropdown-menu">
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
                <span class="avatar-label bg-soft-primary text-primary fs-6">US</span>
            </div>
            <div>
                <h6 class="mb-0">${response.user}</h6>
                <small class="text-muted">9:46 PM
                    <i class="ri-check-double-line align-bottom text-success fs-5"></i>
                </small>
            </div>
        </div>
    </div>
    `;
    chat.innerHTML += messageContent;
});

socket.on('usersConnected', (usersConnected) => {
    usersConnectedElement = document.getElementById('usersConnected');

    usersConnectedElement.innerHTML = usersConnected + ' online';
});

function sendMessage() {
    const messageInput = document.getElementById("message");
    const message = messageInput.value.trim();

    if (message !== '') {
        var fechaActual = new Date();

        var hora = fechaActual.getHours();
        var minutos = fechaActual.getMinutes();

        var horaActual = hora + ':' + minutos;

        chat.innerHTML += `
            <div class="message self">
                <div class="message-wrap">                                    
                    <div class="message-item">
                        <div class="message-content">
                            <span>${message}</span>
                        </div>
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
                        <span class="avatar-label bg-soft-success text-success fs-6">ME</span>
                    </div>
                    <div>
                        <h6 class="mb-0">Me</h6>
                        <small class="text-muted">${horaActual}
                            <i class="ri-check-double-line align-bottom text-success fs-5"></i>
                        </small>
                    </div>
                </div>
            </div>
        `;

        messageInput.value = '';
        socket.emit('sendMessage', message, 'User');
    }
}