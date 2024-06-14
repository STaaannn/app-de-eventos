let events = [];
let arr = [];

const eventName = document.querySelector('#eventName');
const eventDate = document.querySelector('#eventDate');
const buttonAdd = document.querySelector('#bAdd');
const eventsContainer = document.querySelector('#eventsContainer');

const json = load();

try {
    arr = JSON.parse(json);
} catch(error) {
    arr = [];
}
events = arr ? [...arr] : [];

document.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    addEvent();
});

renderEvents();

function addEvent() {
    if (eventName.value === "" || eventDate.value === "") {
        return;
    }

    if (dateDiff(eventDate.value) < 0) {
        return;
    }

    const newEvent = {
        id: (Math.random() * 100).toString(36).slice(3),
        name: eventName.value,
        date: eventDate.value,
    };

    events.unshift(newEvent);

    save(JSON.stringify(events));

    eventName.value = "";

    renderEvents();
}

function dateDiff(d) {
    const targetDate = new Date(d);
    const today = new Date();
    const difference = targetDate.getTime() - today.getTime();
    const days = Math.ceil(difference / (1000 * 3600 * 24));
    return days;
}

function renderEvents() {
    const eventsHTML = events.map(event => {
        const daysDifference = dateDiff(event.date);
        const notificationDays = 1; // Días antes del evento para mostrar la notificación

        // Programar notificación si el evento está dentro del rango de notificación
        if (daysDifference > 0 && daysDifference <= notificationDays) {
            scheduleNotification(event);
        }

        return `
            <div class="event">
                <div class="days">
                    <span class="days-number">${daysDifference}</span>
                    <span class="days-text">días</span>
                </div>
                <div class="event-name">${event.name}</div>
                <div class="event-date">${event.date}</div>
                <div class="actions">
                    <button class="bEdit" data-id="${event.id}">Editar</button>
                    <button class="bDelete" data-id="${event.id}">Eliminar</button>
                </div>
            </div>
        `;
    });

    eventsContainer.innerHTML = eventsHTML.join("");

    // Agregar listeners a los botones de Editar y Eliminar
    document.querySelectorAll('.bEdit').forEach(button => {
        button.addEventListener("click", e => {
            const id = button.getAttribute('data-id');
            editEvent(id);
        });
    });

    document.querySelectorAll('.bDelete').forEach(button => {
        button.addEventListener("click", e => {
            const id = button.getAttribute('data-id');
            deleteEvent(id);
        });
    });
}

function scheduleNotification(event) {
    if (!checkNotificationCompatibility()) {
        return;
    }

    // Crear y mostrar la notificación
    const notification = new Notification("Evento próximo", {
        body: `${event.name} ocurrirá el ${event.date}`,
    });

    // Agregar evento para manejar clics en la notificación (opcional)
    notification.onclick = function() {
        alert(`Evento: ${event.name}\nFecha: ${event.date}`);
    };
}

function checkNotificationCompatibility() {
    if (!("Notification" in window)) {
        alert("Tu navegador no soporta notificaciones");
        return false;
    }
    return true;
}

function requestNotificationPermission() {
    if (Notification.permission !== "granted") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Permiso para notificaciones concedido");
            }
        });
    }
}

requestNotificationPermission();

function editEvent(id) {
    const eventToUpdate = events.find(event => event.id === id);
    if (!eventToUpdate) {
        return;
    }

    let newName = prompt("Ingresa el nuevo nombre del evento", eventToUpdate.name);
    if (newName === null) {
        return; // Si el usuario cancela, no hacemos nada
    }

    let newDate = prompt("Ingresa la nueva fecha del evento (formato: YYYY-MM-DD)", eventToUpdate.date);
    if (newDate === null) {
        return; // Si el usuario cancela, no hacemos nada
    }

    if (dateDiff(newDate) < 0) {
        alert("La fecha ingresada es inválida (anterior a la fecha actual)");
        return;
    }

    eventToUpdate.name = newName;
    eventToUpdate.date = newDate;

    save(JSON.stringify(events));

    renderEvents();
}

function deleteEvent(id) {
    events = events.filter(event => event.id !== id);

    save(JSON.stringify(events));

    renderEvents();
}

function save(data) {
    localStorage.setItem("items", data);
}

function load() {
    return localStorage.getItem('items');
}
