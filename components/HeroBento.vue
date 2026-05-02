<template>
  <header class="hero" id="hero">
    <div class="bento-grid">

      <!-- Carte principale - Titre -->
      <div class="bento-card bento-main" ref="cards">
        <div class="bento-card-bg"></div>
        <div class="bento-main-content">
          <span class="bento-badge">Serveur Minecraft</span>
          <h1>Create<br>France</h1>
          <p>Construisez, automatisez, explorez &mdash; ensemble.</p>
        </div>
      </div>

      <!-- Joueurs en ligne (live) -->
      <div class="bento-card bento-players" ref="cards" @click="showPlayerChart = true">
        <div class="bento-card-bg"></div>
        <div class="bento-live-dot"></div>
        <div class="bento-stat-value">{{ playersOnline }}</div>
        <div class="bento-stat-label">Joueurs en ligne</div>
        <div class="bento-stat-icon">&#9881;</div>
      </div>

      <!-- Votes (live) -->
      <a href="https://www.liste-serveurs-minecraft.org/serveur-minecraft/serveur-create-france/" target="_blank" class="bento-card bento-votes" ref="cards">
        <div class="bento-card-bg"></div>
        <svg class="bento-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-6 0v4"/><rect x="2" y="9" width="20" height="12" rx="2"/><line x1="12" y1="14" x2="12" y2="17"/></svg>
        <div class="bento-stat-value">{{ totalVotes }}</div>
        <div class="bento-stat-label">Votes total</div>
        <div class="bento-votes-details">
          <span class="bento-votes-today">{{ votesToday }} aujourd'hui</span>
          <span class="bento-votes-month">{{ votesMonth }} ce mois</span>
        </div>
      </a>

      <!-- Boutique (scroll vers grades) -->
      <a href="#grades" class="bento-card bento-shop" ref="cards">
        <div class="bento-card-bg"></div>
        <svg class="bento-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <span class="bento-card-title">Boutique</span>
        <span class="bento-card-sub">Soutenir le serveur</span>
        <span class="bento-arrow">&rarr;</span>
      </a>

      <!-- Discord -->
      <a href="https://discord.gg/JW7XQKPpVC" target="_blank" class="bento-card bento-discord" ref="cards">
        <div class="bento-card-bg"></div>
        <svg class="bento-icon-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
        <span class="bento-card-title">Discord</span>
        <span class="bento-card-sub">Rejoindre la communaute</span>
      </a>

      <!-- CurseForge + Downloads -->
      <a href="https://www.curseforge.com/minecraft/modpacks/serveur-create-france-communauty-friends-coop" target="_blank" class="bento-card bento-curseforge" ref="cards">
        <div class="bento-card-bg"></div>
        <div class="bento-stat-value">{{ curseforgeDownloads }}</div>
        <div class="bento-stat-label">Telechargements</div>
        <span class="bento-card-sub">CurseForge</span>
      </a>

      <!-- IP Serveur -->
      <div class="bento-card bento-ip" title="Cliquer pour copier" @click="copyIp" ref="cards">
        <div class="bento-card-bg"></div>
        <div class="ip-text">play.createfrance.fr</div>
        <button class="ip-copy-btn">Copier l'IP</button>
        <div class="ip-copied" :class="{ show: ipCopied }">Copie !</div>
      </div>

      <!-- Objectif mensuel -->
      <a href="#grades" class="bento-card bento-funding" ref="cards">
        <div class="bento-card-bg"></div>
        <div class="funding-header">
          <span class="funding-title">Objectif mensuel</span>
          <span class="funding-percent" :style="{ color: fundingColor }">{{ progressPercent }}%</span>
        </div>
        <div class="funding-bar">
          <div class="funding-fill" :style="{ width: barVisible ? progressPercent + '%' : '0%', background: fundingGradient }" />
        </div>
        <div class="funding-details">
          <span class="funding-amount">{{ currentFunding.toFixed(2) }}€ recoltés</span>
          <span class="funding-goal">{{ goalFunding }}€</span>
        </div>
        <span class="bento-arrow">&rarr;</span>
      </a>

    </div>

    <PlayerChart v-if="showPlayerChart" @close="showPlayerChart = false" />
  </header>
</template>

<script setup lang="ts">
const { playersOnline, votesToday, votesMonth, totalVotes } = useServerStats()
const { downloads: curseforgeDownloads } = useCurseForgeStats()

const ipCopied = ref(false)
const showPlayerChart = ref(false)

const currentFunding = 26.72
const goalFunding = 143
const progressPercent = computed(() => Math.round((currentFunding / goalFunding) * 100))
const barVisible = ref(false)

const fundingColor = computed(() => {
  const p = progressPercent.value
  if (p >= 100) return '#4ade80'
  if (p >= 50) return '#facc15'
  return '#ef4444'
})

