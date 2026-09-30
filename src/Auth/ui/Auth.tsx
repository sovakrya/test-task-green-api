import { useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { getAccount, getContactInfo } from '../../api/greenApi'
import './Auth.css'

interface AuthProps {
  id: string
  apiToken: string
  phone: string

  setId: (id: string) => void
  setApiToken: (token: string) => void
  setPhone: (phone: string) => void
  setChatId: (chatId: string) => void
  setUserName: (userName: string) => void
  setAvatar: (avatar: string) => void
}

export function Auth({
  id,
  apiToken,
  phone,
  setId,
  setApiToken,
  setPhone,
  setChatId,
  setAvatar,
  setUserName,
}: AuthProps) {
  const navigate = useNavigate()
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState('')
  const [isPhoneInvalid, setIsPhoneInvalid] = useState(false)

  const handleCreateChat = async () => {
    if (id === '' || apiToken === '' || phone === '' || isChecking) {
      return
    }

    const digits = phone.replace(/\D/g, '')

    if (!/^\d{7,15}$/.test(digits)) {
      setIsPhoneInvalid(true)
      return setError('Некорректный номер телефона')
    }

    setIsPhoneInvalid(false)
    setError('')
    setIsChecking(true)

    try {
      const account = await getAccount(phone, id, apiToken)

      if (account.exist) {
        setChatId(account.chatId)

        const { avatar, username } = await getContactInfo(account.chatId, id, apiToken)
        setAvatar(avatar)
        setUserName(username)

        navigate('/chat')
      } else {
        setError('Аккаунт не найден или номер скрыт настройками приватности')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось проверить аккаунт')
    } finally {
      setIsChecking(false)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      void handleCreateChat()
    }
  }

  const handlePhoneChange = (value: string) => {
    setPhone(value)

    if (isPhoneInvalid) {
      setIsPhoneInvalid(false)
      setError('')
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h1 className="auth-box__title">Создать чат</h1>
        <p className="auth-box__subtitle">
          Укажите параметры экземпляра GREEN API и номер телефона получателя.
        </p>

        <div className="auth-form">
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="auth-id">
              Id Instance
            </label>
            <input
              id="auth-id"
              className="auth-field__input"
              value={id}
              onChange={(event) => setId(event.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              type="text"
            />
          </div>

          <div className="auth-field">
            <label className="auth-field__label" htmlFor="auth-api-token">
              Api token Instance
            </label>
            <input
              id="auth-api-token"
              className="auth-field__input"
              value={apiToken}
              onChange={(event) => setApiToken(event.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              type="password"
            />
          </div>

          <div className="auth-field">
            <label className="auth-field__label" htmlFor="auth-phone">
              номер телефона получателя
            </label>
            <input
              id="auth-phone"
              className="auth-field__input"
              value={phone}
              onChange={(event) => handlePhoneChange(event.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="tel"
              aria-invalid={isPhoneInvalid}
              aria-describedby={error ? 'auth-error' : undefined}
              type="tel"
            />
          </div>
        </div>

        <div className="auth-box__actions">
          <button className="auth-submit" disabled={isChecking} onClick={handleCreateChat}>
            {isChecking ? 'Проверяем…' : 'Создать чат'}
          </button>

          {error && (
            <p className="auth-box__error" id="auth-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
