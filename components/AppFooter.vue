<template>
  <footer class="footer">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-logo"><span class="footer-gear">&#9881;</span> Create France</div>
        <p>{{ t('footer.tagline') }}</p>
        <a
          href="https://topmoddedservers.com/serveur/create-france/vote"
          target="_blank"
          class="footer-badge"
          :title="t('footer.badgeTitle')"
        >
          <img
            src="https://topmoddedservers.com/badge/create-france.svg"
            :alt="t('footer.badgeAlt')"
            width="330"
            height="64"
            loading="lazy"
          >
        </a>
      </div>
      <div class="footer-col">
        <h4>{{ t('footer.links') }}</h4>
        <a :href="`${home}#serveur`">{{ t('footer.server') }}</a>
        <NuxtLink :to="localePath('/wiki')">{{ t('footer.wiki') }}</NuxtLink>
        <a :href="`${home}#grades`">{{ t('footer.shop') }}</a>
        <a href="https://www.curseforge.com/minecraft/modpacks/serveur-create-france-communauty-friends-coop" target="_blank">CurseForge</a>
      </div>
      <div class="footer-col">
        <h4>{{ t('footer.community') }}</h4>
        <a href="https://discord.gg/JW7XQKPpVC" target="_blank">Discord</a>
        <a href="https://topmoddedservers.com/serveur/create-france/vote" target="_blank">{{ t('footer.vote') }}</a>
        <a href="https://topmoddedservers.com/serveurs/create" target="_blank">{{ t('footer.ranking') }}</a>
        <a href="https://www.liste-serveurs-minecraft.org/serveur-minecraft/serveur-create-france/" target="_blank">liste-serveurs.org</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>{{ t('footer.rights', { year: currentYear }) }}</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const home = computed(() => (locale.value === 'en' ? '/en' : '/'))
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

.footer-badge { display: inline-block; margin-top: 0.9rem; }
.footer-badge img { max-width: 100%; height: auto; border-radius: 10px; transition: transform 0.3s; }
.footer-badge:hover img { transform: translateY(-2px); }

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
