const asset = (name: string) => `${import.meta.env.BASE_URL}${name}`
const SURI_WHATSAPP = 'https://wa.me/5511975019280'

export function SuriShopPage() {
  return (
    <div className="suri">
      <div className="suri-inner">
        <section className="suri-hero">
          <div className="suri-copy">
            <img className="suri-brand" src={asset('instituto-percorre.png')} alt="Instituto Percorre" />
            <h1>Suri Shop</h1>
            <p>
              Aponte a câmera para o QR Code e converse com a Suri Shop no WhatsApp para finalizar um pedido de
              demonstração.
            </p>
          </div>
          <a className="suri-qr" href={SURI_WHATSAPP} target="_blank" rel="noreferrer">
            <img src={asset('suri-qr.png')} alt="QR Code da Suri Shop no WhatsApp" />
          </a>
        </section>
        <p className="suri-credit">Suri by Chatbot Maker · 2026</p>
      </div>
    </div>
  )
}
