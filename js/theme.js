/* ==========================================================================
   LOGIC: HEADER RESPONSIVE & DARK/LIGHT MODE MANIPULATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Selectores del DOM
    const themeToggle = document.getElementById('themeToggle');
    const mainHeader = document.querySelector('.main-header');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const htmlElement = document.documentElement;

    /* ==========================================================================
       1. CONTROL DE MODO NOCHE / MODO DÍA
       ========================================================================== */
    // Verificar si hay una preferencia guardada en el almacenamiento local
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Evento de clic para alternar el modo
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Manipulación del atributo raíz del DOM
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'light') {
            icon.className = 'fas fa-sun';
            icon.style.color = '#FFB300'; // Color cálido para el sol en modo claro
        } else {
            icon.className = 'fas fa-moon';
            icon.style.color = ''; // Color por defecto heredado
        }
    }

    /* ==========================================================================
       2. EFECTO SCROLL EN EL HEADER
       ========================================================================== */
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    });

    /* ==========================================================================
       3. MENÚ HAMBURGUESA RESPONSIVO (MÓVIL)
       ========================================================================== */
    hamburgerMenu.addEventListener('click', () => {
        hamburgerMenu.classList.toggle('open');
        navMenu.classList.toggle('open');
    });

    // Cerrar el menú automáticamente al hacer clic en cualquier enlace
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburgerMenu.classList.remove('open');
            navMenu.classList.remove('open');
            
            // Actualizar la clase activa visualmente
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
});
