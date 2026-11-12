/* CARRUSEL DEL INICIO — slides inyectados dinámicamente (rutas en assets/img/) */
const track = document.getElementById('carouselTrack');
const indicatorsContainer = document.getElementById('carouselIndicators');
const prevBtn = document.getElementById('carouselPrev');
const nextBtn = document.getElementById('carouselNext');





const slideData = [
    {
         title: "ARQUITECTURA DE SOFTWARE & RENDIMIENTO",
        anecdote: '"Transformar código en soluciones eficientes. Arquitecturas estables, escalables y preparadas para el procesamiento de datos a gran escala."',
        image: "assets/img/1.jpg"
    },
    {
        title: "DISCIPLINA Y LÓGICA ALGORÍTMICA",
        anecdote: '"Paciencia y lógica aplicadas a la infraestructura. Algoritmos óptimos diseñados para minimizar costes y acelerar la respuesta en redes a gran escala."',
        image: "assets/img/2.jpg"
    },
    {
         title: "INNOVACIÓN EN SISTEMAS INTELIGENTES",
        anecdote: '"Dominio de sistemas distribuidos y alta disponibilidad. Patrones de diseño avanzados estructurados para crear plataformas robustas y tolerantes a fallos."',
        image: "assets/img/3.jpg"
    },
     {
        title: "INGENIERÍA DE SISTEMAS CRÍTICOS",
        anecdote: '"Infraestructuras corporativas estables y resilientes. Control riguroso de sistemas informáticos enfocado en la continuidad de servicios esenciales."',
        image: "assets/img/4.jpg"
    },
    {
        title: "PROCESAMIENTO DE DATOS EN TIEMPO REAL",
        anecdote: '"Analítica en tiempo real y gestión masiva de datos. Infraestructuras inteligentes destinadas al control de redes y la toma de decisiones empresariales estratégicas."',
        image: "assets/img/5.jpg"
    },
     {
        title: "AUTOMATIZACIÓN E INFRAESTRUCTURA SMART",
        anecdote: '"Automatización lógica y sistemas de control inteligentes. El núcleo de la ingeniería moderna orientado a potenciar de manera crítica el rendimiento industrial."',
        image: "assets/img/6.jpg"
    }
];





let currentIndex = 0;
let carouselInterval;



function initCarousel() {
    if (!track) return;
    track.innerHTML = ''; 
    if (indicatorsContainer) indicatorsContainer.innerHTML = '';

    slideData.forEach((slide, index) => {
        // Crear elemento Slide
        const slideElement = document.createElement('div');
        slideElement.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
        
        // Inyectamos la imagen directamente por código de ejecución nativo
        slideElement.style.backgroundImage = `linear-gradient(to top, #141414 5%, rgba(20,20,20,0.1) 70%), url('${slide.image}')`;
        slideElement.style.backgroundColor = '#141414';
        
        // Forzado explícito de visibilidad directa para romper bloqueos del CSS
        if (index === 0) {
            slideElement.style.opacity = '1';
            slideElement.style.visibility = 'visible';
            slideElement.style.zIndex = '2';
        } else {
            slideElement.style.opacity = '0';
            slideElement.style.visibility = 'hidden';
            slideElement.style.zIndex = '1';
        }
        
        slideElement.innerHTML = `
            <div class="hero-content">
                <h1 class="hero-title">${slide.title}</h1>
                <p class="hero-anecdote">${slide.anecdote}</p>
                <div class="hero-buttons">
                    <a href="#profile" class="btn btn-primary"><i class="fas fa-play"></i> Explorar Perfil</a>
                    <a href="#contact" class="btn btn-secondary"><i class="fas fa-info-circle"></i> Más Info</a>
                </div>
            </div>
        `;
        track.appendChild(slideElement);

        // Crear Indicadores Inferiores
        if (indicatorsContainer) {
            const indicator = document.createElement('button');
            indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
            indicator.setAttribute('aria-label', `Ir al slide ${index + 1}`);
            indicator.addEventListener('click', () => goToSlide(index));
            indicatorsContainer.appendChild(indicator);
        }
    });

    startAutoCycle();
}

// 2. Función de transición con control explícito de opacidades por DOM
function goToSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');

    if (slides.length === 0) return;

    // Ocultar el slide actual
    slides[currentIndex].classList.remove('active');
    slides[currentIndex].style.opacity = '0';
    slides[currentIndex].style.visibility = 'hidden';
    slides[currentIndex].style.zIndex = '1';
    
    if (indicators.length > 0) indicators[currentIndex].classList.remove('active');

    // Actualizar índice aplicando ciclo infinito algebraico
    currentIndex = (index + slideData.length) % slideData.length;

    // Mostrar el nuevo slide activo
    slides[currentIndex].classList.add('active');
    slides[currentIndex].style.opacity = '1';
    slides[currentIndex].style.visibility = 'visible';
    slides[currentIndex].style.zIndex = '2';
    
    if (indicators.length > 0) indicators[currentIndex].classList.add('active');

    resetAutoCycle();
}

// 3. Funciones de Ciclo Automático y Eventos
function startAutoCycle() {
    clearInterval(carouselInterval);                       // nunca dos temporizadores a la vez
    carouselInterval = setInterval(() => {
        goToSlide(currentIndex + 1);
    }, 6000);
}

function resetAutoCycle() {
    clearInterval(carouselInterval);
    startAutoCycle();
}

// Escuchadores de eventos para los botones de control
if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));

// Lanzar inicializador de inmediato al leer el archivo
initCarousel();