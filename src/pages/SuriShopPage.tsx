export function SuriShopPage() {
  return (
    <div className="suri">
      <div className="suri-inner">
        <section className="suri-hero">
          <div className="suri-copy">
            <h1>Suri Shop</h1>
            <p>
              Experimente a experiência de compra TOTVS Pay através da Suri Shop. Aponte a câmera para o QR Code e
              finalize um pedido de demonstração com os mesmos passos de pagamento usados no checkout.
            </p>
          </div>
          <div className="suri-qr" aria-label="Espaço reservado para o QR Code">
            <div className="suri-qr__frame">
              <span className="suri-qr__mark" aria-hidden />
              <p>QR Code</p>
              <small>versão final em breve</small>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
