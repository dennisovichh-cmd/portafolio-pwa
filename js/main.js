/* ==========================================================================
   LOGIC: GLOBAL PORTFOLIO ORCHESTRATOR & INTERACTIVE TIMETABLE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. EFECTO HOVER EN LA TABLA HORARIA (delegación de eventos por burbujeo)
          UN solo par de escuchadores en la tabla, en vez de uno por cada celda.
       ========================================================================== */
    const tabla = document.querySelector('.timetable');
    if (tabla) {
        const marcarFila = (e, activo) => {
            const celda = e.target.closest('td:not(.time-slot)');
            if (celda) { celda.parentElement.classList.toggle('fila-activa', activo); }
        };
        tabla.addEventListener('mouseover', (e) => marcarFila(e, true));
        tabla.addEventListener('mouseout',  (e) => marcarFila(e, false));
    }

    /* ==========================================================================
       2. REPRODUCTOR DE AUDIO AMBIENTAL GLOBAL
       ========================================================================== */
    const globalAudioBtn = document.getElementById('globalAudioBtn');
    const globalAudioSource = document.getElementById('globalAudioSource');
    let isMuted = true;

    globalAudioBtn.addEventListener('click', () => {
        if (isMuted) {
            globalAudioSource.play()
                .then(() => {
                    isMuted = false;
                    globalAudioBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                    globalAudioBtn.style.color = 'var(--accent-red)';
                })
                .catch(error => {
                    console.log("Interacción requerida por el navegador antes de reproducir audio:", error);
                });
        } else {
            globalAudioSource.pause();
            isMuted = true;
            globalAudioBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            globalAudioBtn.style.color = '';
        }
    });

    /* ==========================================================================
       3. SISTEMA DE PANTALLAS (una sola pantalla visible, sin scroll)
       ========================================================================== */
    const screens   = document.querySelectorAll('.screen');
    const navLinks  = document.querySelectorAll('.nav-link');
    const navMenu   = document.getElementById('navMenu');
    const hamburger = document.getElementById('hamburgerMenu');

    function showScreen(id) {
        const target = document.getElementById(id);
        if (!target || !target.classList.contains('screen')) { return; }

        screens.forEach((s) => s.classList.toggle('is-active', s === target));
        navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + id));

        navMenu.classList.remove('open');
        hamburger.classList.remove('open');

        history.replaceState(null, '', '#' + id);
        try { localStorage.setItem('pwa_ultima_pantalla', id); } catch (e) {}   // recordar la última pantalla
    }

    // Delegación de eventos: UN solo escuchador en document atiende todos los enlaces "#algo"
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) { return; }
        const id = link.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target && target.classList.contains('screen')) {
            e.preventDefault();
            showScreen(id);
        }
    });

    // Pantalla inicial: la del hash de la URL; si no hay, la última guardada; si no, el hero
    let guardada = '';
    try { guardada = localStorage.getItem('pwa_ultima_pantalla') || ''; } catch (e) {}
    const startId = location.hash.slice(1) || guardada;
    const startEl = document.getElementById(startId);
    showScreen(startEl && startEl.classList.contains('screen') ? startId : 'hero');

    /* ==========================================================================
       4. FILTRO DE 3 CAPAS (Capa 1 área -> Capa 2 módulo -> Capa 3 elemento)
       ========================================================================== */
    const FILTER_DATA = {
        academico: {
            web2:      { name: 'Diseño Web II (SIS-0141)', desc: 'Materia donde se desarrolla este portafolio: HTML, CSS, JavaScript y PWA.' },
            pantallas: { name: 'Proyecto de una sola pantalla', desc: 'Interfaz sin scroll, con una pantalla completa por cada opción del menú.' }
        },
        desarrollo: {
            pwa:   { name: 'Arquitectura PWA', desc: 'Manifest, service worker y caché para instalar la web y usarla sin conexión.' },
            music: { name: 'Music Hub', desc: 'Reproductor con filtro por géneros musicales dentro del portafolio.' }
        }
    };

    const capa1 = document.getElementById('capa1');
    const capa2 = document.getElementById('capa2');
    const resultado = document.getElementById('resultadoFiltro');

    function resetResultado() {
        resultado.classList.remove('has-result');
        resultado.textContent = 'Seleccione las capas anteriores...';
    }

    capa1.addEventListener('change', () => {
        const area = FILTER_DATA[capa1.value];
        capa2.innerHTML = '<option value="">-- Seleccione módulo --</option>';
        resetResultado();
        if (!area) {
            capa2.innerHTML = '<option value="">-- Primero elija el área --</option>';
            capa2.disabled = true;
            return;
        }
        Object.keys(area).forEach((key) => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = area[key].name;
            capa2.appendChild(opt);
        });
        capa2.disabled = false;
    });

    capa2.addEventListener('change', () => {
        const item = capa2.value && FILTER_DATA[capa1.value][capa2.value];
        if (!item) { resetResultado(); return; }
        resultado.classList.remove('has-result');
        void resultado.offsetWidth;
        resultado.classList.add('has-result');
        resultado.innerHTML = '<strong></strong><span></span>';
        resultado.querySelector('strong').textContent = item.name;
        resultado.querySelector('span').textContent = item.desc;
    });

    /* ==========================================================================
       5. FORMULARIO DE CONTACTO: validación en tiempo real + COLA OFFLINE
          (Offline-First: pilares 2 y 3 -> cola de sincronización + UI optimista)
       ========================================================================== */
    const form = document.getElementById('contactForm');
    const successAlert = document.getElementById('successAlert');
    const colaEstado = document.getElementById('colaEstado');
    const fields = [
        { input: document.getElementById('nombre'),  error: document.getElementById('errNombre'),
          test: (v) => v.length >= 3 },
        { input: document.getElementById('correo'),  error: document.getElementById('errCorreo'),
          test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
        { input: document.getElementById('mensaje'), error: document.getElementById('errMensaje'),
          test: (v) => v.length >= 10 }
    ];

    function validateField(f) {
        const ok = f.test(f.input.value.trim());
        f.input.classList.toggle('is-invalid', !ok);
        f.input.classList.toggle('is-valid', ok);
        f.error.classList.toggle('is-visible', !ok);
        return ok;
    }

    // Tiempo real: valida mientras se escribe (un escuchador por campo)
    fields.forEach((f) => f.input.addEventListener('input', () => validateField(f)));

    /* ---- Cola local en localStorage (la fuente de verdad está en el dispositivo) ---- */
    const COLA_KEY = 'pwa_cola_mensajes';
    let avisoTimer = null;
    let sincronizando = false;

    function leerCola() {
        try { return JSON.parse(localStorage.getItem(COLA_KEY)) || []; } catch (e) { return []; }
    }
    function guardarCola(cola) {
        try { localStorage.setItem(COLA_KEY, JSON.stringify(cola)); } catch (e) { /* almacenamiento bloqueado */ }
    }

    // Muestra cuántos mensajes esperan conexión (persiste aunque se cierre la app)
    function pintarCola() {
        const n = leerCola().length;
        colaEstado.textContent = n ? '📤 ' + n + (n === 1 ? ' mensaje pendiente' : ' mensajes pendientes') + ' de envío' : '';
        colaEstado.classList.toggle('is-visible', n > 0);
    }

    // Aviso temporal (UI optimista): responde al instante, con o sin red
    function avisar(texto, pendiente) {
        clearTimeout(avisoTimer);                          // evita temporizadores acumulados
        successAlert.textContent = texto;
        successAlert.classList.toggle('is-pending', pendiente);
        successAlert.classList.add('is-visible');
        avisoTimer = setTimeout(() => successAlert.classList.remove('is-visible'), 4000);
    }

    // Sincronización: al volver la red, "envía" lo pendiente.
    // No hay servidor real: aquí iría fetch('/api/contacto', ...). Se simula con una espera corta.
    function sincronizarCola() {
        const pendientes = leerCola();
        if (!pendientes.length || !navigator.onLine || sincronizando) { return; }
        sincronizando = true;
        const ids = pendientes.map((m) => m.id);

        setTimeout(() => {
            sincronizando = false;
            if (!navigator.onLine) { return; }             // si la red se cayó otra vez, se queda en cola
            guardarCola(leerCola().filter((m) => !ids.includes(m.id)));
            pintarCola();
            avisar('✔ ' + ids.length + (ids.length === 1 ? ' mensaje pendiente enviado' : ' mensajes pendientes enviados'), false);
        }, 900);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const allValid = fields.map(validateField).every(Boolean);
        if (!allValid) { return; }

        if (navigator.onLine) {
            avisar('✔ ¡Mensaje enviado correctamente!', false);          // envío inmediato (simulado)
        } else {
            const cola = leerCola();
            cola.push({
                id: Date.now(),
                nombre: fields[0].input.value.trim(),
                correo: fields[1].input.value.trim(),
                mensaje: fields[2].input.value.trim(),
                fecha: new Date().toISOString()
            });
            guardarCola(cola);
            pintarCola();
            avisar('💾 Guardado localmente — Pendiente de envío', true);
        }

        form.reset();
        fields.forEach((f) => f.input.classList.remove('is-valid', 'is-invalid'));
    });

    window.addEventListener('online', sincronizarCola);    // un solo escuchador
    pintarCola();                                          // al abrir la app, muestra lo que quedó pendiente
    sincronizarCola();                                     // y si ya hay red, lo envía

}); // <-- aquí cierra DOMContentLoaded

// Registro del Service Worker (PWA) — queda AFUERA de DOMContentLoaded
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./service-worker.js")
      .then(function () { console.log("Service Worker registrado"); })
      .catch(function (err) { console.error("Error al registrar SW:", err); });
  });
}