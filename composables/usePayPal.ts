// PayPal SDK (subscription buttons of the shop), loaded only once and only when a grade card comes near the screen:
// it used to load with the page and slowed down the first display, mostly on mobile.
const SDK_URL =
  'https://www.paypal.com/sdk/js?client-id=AS93E-_QKCB8stw2HU5dxk4c6WjAI_Qbyp8fa5iIoPbHEtXPfhLmpP4qPgccCVIw5k4PK10gGz78eopO&vault=true&intent=subscription'

let loading: Promise<any> | null = null

export function loadPayPal(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('client only'))
  const w = window as any
  if (w.paypal) return Promise.resolve(w.paypal)
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = SDK_URL
      s.async = true
      s.setAttribute('data-sdk-integration-source', 'button-factory')
      s.onload = () => (w.paypal ? resolve(w.paypal) : reject(new Error('PayPal indisponible')))
      s.onerror = () => { loading = null; reject(new Error('PayPal indisponible')) }
      document.head.appendChild(s)
    })
  }
  return loading
}
