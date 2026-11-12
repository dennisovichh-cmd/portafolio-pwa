/* ==========================================================================
   LOGIC: MUSIC HUB — lista dinámica, filtro por género y reproductor
   - Las 9 canciones y los géneros coinciden con los botones del HTML.
   - Delegación de eventos: UN escuchador para la lista y UNO para los filtros.
   - Sin imágenes externas: la portada se dibuja en SVG según el género.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Base de datos local de canciones (genre = data-genre de los botones; "pop" solo sale en "Todos")
    const songsData = [
        { id: 1, title: "Prendía",               artist: "Yan Block",        genre: "urbano",   duration: "3:12" },
        { id: 2, title: "Gata Only",             artist: "Cris Mj",          genre: "urbano",   duration: "3:42" },
        { id: 3, title: "Llamado de Emergencia", artist: "Daddy Yankee",     genre: "urbano",   duration: "3:59" },
        { id: 4, title: "Adrenaline Rush",       artist: "Rave Core",        genre: "techno",   duration: "5:14" },
        { id: 5, title: "Master of Puppets",     artist: "Metallica",        genre: "rock",     duration: "8:35" },
        { id: 6, title: "Llorando se fue",       artist: "Los Kjarkas",      genre: "folclore", duration: "4:23" },
        { id: 7, title: "Propuesta Indecente",   artist: "Romeo Santos",     genre: "folclore", duration: "4:15" },
        { id: 8, title: "Billie Jean",           artist: "Michael Jackson",  genre: "pop",      duration: "4:54" },
        { id: 9, title: "Chop Suey!",            artist: "System of a Down", genre: "rock",     duration: "3:30" }
    ];

    // Color de portada por género
    const GENRE_COLORS = { urbano: "#E50914", techno: "#0a7a9e", rock: "#b8860b", folclore: "#2e8b57", pop: "#6a4bb5" };

    // Portada en SVG (no necesita archivos ni internet)
    function makeArt(genre) {
        const c = GENRE_COLORS[genre] || "#E50914";
        const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' fill='#2f2f2f'/>" +
                    "<circle cx='100' cy='100' r='60' fill='" + c + "'/><circle cx='100' cy='100' r='14' fill='#141414'/></svg>";
        return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
    }

    // Nodos del DOM
    const playlistContainer = document.getElementById('playlistTracks');
    const filterContainer = document.querySelector('.filter-container');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const playerDisplay = document.getElementById('playerDisplay');
    const playerBlurBg = document.getElementById('playerBlurBg');
    const playerAlbumArt = document.getElementById('playerAlbumArt');
    const playerTrackTitle = document.getElementById('playerTrackTitle');
    const playerTrackArtist = document.getElementById('playerTrackArtist');
    const playerSpotify = document.getElementById('playerSpotifyLink');
    const playTrigger = document.getElementById('trackPlayTrigger');
    const trackPrev = document.getElementById('trackPrev');
    const trackNext = document.getElementById('trackNext');

    let currentFilteredSongs = [...songsData];
    let selectedSongIndex = 0;
    let isPlaying = false;

    // 1. Renderizar la lista (los textos se escriben con textContent, no con innerHTML)
    function renderPlaylist(songs) {
        playlistContainer.innerHTML = '';

        if (songs.length === 0) {
            const vacio = document.createElement('p');
            vacio.style.cssText = 'padding:15px; color:var(--text-muted)';
            vacio.textContent = 'No hay pistas disponibles.';
            playlistContainer.appendChild(vacio);
            return;
        }

        songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.className = 'track-item' + (index === selectedSongIndex ? ' active' : '');
            li.dataset.index = index;

            const info = document.createElement('div');
            info.className = 'track-info';
            const titulo = document.createElement('h4');
            titulo.className = 'track-title';
            titulo.textContent = song.title;
            const artista = document.createElement('p');
            artista.className = 'track-artist';
            artista.textContent = song.artist;
            info.append(titulo, artista);

            const duracion = document.createElement('span');
            duracion.className = 'track-duration';
            duracion.textContent = song.duration;

            li.append(info, duracion);
            playlistContainer.appendChild(li);
        });
    }

    // 2. Cargar la canción en el reproductor
    function loadSong(song) {
        if (!song) {
            playerTrackTitle.textContent = 'Sin pistas';
            playerTrackArtist.textContent = 'Género / Artista';
            return;
        }
        const color = GENRE_COLORS[song.genre] || "#E50914";
        playerTrackTitle.textContent = song.title;
        playerTrackArtist.textContent = song.artist + ' • ' + song.genre.toUpperCase();
        playerAlbumArt.src = makeArt(song.genre);
        playerBlurBg.style.backgroundImage = 'linear-gradient(135deg, ' + color + ', #000)';
        if (playerSpotify) {
            playerSpotify.href = 'https://open.spotify.com/search/' + encodeURIComponent(song.title + ' ' + song.artist);
        }
    }

    // 3. Marcar la canción activa
    function updateActiveTrackClass() {
        playlistContainer.querySelectorAll('.track-item').forEach((item, idx) => {
            item.classList.toggle('active', idx === selectedSongIndex);
        });
    }

    // 4. Delegación: UN escuchador en la lista atiende el clic de cualquier canción
    playlistContainer.addEventListener('click', (e) => {
        const item = e.target.closest('.track-item');
        if (!item) { return; }
        selectedSongIndex = Number(item.dataset.index);
        loadSong(currentFilteredSongs[selectedSongIndex]);
        updateActiveTrackClass();
    });

    // 5. Delegación: UN escuchador para los 5 botones de género
    filterContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.filter-btn');
        if (!button) { return; }

        filterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
        const selectedGenre = button.getAttribute('data-genre');
        currentFilteredSongs = selectedGenre === 'all'
            ? [...songsData]
            : songsData.filter((song) => song.genre === selectedGenre);

        selectedSongIndex = 0;
        renderPlaylist(currentFilteredSongs);
        loadSong(currentFilteredSongs[selectedSongIndex]);
        setPlayingState(false);
    });

    // 6. Controles simulados (play, siguiente, anterior)
    function setPlayingState(state) {
        isPlaying = state;
        playerDisplay.classList.toggle('playing', isPlaying);
        playTrigger.innerHTML = isPlaying ? '<i class="fas fa-pause-circle"></i>' : '<i class="fas fa-play-circle"></i>';
    }

    playTrigger.addEventListener('click', () => {
        if (currentFilteredSongs.length === 0) { return; }
        setPlayingState(!isPlaying);
    });

    trackNext.addEventListener('click', () => {
        if (currentFilteredSongs.length === 0) { return; }
        selectedSongIndex = (selectedSongIndex + 1) % currentFilteredSongs.length;
        loadSong(currentFilteredSongs[selectedSongIndex]);
        updateActiveTrackClass();
        setPlayingState(true);
    });

    trackPrev.addEventListener('click', () => {
        if (currentFilteredSongs.length === 0) { return; }
        selectedSongIndex = (selectedSongIndex - 1 + currentFilteredSongs.length) % currentFilteredSongs.length;
        loadSong(currentFilteredSongs[selectedSongIndex]);
        updateActiveTrackClass();
        setPlayingState(true);
    });

    // Inicialización
    renderPlaylist(currentFilteredSongs);
    loadSong(currentFilteredSongs[selectedSongIndex]);
});