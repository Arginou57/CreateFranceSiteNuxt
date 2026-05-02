<template>
  <nav class="navbar" :class="{ scrolled }" ref="navbarRef">
    <div class="nav-content">
      <a href="#" class="nav-logo">
        <span class="nav-gear">&#9881;</span>
        Create France
      </a>
      <button class="nav-toggle" :class="{ active: menuOpen }" aria-label="Menu" @click="menuOpen = !menuOpen">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav-links" :class="{ open: menuOpen }">
        <li><a href="#serveur" @click="menuOpen = false">Le Serveur</a></li>
        <li><a href="#grades" @click="menuOpen = false">Boutique</a></li>
        <li><a href="https://www.curseforge.com/minecraft/modpacks/serveur-create-france-communauty-friends-coop" target="_blank">CurseForge</a></li>
        <li><a href="https://discord.gg/JW7XQKPpVC" target="_blank" class="nav-discord">Discord</a></li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
const scrolled = ref(false)
const menuOpen = ref(false)

const onScroll = () => {
  scrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.navbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    padding: 1rem 2rem; transition: all 0.4s ease; background: transparent;
}

.navbar.scrolled {
    background: rgba(28, 24, 22, 0.92);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    padding: 0.6rem 2rem;
    border-bottom: 1px solid var(--border);
}

.nav-content { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }

.nav-logo {
    font-family: 'Orbitron', sans-serif; font-weight: 700; font-size: 1.05rem;
    color: var(--terre-cuite); text-decoration: none; display: flex; align-items: center; gap: 0.5rem;
}

.nav-gear { display: inline-block; animation: spin 6s linear infinite; font-size: 1.2rem; }

.nav-links { display: flex; list-style: none; gap: 1.8rem; align-items: center; }

.nav-links a {
    color: var(--text-secondary); text-decoration: none; font-size: 0.82rem;
    font-weight: 500; letter-spacing: 0.3px; transition: color 0.3s ease;
}

.nav-links a:hover { color: var(--terre-cuite); }

.nav-discord {
    background: var(--discord); color: #fff !important;
    padding: 0.4rem 1rem; border-radius: 8px; font-weight: 600;
}

.nav-discord:hover { background: #4752c4; }

.nav-toggle { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 5px; }
.nav-toggle span { width: 22px; height: 2px; background: var(--terre-cuite); transition: all 0.3s ease; border-radius: 2px; display: block; }
.nav-toggle.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
.nav-toggle.active span:nth-child(2) { opacity: 0; }
.nav-toggle.active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

@media (max-width: 768px) {
    .nav-toggle { display: flex; }
    .nav-links {
        display: none; position: absolute; top: 100%; left: 0; right: 0;
        background: rgba(28, 24, 22, 0.97); backdrop-filter: blur(16px);
        flex-direction: column; padding: 1.5rem 2rem; gap: 1rem;
        border-bottom: 1px solid var(--border);
    }
    .nav-links.open { display: flex; }
}
</style>
