<template>
  <section id="faq" class="faq-section">
    <h2 class="section-title">Serveur Minecraft Create français</h2>
    <p class="faq-intro">
      Create France est un <strong>serveur Minecraft français moddé</strong> autour du mod <strong>Create</strong>
      (Create 6, Minecraft 1.21.1 sous NeoForge). On y construit des usines automatisées, des réseaux de
      <strong>trains</strong>, des machines de minage et des engins volants avec Create Aeronautics, seul ou en équipe,
      sur une carte partagée avec toute la communauté.
    </p>

    <div class="faq-list">
      <details v-for="(item, i) in faq" :key="item.q" class="faq-item" :open="i === 0">
        <summary>{{ item.q }}</summary>
        <p v-html="item.a" />
      </details>
    </div>
  </section>
</template>

<script setup lang="ts">
// Same questions as the FAQPage structured data (useFaqSchema below), so what Google reads matches the page.
const faq = [
  {
    q: 'Comment rejoindre le serveur Create France ?',
    a: 'Le plus simple : télécharge le <a href="/launcher/CreateFrance-Launcher-Setup.exe">Create France Launcher</a>, connecte-toi avec ton compte Microsoft et clique sur Jouer. Il installe Java, Minecraft 1.21.1, NeoForge et tout le modpack, puis te connecte directement au serveur. Tu peux aussi installer le modpack Create France depuis CurseForge et rejoindre l\'IP <strong>play.createfrance.fr</strong>.',
  },
  {
    q: 'Quelle est l\'IP du serveur ?',
    a: 'L\'IP est <strong>play.createfrance.fr</strong>. Le serveur est en Minecraft Java 1.21.1 et demande le modpack Create France (installé automatiquement par le launcher).',
  },
  {
    q: 'Quels mods sont sur le serveur ?',
    a: 'Le cœur du serveur est le mod <strong>Create</strong> (version 6), avec ses extensions : Create Aeronautics pour les engins volants, Create Big Cannons, Railways Untold pour les trains, et de nombreux mods de décoration et de confort. La liste complète est dans le modpack sur CurseForge.',
  },
  {
    q: 'Le serveur est-il gratuit ?',
    a: 'Oui, jouer est gratuit. Il faut seulement un compte Minecraft Java Édition officiel. Les grades de la boutique servent à soutenir le serveur.',
  },
  {
    q: 'Faut-il connaître le mod Create pour jouer ?',
    a: 'Non. Le serveur est ouvert aux débutants : les Ponders du mod (touche W au-dessus d\'un bloc) montrent comment chaque machine fonctionne, et la communauté aide volontiers sur le <a href="https://discord.gg/JW7XQKPpVC" target="_blank" rel="noopener">Discord</a>.',
  },
]

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') },
      })),
    }),
  }],
})
</script>

<style scoped>
.faq-section { position: relative; z-index: 2; padding: 4rem 2rem 5rem; max-width: 900px; margin: 0 auto; }
.faq-intro { color: var(--text-secondary); line-height: 1.75; font-size: 0.98rem; margin: 0 auto 2rem; max-width: 760px; text-align: center; }
.faq-intro strong { color: var(--terre-cuite-light); font-weight: 600; }
.faq-list { display: flex; flex-direction: column; gap: 0.7rem; }
.faq-item {
  background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); padding: 0 1.2rem; transition: border-color 0.3s;
}
.faq-item[open], .faq-item:hover { border-color: rgba(212, 118, 78, 0.3); }
.faq-item summary {
  cursor: pointer; list-style: none; padding: 1rem 0; font-family: 'Orbitron', sans-serif; font-size: 0.88rem;
  font-weight: 700; color: var(--terre-cuite); display: flex; justify-content: space-between; align-items: center; gap: 1rem;
}
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-size: 1.2rem; color: var(--terre-cuite-light); transition: transform 0.3s; }
.faq-item[open] summary::after { transform: rotate(45deg); }
.faq-item p { color: var(--text-secondary); line-height: 1.7; font-size: 0.92rem; padding: 0 0 1.1rem; margin: 0; }
.faq-item p :deep(a) { color: var(--mandarine); }
.faq-item p :deep(strong) { color: var(--text-primary, #f3ece6); }
@media (max-width: 600px) { .faq-section { padding: 3rem 1rem 4rem; } }
</style>
