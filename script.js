// ========================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ========================================

/*
 * Estado global que maneja:
 * - currentUser: usuario actualmente autenticado
 * - users: array de todos los usuarios registrados
 * - favors: array de todos los favores (pedidos y ofertas)
 *
 * En producción, esto estaría en una base de datos.
 * Usamos localStorage para persistir datos entre sesiones.
 */
const AppState = {
    currentUser: null,
    users: [],
    favors: []
};

// ========================================
// INICIALIZACIÓN DE LA APP
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos guardados del localStorage
    loadFromLocalStorage();

    // Verificar si hay usuario logueado
    checkUserSession();

    // Inicializar event listeners
    initEventListeners();

    // Renderizar favores si hay usuario logueado
    if (AppState.currentUser) {
        showFavorsSection();
        renderFavors();
    }
});

// ========================================
// PERSISTENCIA DE DATOS (LocalStorage)
// ========================================

function loadFromLocalStorage() {
    const savedUsers = localStorage.getItem('uc_users');
    const savedFavors = localStorage.getItem('uc_favors');
    const savedCurrentUser = localStorage.getItem('uc_currentUser');

    if (savedUsers) {
        AppState.users = JSON.parse(savedUsers);
    }

    if (savedFavors) {
        AppState.favors = JSON.parse(savedFavors);
    }

    if (savedCurrentUser) {
        AppState.currentUser = JSON.parse(savedCurrentUser);
    }
}

function saveToLocalStorage() {
    localStorage.setItem('uc_users', JSON.stringify(AppState.users));
    localStorage.setItem('uc_favors', JSON.stringify(AppState.favors));
    localStorage.setItem('uc_currentUser', JSON.stringify(AppState.currentUser));
}

// ========================================
// GESTIÓN DE SESIÓN DE USUARIO
// ========================================

function checkUserSession() {
    if (AppState.currentUser) {
        updateUIForLoggedInUser();
    } else {
        updateUIForGuest();
    }
}

function updateUIForLoggedInUser() {
    // Ocultar botones de login/registro
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('registerBtn').style.display = 'none';

    // Mostrar menú de usuario
    const userMenu = document.getElementById('userMenu');
    userMenu.style.display = 'flex';

    // Actualizar puntos en la barra de navegación
    document.getElementById('userPoints').textContent = `${AppState.currentUser.points} puntos`;
}

function updateUIForGuest() {
    // Mostrar botones de login/registro
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('registerBtn').style.display = 'block';

    // Ocultar menú de usuario
    document.getElementById('userMenu').style.display = 'none';
}

// ========================================
// INICIALIZACIÓN DE EVENT LISTENERS
// ========================================

function initEventListeners() {
    // Botones de navegación
    document.getElementById('loginBtn').addEventListener('click', () => openModal('loginModal'));
    document.getElementById('registerBtn').addEventListener('click', () => openModal('registerModal'));
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('profileBtn').addEventListener('click', showProfileSection);

    // Botones de la página principal
    document.getElementById('offerFavorBtn').addEventListener('click', openOfferFavorModal);
    document.getElementById('requestFavorBtn').addEventListener('click', openRequestFavorModal);

    // Botón para agregar favor desde la sección de favores
    document.getElementById('addFavorBtn').addEventListener('click', openOfferFavorModal);

    // Botón para volver a favores desde el perfil
    document.getElementById('backToFavorsBtn').addEventListener('click', showFavorsSection);

    // Filtro de categorías
    document.getElementById('categoryFilter').addEventListener('change', renderFavors);

    // Formularios
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('addFavorForm').addEventListener('submit', handleAddFavor);

    // Cambiar entre modales de login/registro
    document.getElementById('switchToRegister').addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('loginModal');
        openModal('registerModal');
    });

    document.getElementById('switchToLogin').addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('registerModal');
        openModal('loginModal');
    });

    // Cerrar modales con X
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Cerrar modal al hacer click fuera
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// ========================================
// GESTIÓN DE MODALES
// ========================================

