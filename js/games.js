document.addEventListener('DOMContentLoaded', () => {
    const games = [
        { title: "League of Legends", category: "Estrategia / MOBA", icon: "fa-shield-halved", color: "#1e6bd6" },
        { title: "Elden Ring", category: "Acción / RPG", icon: "fa-ring", color: "#b8860b" },
        { title: "Valorant", category: "Shooter / Táctico", icon: "fa-crosshairs", color: "#E50914" },
        { title: "Minecraft", category: "Sandbox / Supervivencia", icon: "fa-cube", color: "#2e8b3d" },
        { title: "Cyberpunk 2077", category: "Acción / RPG", icon: "fa-microchip", color: "#d4c400" },
        { title: "Chess.com", category: "Estrategia / Tablero", icon: "fa-chess-knight", color: "#5a8f29" }
    ];
    const grid = document.getElementById('games-grid');
    const search = document.getElementById('game-search');
    if (!grid) { return; }
    grid.innerHTML = games.map((g) =>
        `<div class="game-card" data-search-key="${(g.title + ' ' + g.category).toLowerCase()}">
            <div class="game-cover" style="--game-color:${g.color}"><i class="fa-solid ${g.icon}"></i></div>
            <div class="game-details"><h4>${g.title}</h4><span class="game-category">${g.category}</span></div>
        </div>`).join('');
    if (search) {
        search.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            grid.querySelectorAll('.game-card').forEach((c) => c.classList.toggle('hidden', !c.dataset.searchKey.includes(q)));
        });
    }
});