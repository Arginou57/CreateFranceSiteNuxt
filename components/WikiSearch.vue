<template>
  <div ref="root" class="wsearch" :class="[`wsearch-${size}`, { open: open }]" @focusout="onFocusOut">
    <form role="search" class="wsearch-form" @submit.prevent="go(active)">
      <svg class="wsearch-ico" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M10.5 3a7.5 7.5 0 0 1 5.96 12.05l4.25 4.24-1.42 1.42-4.24-4.25A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" fill="currentColor" />
      </svg>
      <label :for="inputId" class="sr-only">{{ t('wiki.search.label') }}</label>
      <input
        :id="inputId"
        ref="input"
        v-model="q"
        type="search"
        autocomplete="off"
        spellcheck="false"
        enterkeyhint="go"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="open"
        :aria-controls="listId"
        :aria-activedescendant="open && rows.length ? `${listId}-${active}` : undefined"
        :placeholder="t('wiki.search.placeholder')"
        @focus="focused = true"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.esc="close"
      >
      <kbd v-if="size === 'lg' && !q" class="wsearch-kbd" aria-hidden="true">/</kbd>
      <button v-if="q" type="button" class="wsearch-clear" :aria-label="t('wiki.search.clear')" @click="clear">×</button>
    </form>

    <div v-show="open" class="wsearch-panel">
      <!-- empty field: explain what can be typed, with clickable examples -->
      <div v-if="!q.trim()" class="wsearch-help">
        <p>{{ t('wiki.search.help') }}</p>
        <div class="wsearch-examples">
          <button v-for="ex in examples" :key="ex" type="button" @mousedown.prevent="q = ex">{{ ex }}</button>
        </div>
      </div>

      <ul v-else-if="rows.length" :id="listId" role="listbox" class="wsearch-list" :aria-label="t('wiki.search.results')">
        <li
          v-for="(h, i) in rows"
          :id="`${listId}-${i}`"
          :key="h.href"
          role="option"
          :aria-selected="i === active"
          :class="{ active: i === active }"
          @mousemove="active = i"
          @mousedown.prevent="go(i)"
        >
          <img v-if="h.doc.icon" :src="h.doc.icon" alt="" width="40" height="40" loading="lazy">
          <span class="wsearch-body">
            <strong>
              {{ h.doc.page.name }}<template v-if="h.section"> <span class="wsearch-sep">›</span> {{ h.section.title }}</template>
            </strong>
            <small>{{ h.doc.mod }} · {{ h.doc.category }}</small>
            <span class="wsearch-snip"><template v-for="(part, k) in parts(h)" :key="k"><mark v-if="part.m">{{ part.s }}</mark><template v-else>{{ part.s }}</template></template></span>
          </span>
        </li>
      </ul>

      <div v-else class="wsearch-none">
        <p>{{ t('wiki.search.none', { q: q.trim() }) }}</p>
        <p class="wsearch-none-tip">{{ t('wiki.search.noneTip') }}</p>
      </div>

      <p v-if="rows.length" class="wsearch-foot" aria-hidden="true">{{ t('wiki.search.keys') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WikiSearchHit } from '~/utils/wikiSearch'

const props = withDefaults(defineProps<{ size?: 'lg' | 'sm'; initial?: string; shortcut?: boolean }>(), {
  size: 'sm',
  initial: '',
  shortcut: false,
})

const { t, tm, rt, locale } = useI18n()
const lang = computed<WikiLocale>(() => (locale.value === 'en' ? 'en' : 'fr'))
const uid = useId()
const inputId = `wsearch-${uid}`
const listId = `wsearch-list-${uid}`
const root = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const q = ref(props.initial)
const focused = ref(false)
const active = ref(0)

const examples = computed(() => (tm('wiki.search.examples') as unknown as unknown[]).map((x) => rt(x as any)))
const rows = computed<WikiSearchHit[]>(() => (q.value.trim() ? wikiSearch(lang.value, q.value, 8) : []))
const open = computed(() => focused.value)

watch(q, () => { active.value = 0 })

function move(d: number) {
  if (!rows.value.length) return
  active.value = (active.value + d + rows.value.length) % rows.value.length
}

async function go(i: number) {
  const h = rows.value[i]
  if (!h) return
  close()
  input.value?.blur()
  await navigateTo(h.href)
}

function clear() {
  q.value = ''
  input.value?.focus()
}

function close() {
  focused.value = false
}

function parts(h: WikiSearchHit) {
  const out: { s: string; m: boolean }[] = []
  let at = 0
  for (const [a, b] of h.marks) {
    if (a > at) out.push({ s: h.snippet.slice(at, a), m: false })
    out.push({ s: h.snippet.slice(a, b), m: true })
    at = b
  }
  if (at < h.snippet.length) out.push({ s: h.snippet.slice(at), m: false })
  return out
}

function onFocusOut(e: FocusEvent) {
  const next = e.relatedTarget as Node | null
  if (next && root.value && !root.value.contains(next)) close()
}

function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) close()
}

