/* ==========================================================================
   HUD.JS — Pestañas, selector de día e "hidratación" de la barra inferior
   Regla anti fuga de memoria: cada escuchador se registra UNA sola vez
   (guardia data-hidratado) y no se crean temporizadores sin limpiar.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* 1. HIDRATACIÓN: la barra inferior llega como HTML estático (data-hidratado="false")
          y aquí se marca como lista. Si el código corriera dos veces, la guardia lo evita. */
    const nav = document.getElementById('navMenu');
    if (nav && nav.dataset.hidratado !== 'true') {
        nav.dataset.hidratado = 'true';
    }

    /* 2. PESTAÑAS (Perfil y Contacto): un solo escuchador por grupo de pestañas */
    document.querySelectorAll('.hud-tabs[data-tabs]').forEach((tabs) => {
        if (tabs.dataset.hidratado === 'true') { return; }     // guardia: no duplicar eventos
        tabs.dataset.hidratado = 'true';

        const scope = tabs.parentElement;                       // la pantalla que contiene los paneles
        tabs.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-tab]');
            if (!btn) { return; }
            tabs.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
            scope.querySelectorAll('[data-pane]').forEach((p) => {
                p.classList.toggle('is-shown', p.dataset.pane === btn.dataset.tab);
            });
        });
    });

    /* 3. HORARIO: muestra la hora y un solo día. Por defecto, el día de hoy */
    const table = document.querySelector('.timetable');
    const dayTabs = document.querySelector('.day-tabs');
    if (table && dayTabs && dayTabs.dataset.hidratado !== 'true') {
        dayTabs.dataset.hidratado = 'true';

        const setDay = (n) => {
            table.dataset.day = n;
            dayTabs.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.day === String(n)));
        };
        dayTabs.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-day]');
            if (btn) { setDay(btn.dataset.day); }
        });
        setDay(new Date().getDay() || 7);                       // domingo (0) pasa a 7
    }
    /* 4. INDICADOR DE RED (Offline-First): muestra si hay conexión o se trabaja con datos locales */
    const net = document.getElementById('estadoRed');
    if (net && net.dataset.hidratado !== 'true') {
        net.dataset.hidratado = 'true';
        const actualizarEstadoRed = () => {
            const enLinea = navigator.onLine;
            net.textContent = enLinea ? 'En línea' : 'Sin conexión';
            net.classList.toggle('is-offline', !enLinea);
        };
        window.addEventListener('online', actualizarEstadoRed);    // un solo escuchador por evento
        window.addEventListener('offline', actualizarEstadoRed);
        actualizarEstadoRed();                                      // estado inicial
    }
});