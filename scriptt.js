document.addEventListener('DOMContentLoaded', function() {
    const chatBox = document.getElementById('chatbox');
    const messageInput = document.getElementById('message-input');
    const fileInput = document.getElementById('file-input');
    const sendButton = document.getElementById('submit-btn');

    // Load messages from local storage
    const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];

    // Display messages
    function displayMessages() {
        chatBox.innerHTML = '';
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.textContent = message;
            chatBox.appendChild(messageElement);
        });
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
    }

    // Send message
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            messages.push(message);
            localStorage.setItem('chatMessages', JSON.stringify(messages));
            messageInput.value = '';
            displayMessages();
            broadcastMessage(message);
        }
    }

    // Send file
    function sendFile() {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const fileElement = document.createElement('div');
                const fileLink = document.createElement('a');
                fileLink.href = e.target.result;
                fileLink.textContent = file.name;
                fileLink.download = file.name;
                fileElement.appendChild(fileLink);
                chatBox.appendChild(fileElement);
                chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
            };
            reader.readAsDataURL(file);
            fileInput.value = ''; // Clear file input
        }
    }

    // Broadcast message to all tabs
    function broadcastMessage(message) {
        const channel = new BroadcastChannel('chat_channel');
        channel.postMessage(message);
    }

    // Listen for messages from other tabs
    const channel = new BroadcastChannel('chat_channel');
    channel.onmessage = function(event) {
        const message = event.data;
        if (!messages.includes(message)) {
            messages.push(message);
            localStorage.setItem('chatMessages', JSON.stringify(messages));
            displayMessages();
        }
    };

    // Event listeners
    sendButton.addEventListener('click', () => {
        sendMessage();
        sendFile();
    });
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    fileInput.addEventListener('change', sendFile);

    // Initial display
    displayMessages();
});