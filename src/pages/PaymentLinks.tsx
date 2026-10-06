import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Button, Select } from '../components/ui'
import {
  formatBRL,
  linkPaymentClass,
  linkPaymentLabel,
  linkTotal,
  statusClass,
  statusLabel,
  type LinkStatus,
} from '../data/mock'
import { useStore } from '../context/Store'

export function PaymentLinksPage() {
  const { links, updateLink, removeLink, notify } = useStore()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<LinkStatus | ''>('')
  const [menuId, setMenuId] = useState<string | null>(null)
  const navigate = useNavigate()

  const filtered = useMemo(
    () =>
      links.filter((link) => {
        const matchesQuery = link.name.toLowerCase().includes(query.toLowerCase())
        const matchesStatus = status ? link.status === status : true
        return matchesQuery && matchesStatus
      }),
    [links, query, status],
  )

  return (
    <AppShell>
      <div className="workspace-inner">
        <p className="page-kicker">Cobranças</p>
        <div className="page-title-row">
          <h1 className="page-title">Links de Pagamentos</h1>
          <Button type="button" onClick={() => navigate('/links/novo')}>
            Criar link de pagamento
          </Button>
        </div>
        <div className="filters">
          <div className="search">
            <input className="control" placeholder="Buscar link" value={query} onChange={(e) => setQuery(e.target.value)} />
            <span className="search-icon">⌕</span>
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value as LinkStatus | '')} style={{ width: 140 }}>
            <option value="">Status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </Select>
          <input className="control" type="date" style={{ width: 220 }} aria-label="Data" />
        </div>
        <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome do link</th>
              <th>Status</th>
              <th>Criação</th>
              <th>Vencimento</th>
              <th>Valor do link</th>
              <th>Pagamentos</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((link) => (
              <tr key={link.id}>
                <td>
                  <Link className="name-link" to={`/links/${link.id}`}>
                    {link.name}
                  </Link>
                </td>
                <td>
                  <span className={`badge ${statusClass(link.status)}`}>{statusLabel(link.status)}</span>
                </td>
                <td>{link.createdAt}</td>
                <td>{link.dueAt ?? '—'}</td>
                <td>{formatBRL(linkTotal(link))}</td>
                <td>
                  <span className={`badge ${linkPaymentClass(link)}`}>{linkPaymentLabel(link)}</span>
                </td>
                <td className="row-actions">
                  <button className="btn btn-ghost" type="button" onClick={() => setMenuId(menuId === link.id ? null : link.id)}>
                    ⋮
                  </button>
                  {menuId === link.id ? (
                    <div className="menu">
                      <button type="button" onClick={() => navigate(`/links/${link.id}`)}>
                        Ver detalhes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard?.writeText(link.url)
                          notify('Link copiado')
                          setMenuId(null)
                        }}
                      >
                        Copiar link
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateLink(link.id, { status: link.status === 'ativo' ? 'inativo' : 'ativo' })
                          setMenuId(null)
                        }}
                      >
                        {link.status === 'ativo' ? 'Inativar' : 'Ativar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          removeLink(link.id)
                          notify('Link removido')
                          setMenuId(null)
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className="pagination">
          <span>Anterior</span>
          <button className="current" type="button">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <span>…</span>
          <button type="button">20</button>
          <button type="button">Próxima</button>
        </div>
      </div>
    </AppShell>
  )
}
