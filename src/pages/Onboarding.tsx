import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Dropfile } from '../components/Dropfile'
import { Button, Field, Input, Select } from '../components/ui'
import { BANKS, MCC_OPTIONS } from '../data/mock'
import { useStore } from '../context/Store'

const STEPS = [
  { title: 'Verifique sua empresa', subtitle: 'Tipo de cadastro' },
  { title: 'Informações pessoais', subtitle: 'Dados do representante legal' },
  { title: 'Dados bancários', subtitle: 'Informações financeiras' },
  { title: 'Envio de documentos', subtitle: 'Documentos do responsável' },
]

export function OnboardingPage() {
  const [step, setStep] = useState(0)
  const { onboarding, patchOnboarding, setOnboarded } = useStore()
  const navigate = useNavigate()
  const isPj = onboarding.personType === 'pj'

  function next() {
    if (step < 4) setStep(step + 1)
    else {
      setOnboarded(true)
      navigate('/dashboard')
    }
  }

  return (
    <AppShell>
      <div className="onboarding">
        <aside className="timeline">
          {STEPS.map((item, index) => (
            <div className="timeline-item" key={item.title}>
              <div className="rail">
                <span className={`bullet ${index < step || step === 4 ? 'done' : ''} ${index === step ? 'current' : ''}`} />
                {index < STEPS.length - 1 ? <span className="rail-line" /> : null}
              </div>
              <div>
                <h4>{item.title}</h4>
                <p>{item.subtitle}</p>
              </div>
            </div>
          ))}
        </aside>

        <section className="onboarding-card">
          {step === 0 && (
            <>
              {isPj ? <p className="page-kicker">Salvo pela última vez às 12h</p> : null}
              <h1 className="page-title">Bem-vindo, primeiro vamos realizar o seu cadastro</h1>
              <p className="page-subtitle">Para começar, preencha os dados abaixo referente ao seu cadrastro</p>
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Tipo de cadastro">
                  <Select
                    value={onboarding.personType}
                    onChange={(event) => patchOnboarding({ personType: event.target.value as 'pj' | 'pf' | '' })}
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="pj">Pessoa jurídica</option>
                    <option value="pf">Pessoa física</option>
                  </Select>
                </Field>
                {isPj ? (
                  <>
                    <Field label="Nome Comercial" hint="Esse é o nome que aparecerá no checkout e nos e-mail enviados após as compras. Caso não seja informado, será usada sua Razão Social.">
                      <Input value={onboarding.tradeName} onChange={(e) => patchOnboarding({ tradeName: e.target.value })} />
                    </Field>
                    <Field label="Razão social">
                      <Input value={onboarding.legalName} onChange={(e) => patchOnboarding({ legalName: e.target.value })} />
                    </Field>
                    <Field label="Descrição da empresa">
                      <Input value={onboarding.companyDescription} onChange={(e) => patchOnboarding({ companyDescription: e.target.value })} />
                    </Field>
                    <Field label="CNPJ">
                      <Input value={onboarding.document} onChange={(e) => patchOnboarding({ document: e.target.value })} />
                    </Field>
                    <Field label="Faturamento anual">
                      <Input value={onboarding.annualRevenue} onChange={(e) => patchOnboarding({ annualRevenue: e.target.value })} />
                    </Field>
                    <Field label="MCC (Merchant Category Code)">
                      <Select value={onboarding.mcc} onChange={(e) => patchOnboarding({ mcc: e.target.value })}>
                        <option value="">Selecione o seu MCC</option>
                        {MCC_OPTIONS.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Email corporativo">
                      <Input value={onboarding.corporateEmail} onChange={(e) => patchOnboarding({ corporateEmail: e.target.value })} />
                    </Field>
                    <Field label="Telefone">
                      <Input value={onboarding.phone} onChange={(e) => patchOnboarding({ phone: e.target.value })} />
                    </Field>
                    <h3 className="section-title">Endereço comercial</h3>
                    <div className="grid-3">
                      <Field label="CEP"><Input value={onboarding.zip} onChange={(e) => patchOnboarding({ zip: e.target.value })} /></Field>
                      <Field label="Logadouro"><Input value={onboarding.street} onChange={(e) => patchOnboarding({ street: e.target.value })} /></Field>
                      <Field label="Número"><Input value={onboarding.number} onChange={(e) => patchOnboarding({ number: e.target.value })} /></Field>
                      <Field label="Bairro"><Input value={onboarding.neighborhood} onChange={(e) => patchOnboarding({ neighborhood: e.target.value })} /></Field>
                      <Field label="Cidade"><Input value={onboarding.city} onChange={(e) => patchOnboarding({ city: e.target.value })} /></Field>
                      <Field label="Estado"><Input value={onboarding.state} onChange={(e) => patchOnboarding({ state: e.target.value })} /></Field>
                    </div>
                  </>
                ) : null}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="page-title">Verifique suas informações pessoais</h1>
              <p className="page-subtitle">
                Esses dados são utilizados para confirmar e proteger a identidade do representante legal da empresa.
              </p>
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Nome jurídico" hint="Insira seu nome completo como aparece nos documentos oficiais do governo.">
                  <Input value={onboarding.legalNamePerson} onChange={(e) => patchOnboarding({ legalNamePerson: e.target.value })} />
                </Field>
                {!isPj ? (
                  <>
                    <Field label="MCC (Merchant Category Code)">
                      <Select value={onboarding.mcc} onChange={(e) => patchOnboarding({ mcc: e.target.value })}>
                        <option value="">Selecione o seu MCC</option>
                        {MCC_OPTIONS.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Renda anual">
                      <Input value={onboarding.annualRevenue} onChange={(e) => patchOnboarding({ annualRevenue: e.target.value })} />
                    </Field>
                  </>
                ) : null}
                <div className="grid-2">
                  <Field label="Email">
                    <Input value={onboarding.email} onChange={(e) => patchOnboarding({ email: e.target.value })} />
                  </Field>
                  {isPj ? (
                    <Field label="Data de nascimento">
                      <Input type="date" value={onboarding.birthDate} onChange={(e) => patchOnboarding({ birthDate: e.target.value })} />
                    </Field>
                  ) : (
                    <Field label="Telefone">
                      <Input value={onboarding.personalPhone} onChange={(e) => patchOnboarding({ personalPhone: e.target.value })} />
                    </Field>
                  )}
                  <Field label="CPF">
                    <Input value={onboarding.cpf} onChange={(e) => patchOnboarding({ cpf: e.target.value })} />
                  </Field>
                  {isPj ? (
                    <Field label="Telefone">
                      <Input value={onboarding.personalPhone} onChange={(e) => patchOnboarding({ personalPhone: e.target.value })} />
                    </Field>
                  ) : (
                    <Field label="Data de nascimento">
                      <Input type="date" value={onboarding.birthDate} onChange={(e) => patchOnboarding({ birthDate: e.target.value })} />
                    </Field>
                  )}
                </div>
                <h3 className="section-title">Endereço</h3>
                <div className="grid-3">
                  <Field label="CEP"><Input value={onboarding.personalZip} onChange={(e) => patchOnboarding({ personalZip: e.target.value })} /></Field>
                  <Field label="Logadouro"><Input value={onboarding.personalStreet} onChange={(e) => patchOnboarding({ personalStreet: e.target.value })} /></Field>
                  <Field label="Número"><Input value={onboarding.personalNumber} onChange={(e) => patchOnboarding({ personalNumber: e.target.value })} /></Field>
                  <Field label="Bairro"><Input value={onboarding.personalNeighborhood} onChange={(e) => patchOnboarding({ personalNeighborhood: e.target.value })} /></Field>
                  <Field label="Cidade"><Input value={onboarding.personalCity} onChange={(e) => patchOnboarding({ personalCity: e.target.value })} /></Field>
                  <Field label="Estado"><Input value={onboarding.personalState} onChange={(e) => patchOnboarding({ personalState: e.target.value })} /></Field>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="page-title">Adicionar uma conta para repasses</h1>
              <p className="page-subtitle">Insira as informações bancarias atreladas a empresa</p>
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Titular da conta">
                  <Input value={onboarding.holderName} onChange={(e) => patchOnboarding({ holderName: e.target.value })} />
                </Field>
                <div className="grid-3">
                  <Field label="Banco">
                    <Select value={onboarding.bank} onChange={(e) => patchOnboarding({ bank: e.target.value })}>
                      <option value="" />
                      {BANKS.map((bank) => (
                        <option key={bank}>{bank}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Tipo de conta">
                    <Select value={onboarding.accountKind} onChange={(e) => patchOnboarding({ accountKind: e.target.value })}>
                      <option value="" />
                      <option>Corrente</option>
                      <option>Poupança</option>
                    </Select>
                  </Field>
                  <Field label="Código do Banco">
                    <Input value={onboarding.bankCode} onChange={(e) => patchOnboarding({ bankCode: e.target.value })} />
                  </Field>
                </div>
                <div className="grid-4">
                  <Field label="Agência"><Input value={onboarding.agency} onChange={(e) => patchOnboarding({ agency: e.target.value })} /></Field>
                  <Field label="Dígito Agência"><Input value={onboarding.agencyDigit} onChange={(e) => patchOnboarding({ agencyDigit: e.target.value })} /></Field>
                  <Field label="Número da Conta"><Input value={onboarding.accountNumber} onChange={(e) => patchOnboarding({ accountNumber: e.target.value })} /></Field>
                  <Field label="Dígito Conta"><Input value={onboarding.accountDigit} onChange={(e) => patchOnboarding({ accountDigit: e.target.value })} /></Field>
                </div>
                <div className="grid-2">
                  <Field label="Tipo da conta">
                    <Select value={onboarding.accountType} onChange={(e) => patchOnboarding({ accountType: e.target.value })}>
                      <option value="" />
                      <option>Pessoa jurídica</option>
                      <option>Pessoa física</option>
                    </Select>
                  </Field>
                  <Field label="Documento do portador">
                    <Input value={onboarding.holderDocument} onChange={(e) => patchOnboarding({ holderDocument: e.target.value })} />
                  </Field>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="page-title">Documentos</h1>
              <p className="page-subtitle">Envie seus documentos para aprovação</p>
              <h3 className="section-title" style={{ marginTop: 8 }}>Documento do responsável</h3>
              <p className="page-subtitle">
                O documento enviado deve ser do responsável legal da empresa (a identidade deve corresponder com os dados preenchidos no primeiro passo)
              </p>
              <Dropfile label="Frente do documento" value={onboarding.docFront} onPick={(name) => patchOnboarding({ docFront: name })} />
              <Dropfile label="Verso do documento" value={onboarding.docBack} onPick={(name) => patchOnboarding({ docBack: name })} />
              <h3 className="section-title">Foto do responsável</h3>
              <p className="page-subtitle">A foto deve corresponder a do documento</p>
              <Dropfile value={onboarding.selfie} onPick={(name) => patchOnboarding({ selfie: name })} />
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="page-title">Enviado para análise</h1>
              <p className="page-subtitle" style={{ maxWidth: 720, lineHeight: 1.6 }}>
                Informe-nos que sua solicitação foi recebida com sucesso e está em processo de análise. Neste momento, nossa equipe está verificando todas as informações fornecidas, incluindo os dados cadastrais da empresa, do responsável legal e os registros junto à Receita Federal. Esse processo é essencial para garantir a conformidade com as exigências legais e assegurar a autenticidade das informações. Assim que a validação for concluída e todos os dados forem confirmados, o acesso será liberado para utilização plena da plataforma/sistema. Agradecemos pela sua compreensão e, se necessário, entraremos em contato para eventuais ajustes ou complementações.
              </p>
            </>
          )}

          <div className="form-actions">
            {step > 0 ? (
              <Button variant="tertiary" type="button" onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
            ) : null}
            <Button type="button" onClick={next} disabled={step === 0 && !onboarding.personType}>
              {step === 4 ? 'Ir para o dashboard' : 'Próximo'}
            </Button>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