const fundingGradient = computed(() => {
  const p = progressPercent.value
  if (p >= 100) return 'linear-gradient(90deg, #22c55e, #4ade80)'
  if (p >= 50) return 'linear-gradient(90deg, #eab308, #facc15)'
  return 'linear-gradient(90deg, #dc2626, #ef4444)'
})

function copyIp() {
  navigator.clipboard.writeText('play.createfrance.fr').then(() => {
    ipCopied.value = true
    setTimeout(() => { ipCopied.value = false }, 1500)
  })
}

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 100)
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.bento-card').forEach(c => observer.observe(c))

  const fundingEl = document.querySelector('.bento-funding')
  if (fundingEl) {
    const fundingObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => { barVisible.value = true }, 400)
        fundingObserver.disconnect()
      }
    }, { threshold: 0.3 })
    fundingObserver.observe(fundingEl)
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const href = (this as HTMLAnchorElement).getAttribute('href')
      if (href === '#') return
      e.preventDefault()
      const target = document.querySelector(href!)
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  })
})
</script>

<style scoped>
.hero {
    position: relative; z-index: 2;
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 6rem 1.5rem 3rem;
    background: url('/images/fond.png') center center / cover no-repeat fixed;
}

.hero::before {
    content: ''; position: absolute; inset: 0;
    background: rgba(28, 24, 22, 0.75);
    z-index: 0;
}

.hero > * { position: relative; z-index: 1; }

.bento-grid {
    display: grid; max-width: 900px; width: 100%; gap: 12px;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: auto auto auto;
}

/* Card base */
.bento-card {
    position: relative; border-radius: 16px; overflow: hidden;
    background: var(--glass); border: 1px solid var(--glass-border);
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    padding: 1.5rem; transition: all 0.35s ease;
    opacity: 0; transform: translateY(15px);
}

.bento-card:deep(.visible),
.bento-card.visible { opacity: 1; transform: translateY(0); }
.bento-card:hover { background: var(--bg-card-hover); border-color: rgba(212, 118, 78, 0.18); }

.bento-card-bg {
    position: absolute; inset: 0; opacity: 0; transition: opacity 0.4s ease;
    background: radial-gradient(circle at 50% 50%, rgba(212, 118, 78, 0.06), transparent 70%);
}

.bento-card:hover .bento-card-bg { opacity: 1; }

/* Carte principale */
.bento-main { grid-column: 1 / 3; grid-row: 1 / 3; padding: 2.5rem; }

.bento-main-content { position: relative; z-index: 1; }

.bento-badge {
    display: inline-block; font-size: 0.7rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 1.5px; color: var(--terre-cuite);
    background: rgba(212, 118, 78, 0.1); padding: 0.3rem 0.8rem;
    border-radius: 20px; margin-bottom: 1.2rem;
}

