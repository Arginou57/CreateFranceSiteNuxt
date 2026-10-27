<template>
  <nav class="navbar" :class="{ scrolled }" ref="navbarRef">
    <div class="nav-content">
      <NuxtLink :to="localePath('/')" class="nav-logo">
        <span class="nav-gear">&#9881;</span>
        Create France
      </NuxtLink>
      <ul class="nav-links" :class="{ open: menuOpen }">
        <li><a :href="`${home}#serveur`" @click="menuOpen = false">{{ t('nav.server') }}</a></li>
        <li><NuxtLink :to="localePath('/wiki')" @click="menuOpen = false">{{ t('nav.wiki') }}</NuxtLink></li>
        <li><a :href="`${home}#galerie`" @click="menuOpen = false">{{ t('nav.gallery') }}</a></li>
        <li><a :href="`${home}#grades`" @click="menuOpen = false">{{ t('nav.shop') }}</a></li>
        <li><a href="https://www.curseforge.com/minecraft/modpacks/serveur-create-france-communauty-friends-coop" target="_blank">{{ t('nav.curseforge') }}</a></li>
        <li><a href="https://topmoddedservers.com/serveur/create-france/vote" target="_blank" :title="t('nav.voteTitle')">{{ t('nav.vote') }}</a></li>
        <li><a href="https://discord.gg/JW7XQKPpVC" target="_blank" class="nav-discord">{{ t('nav.discord') }}</a></li>
        <!-- language row inside the mobile menu (the flag next to the burger stays visible too) -->
        <li class="nav-lang-row">
          <a :href="switchHref" :hreflang="other" :lang="other" :aria-label="switchLabel" @click="menuOpen = false">
            <LangFlag :code="other" />
            <span>{{ t('lang.switchName') }}</span>
          </a>
        </li>
      </ul>
      <a class="nav-lang" :href="switchHref" :hreflang="other" :lang="other" :aria-label="switchLabel" :title="switchLabel">
        <LangFlag :code="other" />
        <span class="nav-lang-code">{{ t('lang.switchShort') }}</span>
      </a>
      <button class="nav-toggle" :class="{ active: menuOpen }" :aria-label="t('nav.menu')" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()

const other = computed<'fr' | 'en'>(() => (locale.value === 'en' ? 'fr' : 'en'))
// same page in the other language (a wiki page not translated yet leads to the wiki home of that language)
const switchHref = computed(() => {
  const alt = alternatesFor(route.path)
  if (alt) return alt[other.value] ?? (other.value === 'en' ? '/en/wiki' : '/wiki')
  return switchLocalePath(other.value) || localePath('/', other.value)
})
// label written in the target language (only the current locale's messages are loaded)
const switchLabel = computed(() => t('lang.switchLabel'))
const home = computed(() => (locale.value === 'en' ? '/en' : '/'))

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

.nav-links { display: flex; list-style: none; gap: 1.8rem; align-items: center; margin-left: auto; }

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

/* language switch: small inline-SVG flag (emoji flags do not render on Windows) */
.nav-lang {
    display: inline-flex; align-items: center; gap: 0.4rem; margin-left: 1.4rem;
    padding: 0.3rem 0.5rem; border-radius: 8px; text-decoration: none;
    color: var(--text-secondary); font-size: 0.72rem; font-weight: 600; letter-spacing: 0.5px;
    border: 1px solid var(--glass-border); background: rgba(255, 255, 255, 0.03);
    transition: border-color 0.3s ease, color 0.3s ease;
}
.nav-lang:hover, .nav-lang:focus-visible { color: var(--terre-cuite); border-color: rgba(212, 118, 78, 0.45); }
.nav-lang-row { display: none; }
.nav-lang-row a { display: inline-flex; align-items: center; gap: 0.6rem; }
.nav-logo, .nav-links a { white-space: nowrap; }

/* tablets / small laptops: 7 links + the flag must fit on one line */
@media (min-width: 769px) and (max-width: 1060px) {
    .navbar, .navbar.scrolled { padding-left: 1.2rem; padding-right: 1.2rem; }
    .nav-links { gap: 1rem; }
    .nav-lang { margin-left: 0.9rem; }
}

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
    .nav-lang { margin-left: auto; margin-right: 0.9rem; }
    .nav-lang-row { display: list-item; padding-top: 0.8rem; border-top: 1px solid var(--border); }
}
</style>