function openModal(modalId) {
    // Verificar si el usuario debe estar logueado
    if ((modalId === 'addFavorModal') && !AppState.currentUser) {
        alert('Debes iniciar sesión para publicar favores');
        openModal('loginModal');
        return;
    }

    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function openOfferFavorModal() {
    if (!AppState.currentUser) {
        alert('Debes iniciar sesión para ofrecer favores');
        openModal('loginModal');
        return;
    }

    document.getElementById('favorModalTitle').textContent = 'Ofrecer un Favor';
    document.getElementById('favorType').checked = true;
    document.getElementById('addFavorForm').reset();
    openModal('addFavorModal');
}

function openRequestFavorModal() {
    if (!AppState.currentUser) {
        alert('Debes iniciar sesión para pedir favores');
        openModal('loginModal');
        return;
    }

    document.getElementById('favorModalTitle').textContent = 'Pedir un Favor';
    document.getElementById('favorType').checked = false;
    document.getElementById('addFavorForm').reset();
    openModal('addFavorModal');
}

// ========================================
// AUTENTICACIÓN - REGISTRO
// ========================================

function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim().toLowerCase();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

    // Validaciones
    if (!email.endsWith('@uc.cl')) {
        alert('Debes usar un correo UC (@uc.cl)');
        return;
    }

    if (password !== passwordConfirm) {
        alert('Las contraseñas no coinciden');
        return;
    }

    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    // Verificar si el usuario ya existe
    const existingUser = AppState.users.find(u => u.email === email);
    if (existingUser) {
        alert('Ya existe una cuenta con este correo');
        return;
    }

    // Crear nuevo usuario con 50 puntos iniciales
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password, // En producción, se debe hashear
        points: 50, // Puntos iniciales de bienvenida
        favorsOffered: 0,
        favorsReceived: 0,
        createdAt: new Date().toISOString()
    };

    AppState.users.push(newUser);
    saveToLocalStorage();

    alert('¡Cuenta creada exitosamente! Has recibido 50 puntos de bienvenida.');

    closeModal('registerModal');
    document.getElementById('registerForm').reset();

    // Auto-login después de registro
    loginUser(newUser);
}

// ========================================
// AUTENTICACIÓN - LOGIN
// ========================================

function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    // Buscar usuario
    const user = AppState.users.find(u => u.email === email && u.password === password);

    if (!user) {
        alert('Correo o contraseña incorrectos');
        return;
    }

    loginUser(user);

    closeModal('loginModal');
    document.getElementById('loginForm').reset();
}

function loginUser(user) {
    AppState.currentUser = user;
    saveToLocalStorage();
    updateUIForLoggedInUser();
    showFavorsSection();
    renderFavors();

    alert(`¡Bienvenido/a ${user.name}!`);
}

// ========================================
// CERRAR SESIÓN
// ========================================

function logout() {
    AppState.currentUser = null;
    localStorage.removeItem('uc_currentUser');
    updateUIForGuest();
    showHomeSection();

    alert('Sesión cerrada exitosamente');
}

// ========================================
// NAVEGACIÓN ENTRE SECCIONES
// ========================================

function showHomeSection() {
    document.getElementById('homeSection').style.display = 'block';
    document.getElementById('favorsSection').style.display = 'none';
    document.getElementById('profileSection').style.display = 'none';
}

function showFavorsSection() {
    document.getElementById('homeSection').style.display = 'none';
    document.getElementById('favorsSection').style.display = 'block';
    document.getElementById('profileSection').style.display = 'none';

    renderFavors();
}

function showProfileSection() {
    if (!AppState.currentUser) {
        alert('Debes iniciar sesión');
        return;
    }

    document.getElementById('homeSection').style.display = 'none';
    document.getElementById('favorsSection').style.display = 'none';
    document.getElementById('profileSection').style.display = 'block';

    renderProfile();
}

// ========================================
// GESTIÓN DE FAVORES - AGREGAR
// ========================================

function handleAddFavor(e) {
    e.preventDefault();

    if (!AppState.currentUser) {
        alert('Debes iniciar sesión');
        return;
    }

    const title = document.getElementById('favorTitle').value.trim();
    const description = document.getElementById('favorDescription').value.trim();
    const category = document.getElementById('favorCategory').value;
    const points = parseInt(document.getElementById('favorPoints').value);
    const isOffer = document.getElementById('favorType').checked;

    // Crear nuevo favor
    const newFavor = {
        id: Date.now(),
        title: title,
        description: description,
        category: category,
        points: points,
        type: isOffer ? 'offer' : 'request',
        userId: AppState.currentUser.id,
        userName: AppState.currentUser.name,
        status: 'active',
        createdAt: new Date().toISOString()
    };

    AppState.favors.push(newFavor);
    saveToLocalStorage();

    closeModal('addFavorModal');
    document.getElementById('addFavorForm').reset();

    renderFavors();

    alert(isOffer ? '¡Favor ofrecido exitosamente!' : '¡Favor solicitado exitosamente!');
}

// ========================================
// RENDERIZAR FAVORES
// ========================================

