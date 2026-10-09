import type { ReactNode } from 'react'
import { eduAsset, formatBRL, type Tuition } from './model'

export type PortalFlowKind = 'pix' | 'boleto' | 'barcode'
export type PortalFlowStage = 'summary' | 'pay' | 'confirm'

export type PortalFlow = {
  kind: PortalFlowKind
  stage: PortalFlowStage
}

const PIX_PAYLOAD =
  '00020126580014BR.GOV.BCB.PIX0136educacional-pensando-juntos5204000053039865406100.005802BR5913PENSANDO JUNTOS6009SAO PAULO62070503***6304ABCD'

const BARCODE_LINE = '34191.79001 01043.510047 91020.150008 8 84190000085000'

function ModalShell({
  title,
  wide,
  onClose,
  children,
  footer,
}: {
  title: string
  wide?: boolean
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="edu-portal-layer" onClick={onClose}>
      <section
        className={`edu-portal-modal${wide ? ' edu-portal-modal--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edu-portal-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="edu-portal-modal__head">
          <h2 id="edu-portal-modal-title">{title}</h2>
          <button type="button" className="edu-portal-modal__close" aria-label="Fechar" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="edu-portal-modal__body">{children}</div>
        {footer ? <footer className="edu-portal-modal__foot">{footer}</footer> : null}
      </section>
    </div>
  )
}

function SummaryTable({ tuitions }: { tuitions: Tuition[] }) {
  return (
    <div className="edu-portal-table-wrap">
      <table className="edu-portal-table">
        <thead>
          <tr>
            <th>Especificação</th>
            <th>Valor</th>
            <th>Vencimento</th>
          </tr>
        </thead>
        <tbody>
          {tuitions.map((item) => (
            <tr key={item.id}>
              <td>{item.month}</td>
              <td>{formatBRL(item.cents)}</td>
              <td>{item.due}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PortalPaymentModals({
  flow,
  tuitions,
  payCents,
  pixCents,
  comboPix,
  comboChargeCopy,
  toast,
  onToast,
  onClose,
  onFlow,
  onFinish,
  onPayBack,
}: {
  flow: PortalFlow
  tuitions: Tuition[]
  payCents: number
  pixCents: number
  comboPix?: boolean
  comboChargeCopy?: string
  toast: string | null
  onToast: (message: string | null) => void
  onClose: () => void
  onFlow: (next: PortalFlow) => void
  onFinish: () => void
  onPayBack?: () => void
}) {
  const displayPixCents = comboPix ? pixCents : payCents

  if (flow.stage === 'summary') {
    const title =
      flow.kind === 'pix'
        ? 'Pagamento das contas selecionadas'
        : flow.kind === 'boleto'
          ? 'Pagamento das contas selecionadas'
          : 'Pagamento das contas selecionadas'
    return (
      <ModalShell
        title={title}
        onClose={onClose}
        footer={
          <>
            <p className="edu-portal-total">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 3c-4.4 0-8 2.7-8 6s3.6 6 8 6 8 2.7 8 6-3.6 6-8 6-8-2.7-8-6 3.6-6 8-6Z"
                  stroke="#06748f"
                  strokeWidth="1.4"
                />
                <path d="M12 7v10M9.5 9.5h4a2 2 0 0 1 0 4h-3" stroke="#06748f" strokeWidth="1.4" />
              </svg>
              <span>
                Valor líquido <strong>{formatBRL(payCents)}</strong>
              </span>
            </p>
            <button type="button" className="edu-portal-btn" onClick={() => onFlow({ ...flow, stage: 'pay' })}>
              Avançar
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="2" />
              </svg>
            </button>
          </>
        }
      >
        <SummaryTable tuitions={tuitions} />
      </ModalShell>
    )
  }

  if (flow.stage === 'pay' && flow.kind === 'pix') {
    return (
      <>
        <ModalShell
          title="Pagamento com Pix"
          wide
          onClose={onClose}
          footer={
            <button type="button" className="edu-portal-link" onClick={onPayBack ?? onClose}>
              Cancelar
            </button>
          }
        >
          {comboPix && comboChargeCopy ? <p className="edu-portal-note edu-portal-note--brand">{comboChargeCopy}</p> : null}
          <p className="edu-portal-note">
            O pagamento por Pix deve ser efetuado por meio do QR Code ou pela chave Pix clicando no botão &quot;Pix copia e cola&quot;.
          </p>
          <p className="edu-portal-note">
            Esta chave <strong>expira em 1 hora.</strong> Após este período, é necessário gerar uma nova chave para pagamento.
          </p>
          <div className="edu-portal-pix">
            <div className="edu-portal-pix__qr">
              <img src={eduAsset('pix-qr.svg')} alt="QR Code do Pix" width={146} height={146} />
            </div>
            <div className="edu-portal-pix__side">
              <p>Valor total</p>
              <strong>{formatBRL(displayPixCents)}</strong>
              <button
                type="button"
                className="edu-portal-btn edu-portal-btn--block"
                onClick={() => {
                  void navigator.clipboard?.writeText(PIX_PAYLOAD)
                  onToast('Código copiado!')
                  window.setTimeout(() => onToast(null), 3200)
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M8 8.5h8.5V17H8V8.5Zm1.6-3h8.9V15h-1.4V7.1H9.6V5.5Z" fill="#fff" />
                </svg>
                Pix copia e cola
              </button>
              <a
                className="edu-portal-btn edu-portal-btn--ghost edu-portal-btn--block"
                href={eduAsset('pix-qr.svg')}
                download="pix-qrcode.svg"
                onClick={() => {
                  onToast('Imagem salva!')
                  window.setTimeout(() => onToast(null), 3200)
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 4.5v9.2l2.8-2.8 1.2 1.2L12 16.6 7.9 12.1l1.2-1.2 2.9 2.8V4.5H12ZM6 18.2h12V20H6v-1.8Z" fill="currentColor" />
                </svg>
                Salvar imagem
              </a>
              <button type="button" className="edu-portal-btn edu-portal-btn--block" onClick={() => onFlow({ ...flow, stage: 'confirm' })}>
                Confirmar pagamento
              </button>
            </div>
          </div>
        </ModalShell>
        {toast ? <div className="edu-portal-toast">{toast}</div> : null}
      </>
    )
  }

  if (flow.stage === 'pay' && flow.kind === 'boleto') {
    return (
      <ModalShell
        title="Emissão de boleto"
        wide
        onClose={onClose}
        footer={
          <>
            <button type="button" className="edu-portal-link" onClick={onClose}>
              Cancelar
            </button>
            <div className="edu-portal-modal__foot-actions">
              <button type="button" className="edu-portal-btn edu-portal-btn--ghost" onClick={() => onToast('Download iniciado')}>
                Baixar boleto
              </button>
              <button type="button" className="edu-portal-btn" onClick={() => onFlow({ ...flow, stage: 'confirm' })}>
                Concluir
              </button>
            </div>
          </>
        }
      >
        <p className="edu-portal-note">Seu boleto foi gerado. Você pode baixar o PDF ou imprimir para pagamento em qualquer banco.</p>
        <div className="edu-portal-boleto-preview" aria-hidden>
          <div className="edu-portal-boleto-preview__bar" />
          <p>Boleto bancário</p>
          <p className="edu-portal-boleto-preview__value">{formatBRL(payCents)}</p>
          <p className="edu-portal-boleto-preview__line">{BARCODE_LINE}</p>
        </div>
      </ModalShell>
    )
  }

  if (flow.stage === 'pay' && flow.kind === 'barcode') {
    return (
      <>
        <ModalShell
          title="Código de barras"
          wide
          onClose={onClose}
          footer={
            <>
              <button type="button" className="edu-portal-link" onClick={onClose}>
                Cancelar
              </button>
              <button type="button" className="edu-portal-btn" onClick={() => onFlow({ ...flow, stage: 'confirm' })}>
                Concluir
              </button>
            </>
          }
        >
          <p className="edu-portal-note">Utilize a linha digitável abaixo para pagamento via internet banking ou caixa eletrônico.</p>
          <div className="edu-portal-barcode">
            <div className="edu-portal-barcode__bars" aria-hidden />
            <p className="edu-portal-barcode__line">{BARCODE_LINE}</p>
            <button
              type="button"
              className="edu-portal-btn"
              onClick={() => {
                void navigator.clipboard?.writeText(BARCODE_LINE.replace(/\s/g, ''))
                onToast('Código copiado!')
                window.setTimeout(() => onToast(null), 3200)
              }}
            >
              Copiar código de barras
            </button>
          </div>
        </ModalShell>
        {toast ? <div className="edu-portal-toast">{toast}</div> : null}
      </>
    )
  }

  const confirmTitle = 'Confirmação de pagamento'
  const confirmBody =
    flow.kind === 'pix'
      ? 'Recebemos a confirmação do pagamento via Pix. O valor já consta como quitado em nosso sistema.'
      : flow.kind === 'boleto'
        ? 'Boleto emitido com sucesso. A baixa será processada após a confirmação do banco.'
        : 'Código de barras gerado com sucesso. Utilize-o para concluir o pagamento no seu banco.'

  return (
    <ModalShell
      title={confirmTitle}
      onClose={onFinish}
      footer={
        <button type="button" className="edu-portal-btn" onClick={onFinish}>
          Retornar para o extrato financeiro
        </button>
      }
    >
      <div className="edu-portal-confirm">
        <SuccessArt />
        <p>{confirmBody}</p>
      </div>
    </ModalShell>
  )
}

function SuccessArt() {
  return (
    <div className="edu-portal-confirm__art" aria-hidden>
      <img src={eduAsset('success-bubble.svg')} alt="" />
      <img src={eduAsset('success-c1.svg')} alt="" className="edu-portal-confirm__c1" />
      <img src={eduAsset('success-c2.svg')} alt="" className="edu-portal-confirm__c2" />
      <img src={eduAsset('success-c3.svg')} alt="" className="edu-portal-confirm__c3" />
    </div>
  )
}
