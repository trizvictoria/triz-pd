import { useEffect, useRef, useState } from 'react'

const asset = (name: string) => `${import.meta.env.BASE_URL}${name}`
const SURI_WHATSAPP = 'https://wa.me/5511975019280'

function DemoVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  function play() {
    const video = videoRef.current
    if (!video) return
    video.controls = true
    void video.play()
    setPlaying(true)
  }

  return (
    <div className="suri-screen">
      <video
        ref={videoRef}
        src={asset(src)}
        poster={asset(poster)}
        playsInline
        preload="metadata"
        aria-label={label}
        onEnded={() => setPlaying(false)}
      />
      {playing ? null : (
        <button type="button" className="suri-play" onClick={play} aria-label={`Reproduzir: ${label}`}>
          <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
            <path d="M10 7.5v13l11-6.5-11-6.5Z" fill="currentColor" />
          </svg>
        </button>
      )}
    </div>
  )
}

export function SuriShopPage() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const scroller = root?.closest('.content')
    if (!root || !(scroller instanceof HTMLElement)) return

    const fill = root.querySelector<HTMLElement>('.suri-rail__fill')
    const stories = root.querySelector<HTMLElement>('.suri-stories')
    const nextDot = root.querySelector<HTMLElement>('.suri-rail__dot--next')
    const nextMark = root.querySelector<HTMLElement>('[data-suri-mark="assistida"]')
    if (!fill || !stories) return

    const scrollEl = scroller
    function sync() {
      const max = scrollEl.scrollHeight - scrollEl.clientHeight
      const progress = max <= 8 ? 1 : Math.min(1, Math.max(0, scrollEl.scrollTop / max))
      fill.style.height = `${progress * 100}%`
      if (nextDot && nextMark) {
        const rail = nextDot.parentElement
        if (rail) {
          const top = nextMark.getBoundingClientRect().top - rail.getBoundingClientRect().top
          nextDot.style.top = `${Math.max(0, top)}px`
          nextDot.classList.toggle('is-on', progress >= top / rail.clientHeight)
        }
      }
    }

    sync()
    scroller.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      scroller.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])

  return (
    <div className="suri" ref={rootRef}>
      <div className="suri-main">
        <div className="suri-stories">
          <div className="suri-rail" aria-hidden="true">
            <span className="suri-rail__dot is-on" />
            <span className="suri-rail__line">
              <span className="suri-rail__fill" />
            </span>
            <span className="suri-rail__dot suri-rail__dot--next" />
          </div>

          <article className="suri-story">
            <div className="suri-copy">
              <p className="suri-kicker" data-suri-mark="automatizada">
                Venda automatizada
              </p>
              <h1>Suri + TOTVS Pay: a jornada de venda completa, automatizada com IA</h1>
            </div>
            <div className="device-phone">
              <DemoVideo
                src="suri/venda-automatizada.mp4"
                poster="suri/poster-automatizada.jpg"
                label="Demonstração da venda automatizada no WhatsApp da Loja Instituto Percorre"
              />
            </div>
          </article>

          <article className="suri-story suri-story--desk">
            <div className="suri-copy">
              <p className="suri-kicker" data-suri-mark="assistida">
                Venda assistida
              </p>
              <h2>Suri + TOTVS Pay: seu time atende, vende e recebe</h2>
            </div>
            <div className="device-laptop">
              <div className="device-laptop__bezel">
                <DemoVideo
                  src="suri/venda-assistida.mp4"
                  poster="suri/poster-assistida.jpg"
                  label="Demonstração da venda assistida no painel da Suri"
                />
              </div>
              <div className="device-laptop__base" aria-hidden="true" />
            </div>
          </article>
        </div>
      </div>

      <aside className="suri-panel">
        <img className="suri-brand" src={asset('instituto-percorre-mark.png')} alt="Instituto Percorre" />
        <a className="suri-qr" href={SURI_WHATSAPP} target="_blank" rel="noreferrer">
          <img src={asset('suri-qr.png')} alt="QR Code da Suri Shop no WhatsApp" />
        </a>
        <p>
          Acesse o QR Code, apoie o Instituto Percorre e retire a sua compra diretamente na loja durante o{' '}
          <strong>Universo TOTVS</strong>!
        </p>
      </aside>
    </div>
  )
}