function renderFavors() {
    const favorsList = document.getElementById('favorsList');
    const categoryFilter = document.getElementById('categoryFilter').value;

    // Filtrar favores activos
    let filteredFavors = AppState.favors.filter(f => f.status === 'active');

    // Aplicar filtro de categoría
    if (categoryFilter !== 'all') {
        filteredFavors = filteredFavors.filter(f => f.category === categoryFilter);
    }

    // Limpiar lista
    favorsList.innerHTML = '';

    if (filteredFavors.length === 0) {
        favorsList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <p style="font-size: 1.2rem; color: var(--uc-gray-dark);">
                    ${categoryFilter === 'all' ? 'No hay favores disponibles. ¡Sé el primero en publicar uno!' : 'No hay favores en esta categoría.'}
                </p>
            </div>
        `;
        return;
    }

    // Renderizar cada favor
    filteredFavors.forEach(favor => {
        const favorCard = createFavorCard(favor);
        favorsList.appendChild(favorCard);
    });
}

function createFavorCard(favor) {
    const card = document.createElement('div');
    card.className = `favor-card ${favor.type}`;

    const isOwnFavor = AppState.currentUser && favor.userId === AppState.currentUser.id;
    const canAccept = AppState.currentUser && !isOwnFavor;

    // Determinar si el usuario tiene suficientes puntos (solo para requests)
    const hasEnoughPoints = AppState.currentUser ? AppState.currentUser.points >= favor.points : false;

    card.innerHTML = `
        <div class="favor-header">
            <div>
                <h3 class="favor-title">${favor.title}</h3>
                <span class="favor-badge ${favor.type === 'offer' ? 'badge-offer' : 'badge-request'}">
                    ${favor.type === 'offer' ? 'Oferta' : 'Solicitud'}
                </span>
            </div>
        </div>
        <span class="favor-category">${getCategoryName(favor.category)}</span>
        <p class="favor-description">${favor.description}</p>
        <div class="favor-footer">
            <span class="favor-user">👤 ${favor.userName}</span>
            <span class="favor-points">⭐ ${favor.points} puntos</span>
        </div>
        <div class="favor-actions">
            ${canAccept ? `
                ${favor.type === 'offer' ?
                    `<button class="btn-success" onclick="acceptOffer(${favor.id})" ${!hasEnoughPoints ? 'disabled title="No tienes suficientes puntos"' : ''}>
                        ${hasEnoughPoints ? 'Aceptar Oferta' : 'Puntos insuficientes'}
                    </button>` :
                    `<button class="btn-success" onclick="acceptRequest(${favor.id})">
                        Ayudar (ganar ${favor.points} pts)
                    </button>`
                }
            ` : ''}
            ${isOwnFavor ? `
                <button class="btn-danger" onclick="deleteFavor(${favor.id})">Eliminar</button>
            ` : ''}
        </div>
    `;

    return card;
}

function getCategoryName(category) {
    const categories = {
        'apuntes': '📚 Apuntes',
        'clases': '🎓 Clases Particulares',
        'proyectos': '💻 Ayuda en Proyectos',
        'traducciones': '🌐 Traducciones',
        'prestamo': '📝 Préstamo de Material',
        'otros': '🔧 Otros'
    };
    return categories[category] || category;
}

// ========================================
// ACEPTAR FAVORES
// ========================================

/*
 * Lógica de aceptación de favores:
 *
 * OFFER (Oferta): Alguien ofrece algo
 * - El que acepta PAGA puntos
 * - El que ofreció RECIBE puntos
 *
 * REQUEST (Solicitud): Alguien pide algo
 * - El que ayuda GANA puntos
 * - El que pidió PAGA puntos (debe tener suficientes)
 */

function acceptOffer(favorId) {
    if (!AppState.currentUser) {
        alert('Debes iniciar sesión');
        return;
    }

    const favor = AppState.favors.find(f => f.id === favorId);
    if (!favor) return;

    // Verificar que el usuario tenga puntos suficientes
    if (AppState.currentUser.points < favor.points) {
        alert('No tienes suficientes puntos para aceptar esta oferta');
        return;
    }

    if (!confirm(`¿Aceptar esta oferta por ${favor.points} puntos?`)) {
        return;
    }

    // El que acepta pierde puntos
    AppState.currentUser.points -= favor.points;
    AppState.currentUser.favorsReceived += 1;

    // El que ofreció gana puntos
    const offeror = AppState.users.find(u => u.id === favor.userId);
    if (offeror) {
        offeror.points += favor.points;
        offeror.favorsOffered += 1;
    }

    // Marcar favor como completado
    favor.status = 'completed';
    favor.completedBy = AppState.currentUser.id;
    favor.completedAt = new Date().toISOString();

    saveToLocalStorage();
    updateUIForLoggedInUser();
    renderFavors();

    alert(`¡Favor aceptado! Has pagado ${favor.points} puntos.`);
}

function acceptRequest(favorId) {
    if (!AppState.currentUser) {
        alert('Debes iniciar sesión');
        return;
    }

    const favor = AppState.favors.find(f => f.id === favorId);
    if (!favor) return;

    // El que pidió debe tener puntos suficientes
    const requester = AppState.users.find(u => u.id === favor.userId);
    if (!requester || requester.points < favor.points) {
        alert('El solicitante no tiene suficientes puntos para completar este favor');
        return;
    }

    if (!confirm(`¿Ayudar con este favor? Ganarás ${favor.points} puntos.`)) {
        return;
    }

    // El que ayuda gana puntos
    AppState.currentUser.points += favor.points;
    AppState.currentUser.favorsOffered += 1;

    // El que pidió pierde puntos
    requester.points -= favor.points;
    requester.favorsReceived += 1;

    // Marcar favor como completado
    favor.status = 'completed';
    favor.completedBy = AppState.currentUser.id;
    favor.completedAt = new Date().toISOString();

    saveToLocalStorage();
    updateUIForLoggedInUser();
    renderFavors();

    alert(`¡Gracias por ayudar! Has ganado ${favor.points} puntos.`);
}

// ========================================
// ELIMINAR FAVOR
// ========================================

function deleteFavor(favorId) {
    if (!confirm('¿Estás seguro de eliminar este favor?')) {
        return;
    }

    const index = AppState.favors.findIndex(f => f.id === favorId);
    if (index !== -1) {
        AppState.favors.splice(index, 1);
        saveToLocalStorage();
        renderFavors();
        alert('Favor eliminado exitosamente');
    }
}

// ========================================
// RENDERIZAR PERFIL
// ========================================

function renderProfile() {
    if (!AppState.currentUser) return;

    document.getElementById('profileName').textContent = AppState.currentUser.name;
    document.getElementById('profileEmail').textContent = AppState.currentUser.email;
    document.getElementById('profilePoints').textContent = AppState.currentUser.points;
    document.getElementById('favorsOffered').textContent = AppState.currentUser.favorsOffered || 0;
    document.getElementById('favorsReceived').textContent = AppState.currentUser.favorsReceived || 0;

    // Calcular nivel de reputación basado en puntos
    const reputationLevel = getReputationLevel(AppState.currentUser.points);
    document.getElementById('reputationLevel').textContent = reputationLevel;
}

function getReputationLevel(points) {
    if (points >= 500) return '🏆 Leyenda';
    if (points >= 300) return '💎 Diamante';
    if (points >= 200) return '🥇 Oro';
    if (points >= 100) return '🥈 Plata';
    if (points >= 50) return '🥉 Bronce';
    return '⭐ Novato';
}

// ========================================
// DATOS DE DEMOSTRACIÓN
// ========================================

// Agregar algunos usuarios y favores de ejemplo si es la primera vez
if (AppState.users.length === 0) {
    const demoUsers = [
        {
            id: 1,
            name: 'María González',
            email: 'mgonzalez@uc.cl',
            password: '123456',
            points: 120,
            favorsOffered: 8,
            favorsReceived: 5,
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            name: 'Carlos Rodríguez',
            email: 'crodriguez@uc.cl',
            password: '123456',
            points: 85,
            favorsOffered: 4,
            favorsReceived: 6,
            createdAt: new Date().toISOString()
        }
    ];

    const demoFavors = [
        {
            id: 1001,
            title: 'Presto apuntes de Cálculo II',
            description: 'Tengo apuntes completos del semestre pasado con la profesora Sánchez. Incluyen todos los capítulos y ejercicios resueltos.',
            category: 'apuntes',
            points: 10,
            type: 'offer',
            userId: 1,
            userName: 'María González',
            status: 'active',
            createdAt: new Date().toISOString()
        },
        {
            id: 1002,
            title: 'Necesito ayuda con proyecto de Programación',
            description: 'Busco alguien que me ayude a debuggear un error en mi proyecto de Python. Es sobre estructuras de datos.',
            category: 'proyectos',
            points: 15,
            type: 'request',
            userId: 2,
            userName: 'Carlos Rodríguez',
            status: 'active',
            createdAt: new Date().toISOString()
        },
        {
            id: 1003,
            title: 'Ofrezco clases particulares de Física',
            description: 'Soy ayudante de Física I y II. Puedo ayudarte con cualquier tema del ramo, especialmente mecánica y electromagnetismo.',
            category: 'clases',
            points: 20,
            type: 'offer',
            userId: 1,
            userName: 'María González',
            status: 'active',
            createdAt: new Date().toISOString()
        },
        {
            id: 1004,
            title: 'Busco traducción inglés-español',
            description: 'Necesito traducir un paper de 5 páginas para mi tesis. Es sobre ingeniería.',
            category: 'traducciones',
            points: 25,
            type: 'request',
            userId: 2,
            userName: 'Carlos Rodríguez',
            status: 'active',
            createdAt: new Date().toISOString()
        }
    ];

    AppState.users = demoUsers;
    AppState.favors = demoFavors;
    saveToLocalStorage();
}
