import { useState, type FormEvent } from 'react'
import { Button, Field, SelectField } from '../components/ui'
import { isValidLogin } from '../lib/auth'

export type LoginProduct = 'totvs' | 'rd'

const PRODUCTS: { value: LoginProduct; label: string }[] = [
  { value: 'totvs', label: 'TOTVS Pay' },
  { value: 'rd', label: 'RD Vendas' },
]

export function LoginPage({ onSuccess }: { onSuccess: (product: LoginProduct) => void }) {
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [product, setProduct] = useState<LoginProduct | ''>('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const canSubmit = user.trim().length > 0 && password.length > 0 && product !== '' && !pending

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit || product === '') return
    setPending(true)
    const valid = await isValidLogin(user, password)
    if (!valid) {
      setPending(false)
      setError('Usuário ou senha inválidos')
      return
    }
    setError('')
    onSuccess(product)
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <header className="login-card__header">
          <div className="login-steps" aria-hidden>
            <span className="login-step" />
            <span className="login-step is-current" />
          </div>
          <h1>Entrar</h1>
        </header>
        <div className="login-card__fields">
          <Field
            id="login-user"
            label="Usuário"
            placeholder="Insira o usuário"
            value={user}
            autoComplete="username"
            onChange={(value) => {
              setUser(value)
              setError('')
            }}
          />
          <Field
            id="login-password"
            label="Senha"
            type="password"
            placeholder="Insira a senha"
            value={password}
            autoComplete="current-password"
            onChange={(value) => {
              setPassword(value)
              setError('')
            }}
          />
          <SelectField
            id="login-product"
            label="Produto"
            placeholder="Selecione"
            value={product}
            options={PRODUCTS}
            onChange={(value) => {
              setProduct(value as LoginProduct)
              setError('')
            }}
          />
        </div>
        {error ? (
          <p className="login-error" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={!canSubmit}>
          {pending ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </div>
  )
}
