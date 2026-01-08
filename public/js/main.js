// Chat functionality
let chatOpen = false;

function toggleChat() {
    const chatWidget = document.getElementById('chatWidget');
    const chatBadge = document.querySelector('.chat-badge');
    
    if (chatOpen) {
        closeChat();
    } else {
        openChat();
    }
}

function openChat() {
    const chatWidget = document.getElementById('chatWidget');
    const chatBadge = document.querySelector('.chat-badge');
    chatWidget.classList.add('active');
    chatBadge.style.display = 'none';
    chatOpen = true;
    
    // Focus input
    setTimeout(() => {
        document.getElementById('chatInput').focus();
    }, 300);
}

function closeChat() {
    const chatWidget = document.getElementById('chatWidget');
    chatWidget.classList.remove('active');
    chatOpen = false;
}

// Send message
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message === '') return;
    
    // Add user message
    addMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Send to N8N webhook
    sendToN8N(message);
}

// Add message to chat
function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typingIndicator';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    typingDiv.appendChild(contentDiv);
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Send to N8N
async function sendToN8N(message) {
    try {
        const response = await fetch('/api/chat/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        removeTypingIndicator();
        
        if (data.success) {
            // Check if should transfer to WhatsApp
            if (data.transferToWhatsApp) {
                addMessage(data.response, 'bot');
                setTimeout(() => {
                    openWhatsApp();
                }, 1500);
            } else if (data.showAppointmentForm) {
                addMessage(data.response, 'bot');
                showAppointmentForm();
            } else {
                addMessage(data.response, 'bot');
            }
        } else {
            addMessage('Lo siento, ha ocurrido un error. ¿Deseas hablar con un humano?', 'bot');
        }
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator();
        addMessage('Error de conexión. Por favor intenta de nuevo.', 'bot');
    }
}

// Quick replies
function sendQuickReply(type) {
    let message = '';
    
    switch(type) {
        case 'precios':
            message = 'Quiero saber los precios';
            break;
        case 'agendar':
            message = 'Quiero agendar una cita';
            break;
        case 'marcas':
            message = '¿Qué marcas atienden?';
            break;
        case 'humano':
            message = 'Quiero hablar con un humano';
            break;
    }
    
    document.getElementById('chatInput').value = message;
    sendMessage();
}

// Show appointment form
function showAppointmentForm() {
    const messagesContainer = document.getElementById('chatMessages');
    const formDiv = document.createElement('div');
    formDiv.className = 'message bot-message';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `
        <form id="appointmentForm" class="mt-2">
            <div class="mb-2">
                <input type="text" class="form-control form-control-sm" placeholder="Nombre completo" required id="apptName">
            </div>
            <div class="mb-2">
                <input type="tel" class="form-control form-control-sm" placeholder="Teléfono" required id="apptPhone">
            </div>
            <div class="mb-2">
                <input type="text" class="form-control form-control-sm" placeholder="Marca del vehículo" required id="apptBrand">
            </div>
            <div class="mb-2">
                <input type="text" class="form-control form-control-sm" placeholder="Modelo" required id="apptModel">
            </div>
            <div class="mb-2">
                <input type="date" class="form-control form-control-sm" required id="apptDate">
            </div>
            <div class="mb-2">
                <select class="form-control form-control-sm" required id="apptTime">
                    <option value="">Selecciona horario</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary btn-sm w-100">Agendar</button>
        </form>
    `;
    
    formDiv.appendChild(contentDiv);
    messagesContainer.appendChild(formDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Handle form submission
    document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitAppointment();
    });
}

// Submit appointment
async function submitAppointment() {
    const appointmentData = {
        name: document.getElementById('apptName').value,
        phone: document.getElementById('apptPhone').value,
        brand: document.getElementById('apptBrand').value,
        model: document.getElementById('apptModel').value,
        date: document.getElementById('apptDate').value,
        time: document.getElementById('apptTime').value
    };
    
    try {
        const response = await fetch('/api/appointments/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appointmentData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            addMessage('✅ ¡Cita agendada exitosamente! Te enviaremos una confirmación por WhatsApp.', 'bot');
        } else {
            addMessage('❌ Error al agendar la cita. Por favor intenta de nuevo o contacta por WhatsApp.', 'bot');
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage('Error al procesar la cita. Por favor intenta de nuevo.', 'bot');
    }
}

// Open WhatsApp
function openWhatsApp() {
    const phone = '1234567890'; // Replace with actual number
    const message = encodeURIComponent('Hola, me gustaría información sobre programación de llaves');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}

// Enter key to send message
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: e.target[0].value,
                email: e.target[1].value,
                phone: e.target[2].value,
                message: e.target[3].value
            };
            
            try {
                const response = await fetch('/api/contact/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('¡Mensaje enviado exitosamente! Te contactaremos pronto.');
                    contactForm.reset();
                } else {
                    alert('Error al enviar el mensaje. Por favor intenta de nuevo.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al enviar el mensaje.');
            }
        });
    }
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('mainNav');
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 5px 30px rgba(0,0,0,0.2)';
        } else {
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        }
    });
});
