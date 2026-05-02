<template>
  <footer class="footer">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-logo"><span class="footer-gear">&#9881;</span> Create France</div>
        <p>Un serveur communautaire propulse par la passion et les engrenages.</p>
      </div>
      <div class="footer-col">
        <h4>Liens</h4>
        <a href="#serveur">Le Serveur</a>
        <a href="#grades">Boutique</a>
        <a href="https://www.curseforge.com/minecraft/modpacks/serveur-create-france-communauty-friends-coop" target="_blank">CurseForge</a>
      </div>
      <div class="footer-col">
        <h4>Communaute</h4>
        <a href="https://discord.gg/JW7XQKPpVC" target="_blank">Discord</a>
        <a href="https://www.liste-serveurs-minecraft.org/serveur-minecraft/serveur-create-france/" target="_blank">Voter</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; {{ currentYear }} Create France Serveur &mdash; Non affilie a Mojang AB</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.footer {
    position: relative; z-index: 2; padding: 3rem 2rem 1.5rem;
    border-top: 1px solid var(--border); margin-top: 3rem;
    background: rgba(28, 24, 22, 0.5);
}

.footer-grid {
    max-width: 900px; margin: 0 auto;
    display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 2rem;
    padding-bottom: 2rem; border-bottom: 1px solid var(--border);
}

.footer-logo {
    font-family: 'Orbitron', sans-serif; font-size: 1rem; font-weight: 700;
    color: var(--terre-cuite); display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.6rem;
}

.footer-gear { display: inline-block; animation: spin 15s linear infinite; }
.footer-brand p { color: var(--text-muted); font-size: 0.8rem; line-height: 1.5; font-weight: 300; }

.footer-col { display: flex; flex-direction: column; gap: 0.5rem; }
.footer-col h4 { font-family: 'Orbitron', sans-serif; font-size: 0.7rem; color: var(--terre-cuite-light); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 0.3rem; }
.footer-col a { color: var(--text-secondary); text-decoration: none; font-size: 0.8rem; transition: color 0.3s; font-weight: 300; }
.footer-col a:hover { color: var(--terre-cuite); }

.footer-bottom { max-width: 900px; margin: 1rem auto 0; text-align: center; }
.footer-bottom p { color: var(--text-muted); font-size: 0.72rem; font-weight: 300; }

@media (max-width: 900px) {
    .footer-grid { grid-template-columns: 1fr; text-align: center; }
    .footer-logo { justify-content: center; }
}
</style>