.bento-main h1 {
    font-family: 'Orbitron', sans-serif; font-size: clamp(2.2rem, 4.5vw, 3.5rem);
    font-weight: 900; line-height: 1.1; margin-bottom: 1rem;
    background: linear-gradient(135deg, var(--terre-cuite) 0%, var(--mandarine) 60%, var(--terre-cuite-dark) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.bento-main p { color: var(--text-secondary); font-size: 0.95rem; font-weight: 300; max-width: 300px; }

/* Cartes stats */
.bento-players { grid-column: 3 / 5; grid-row: 1; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; }
.bento-votes { grid-column: 3 / 5; grid-row: 2; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; text-decoration: none; color: inherit; }
.bento-votes:hover { border-color: rgba(212, 118, 78, 0.25); }

.bento-votes-details {
    display: flex; gap: 0.8rem; margin-top: 0.3rem; align-items: center;
}

.bento-votes-today {
    font-size: 0.72rem; color: var(--sauge); font-weight: 500;
}

.bento-votes-month {
    font-size: 0.72rem; color: var(--mandarine); font-weight: 500;
}

.bento-live-dot {
    width: 8px; height: 8px; border-radius: 50%; background: var(--sauge);
    margin-bottom: 0.5rem; animation: pulse-dot 2s ease-in-out infinite;
    box-shadow: 0 0 8px rgba(143, 174, 139, 0.5);
}

.bento-stat-value {
    font-family: 'Orbitron', sans-serif; font-size: 2rem; font-weight: 900;
    color: var(--terre-cuite);
}

.bento-stat-label { font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem; font-weight: 400; }
.bento-stat-icon { position: absolute; bottom: 8px; right: 12px; font-size: 1.5rem; color: var(--terre-cuite); opacity: 0.08; }

.bento-icon-svg { width: 28px; height: 28px; color: var(--terre-cuite-light); margin-bottom: 0.5rem; }

/* Carte boutique */
.bento-shop {
    grid-column: 1 / 2; grid-row: 3; text-decoration: none; color: inherit;
    display: flex; flex-direction: column; justify-content: center;
    cursor: pointer; border-color: rgba(212, 118, 78, 0.2);
}

.bento-shop:hover { border-color: var(--terre-cuite); background: rgba(212, 118, 78, 0.08); }
.bento-shop .bento-icon-svg { color: var(--terre-cuite); }

.bento-card-title { font-family: 'Orbitron', sans-serif; font-size: 0.9rem; font-weight: 700; color: var(--terre-cuite); margin-top: 0.3rem; }
.bento-card-sub { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.1rem; }
.bento-arrow { position: absolute; bottom: 12px; right: 14px; font-size: 1.2rem; color: var(--terre-cuite); opacity: 0.4; transition: all 0.3s; }
.bento-shop:hover .bento-arrow { opacity: 1; transform: translateX(3px); }

/* Carte Discord */
.bento-discord {
    grid-column: 2 / 3; grid-row: 3; text-decoration: none; color: inherit;
    display: flex; flex-direction: column; justify-content: center;
    border-color: rgba(88, 101, 242, 0.15);
}

.bento-discord:hover { border-color: var(--discord); background: rgba(88, 101, 242, 0.08); }
.bento-discord .bento-icon-svg { width: 28px; height: 28px; color: #7B8AF2; }

/* Carte CurseForge */
.bento-curseforge {
    grid-column: 3 / 4; grid-row: 3; text-decoration: none; color: inherit;
    display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
}

.bento-curseforge .bento-stat-value { font-size: 1.3rem; }
.bento-curseforge .bento-stat-label { font-size: 0.72rem; }

/* Carte IP */
.bento-ip {
    grid-column: 4 / 5; grid-row: 3;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    cursor: pointer; text-align: center;
}

.ip-text {
    font-family: 'Orbitron', sans-serif; font-size: 0.7rem; font-weight: 700;
    color: var(--terre-cuite); letter-spacing: 0.5px; margin-bottom: 0.5rem; word-break: break-all;
}

.ip-copy-btn {
    background: rgba(212, 118, 78, 0.1); border: 1px solid rgba(212, 118, 78, 0.25);
    color: var(--terre-cuite-light); padding: 0.3rem 0.8rem; border-radius: 6px;
    font-size: 0.7rem; font-weight: 600; cursor: pointer; transition: all 0.3s;
    font-family: 'Poppins', sans-serif;
}

.ip-copy-btn:hover { background: rgba(212, 118, 78, 0.2); }

.ip-copied {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: var(--sauge); color: #fff; padding: 0.3rem 1rem;
    border-radius: 8px; font-size: 0.8rem; font-weight: 700;
    opacity: 0; pointer-events: none; transition: opacity 0.3s;
}

.ip-copied.show { opacity: 1; }

/* Carte Objectif mensuel */
.bento-funding {
    grid-column: 1 / -1; grid-row: 4;
    padding: 1.2rem 1.5rem;
    text-decoration: none; color: inherit; cursor: pointer;
}

.bento-funding:hover { border-color: rgba(212, 118, 78, 0.25); }
.bento-funding .bento-arrow { top: 50%; bottom: auto; transform: translateY(-50%); }

.funding-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 0.6rem;
}

.funding-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.8rem; font-weight: 700; color: var(--terre-cuite);
    text-transform: uppercase; letter-spacing: 1px;
}

.funding-percent {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.9rem; font-weight: 900;
    transition: color 0.5s ease;
}

.funding-bar {
    width: 100%; height: 10px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 5px; overflow: hidden;
}

.funding-fill {
    height: 100%;
    border-radius: 5px;
    transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1), background 0.5s ease;
}

.funding-details {
    display: flex; justify-content: space-between;
    margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-secondary);
}

.funding-amount { font-weight: 500; }
.funding-goal { opacity: 0.7; }

/* ======== RESPONSIVE ======== */
@media (max-width: 900px) {
    .bento-grid { grid-template-columns: repeat(2, 1fr); }
    .bento-main { grid-column: 1 / 3; grid-row: 1; }
    .bento-players { grid-column: 1; grid-row: 2; }
    .bento-votes { grid-column: 2; grid-row: 2; }
    .bento-shop { grid-column: 1; grid-row: 3; }
    .bento-discord { grid-column: 2; grid-row: 3; }
    .bento-curseforge { grid-column: 1; grid-row: 4; }
    .bento-ip { grid-column: 2; grid-row: 4; }
    .bento-funding { grid-column: 1 / -1; grid-row: 5; }
}

@media (max-width: 480px) {
    .bento-grid { grid-template-columns: 1fr; }
    .bento-main { grid-column: 1; grid-row: 1; }
    .bento-players { grid-column: 1; grid-row: 2; }
    .bento-votes { grid-column: 1; grid-row: 3; }
    .bento-shop { grid-column: 1; grid-row: 4; }
    .bento-discord { grid-column: 1; grid-row: 5; }
    .bento-curseforge { grid-column: 1; grid-row: 6; }
    .bento-ip { grid-column: 1; grid-row: 7; }
    .bento-funding { grid-column: 1; grid-row: 8; }
    .bento-main h1 { font-size: 2rem; }
    .hero { padding-top: 5rem; }
}
</style>