// « / » anywhere on the page focuses the search (like most docs sites)
function onKey(e: KeyboardEvent) {
  if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
  const el = document.activeElement as HTMLElement | null
  if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return
  e.preventDefault()
  input.value?.focus()
}

onMounted(() => {
  document.addEventListener('mousedown', onDocClick)
  if (props.shortcut) document.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', onDocClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.wsearch { position: relative; z-index: 30; }
.wsearch-form {
  display: flex; align-items: center; gap: 0.6rem; padding: 0 0.9rem; border-radius: 12px;
  background: rgba(0, 0, 0, 0.32); border: 1px solid rgba(212, 118, 78, 0.28); transition: border-color 0.2s, box-shadow 0.2s;
}
.wsearch.open .wsearch-form, .wsearch-form:focus-within { border-color: var(--terre-cuite); box-shadow: 0 0 0 3px rgba(212, 118, 78, 0.18); }
.wsearch-ico { color: var(--terre-cuite-light); flex: none; }
.wsearch input {
  flex: 1; min-width: 0; background: none; border: none; outline: none; color: var(--text-primary);
  font: inherit; font-size: 0.95rem; padding: 0.75rem 0;
}
.wsearch input::placeholder { color: var(--text-muted); }
.wsearch input::-webkit-search-cancel-button { display: none; }
.wsearch-lg input { font-size: 1.05rem; padding: 1rem 0; }
.wsearch-kbd {
  font-family: inherit; font-size: 0.75rem; color: var(--text-muted); border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 5px; padding: 0.05rem 0.45rem;
}
.wsearch-clear { background: none; border: none; color: var(--text-secondary); font-size: 1.4rem; line-height: 1; cursor: pointer; padding: 0.2rem; }

.wsearch-panel {
  position: absolute; left: 0; right: 0; top: calc(100% + 6px); max-height: min(70vh, 560px); overflow-y: auto;
  background: #241f1b; border: 1px solid rgba(212, 118, 78, 0.3); border-radius: 12px; box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55);
}
.wsearch-help { padding: 0.9rem 1rem; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.55; }
.wsearch-examples { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.6rem; }
.wsearch-examples button {
  font: inherit; font-size: 0.78rem; cursor: pointer; color: var(--mandarine-light); background: rgba(242, 166, 90, 0.08);
  border: 1px solid rgba(242, 166, 90, 0.25); border-radius: 999px; padding: 0.2rem 0.7rem;
}
.wsearch-list { list-style: none; padding: 0.35rem; }
.wsearch-list li { display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.55rem 0.6rem; border-radius: 9px; cursor: pointer; }
.wsearch-list li.active { background: rgba(212, 118, 78, 0.14); }
.wsearch-list img { width: 40px; height: 40px; flex: none; }
.wsearch-body { display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
.wsearch-body strong { color: var(--text-primary); font-size: 0.92rem; font-weight: 600; }
.wsearch-sep { color: var(--text-muted); }
.wsearch-body small { color: var(--sauge); font-size: 0.72rem; }
.wsearch-snip { color: var(--text-secondary); font-size: 0.78rem; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.wsearch-snip mark { background: rgba(242, 166, 90, 0.25); color: var(--mandarine-light); border-radius: 3px; padding: 0 1px; }
.wsearch-none { padding: 1rem; color: var(--text-secondary); font-size: 0.88rem; }
.wsearch-none-tip { color: var(--text-muted); font-size: 0.8rem; margin-top: 0.35rem; }
.wsearch-foot { border-top: 1px solid rgba(255, 255, 255, 0.06); padding: 0.45rem 1rem; color: var(--text-muted); font-size: 0.7rem; }
@media (hover: none) { .wsearch-foot, .wsearch-kbd { display: none; } }
</style>
