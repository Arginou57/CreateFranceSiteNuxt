<template>
  <div class="floating-buttons">
    <a href="https://www.curseforge.com/minecraft/modpacks/serveur-create-france-communauty-friends-coop" target="_blank" class="curseforge-float" title="CurseForge">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M6.307 5.581l.391 1.675H0s.112.502.167.558c.168.279.335.614.559.837 1.06 1.228 2.902 1.73 4.409 2.009 1.06.224 2.121.28 3.181.335l1.228 3.293h.67l.391 1.061h-.558l-.949 3.07h9.321l-.949-3.07h-.558l.39-1.061h.67s.558-3.404 2.288-4.967C21.935 7.758 24 7.535 24 7.535V5.581H6.307zm9.377 8.428c-.447.279-.949.279-1.284.503-.223.111-.335.446-.335.446-.223-.502-.502-.67-.837-.781-.335-.112-.949-.056-1.786-.782-.558-.502-.614-1.172-.558-1.507v-.167c0-.056 0-.112.056-.168.111-.334.39-.669.948-.893 0 0-.39.559 0 1.117.224.335.67.502 1.061.279.167-.112.279-.335.335-.503.111-.39.111-.781-.224-1.06-.502-.446-.613-1.06-.279-1.451 0 0 .112.502.614.446.335 0 .335-.111.224-.223-.056-.167-.782-1.228.279-2.009 0 0 .669-.447 1.451-.391-.447.056-.949.335-1.116.782v.055c-.168.447-.056.949.279 1.396.223.335.502.614.614 1.06-.168-.056-.279 0-.391.112a.533.533 0 00-.112.502c.056.112.168.223.279.223h.168c.167-.055.279-.279.223-.446.112.111.167.391.112.558 0 .167-.112.335-.168.446-.056.112-.167.224-.223.335-.056.112-.112.224-.112.335 0 .112 0 .279.056.391.223.335.67 0 .782-.279.167-.335.111-.726-.112-1.061 0 0 .391.224.67 1.005.223.67-.168 1.451-.614 1.73z"/></svg>
    </a>
    <a href="https://discord.gg/6GYtAuW2ns" target="_blank" class="discord-float" title="Rejoindre le Discord">
      <svg viewBox="0 0 24 24" width="26" height="26" fill="white"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
    </a>
  </div>
</template>

<style scoped>
.floating-buttons {
    position: fixed; bottom: 2rem; right: 2rem; z-index: 99;
    display: flex; flex-direction: column; gap: 0.75rem; align-items: center;
}

.discord-float {
    width: 52px; height: 52px; background: var(--discord); border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 15px rgba(88, 101, 242, 0.3); transition: all 0.3s ease;
    animation: discord-pulse 3s ease-in-out infinite;
}
.discord-float:hover { transform: scale(1.1); box-shadow: 0 6px 25px rgba(88, 101, 242, 0.45); }

.curseforge-float {
    width: 52px; height: 52px; background: #F16436; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 15px rgba(241, 100, 54, 0.3); transition: all 0.3s ease;
    animation: curseforge-pulse 3s ease-in-out infinite;
}
.curseforge-float:hover { transform: scale(1.1); box-shadow: 0 6px 25px rgba(241, 100, 54, 0.45); }

@media (max-width: 768px) {
    .floating-buttons { bottom: 1.2rem; right: 1.2rem; gap: 0.6rem; }
    .discord-float, .curseforge-float { width: 46px; height: 46px; border-radius: 12px; }
}
</style>
