import { useEffect, useState, type SubmitEvent } from 'react'
import {
  MAX_MESSAGE_LENGTH,
  sendMessage,
  receiveNotification,
  deleteNotification,
} from '../../api/greenApi'
import { MailElement } from '../../MailElement/ui/MailElement'
import IconSend from '../../assets/send.svg'
import './Chat.css'

type Message = {
  id: string
  text: string
  isIncoming: boolean
}

interface ChatProps {
  id: string
  apiToken: string
  phone: string
  chatId: string
  avatar: string
  userName: string
}

export function Chat({ id, apiToken, chatId, avatar, userName }: ChatProps) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    let cancelled = false

    const handleReceiveNotification = async () => {
      while (!cancelled) {
        if (cancelled) return

        try {
          const notification = await receiveNotification(id, apiToken)

          if (notification === null) {
            continue
          }

          const { receiptId, body } = notification

          await deleteNotification(id, apiToken, receiptId)

          const isText =
            body.typeWebhook === 'incomingMessageReceived' &&
            body.senderData?.chatId === chatId &&
            body.messageData?.typeMessage === 'textMessage'
          const text = body.messageData?.textMessageData?.textMessage

          if (isText && text) {
            setMessages((prev) => [...prev, { id: body.idMessage, text, isIncoming: true }])
          }
        } catch (err) {
          if (cancelled) return
          console.error(err)
          await new Promise((resolve) => setTimeout(resolve, 3000))
        }
      }
    }

    handleReceiveNotification()

    return () => {
      cancelled = true
    }
  }, [id, apiToken, chatId])

  const handleSend = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    const text = message.trim()

    if (text === '' || isSending) {
      return
    }

    setIsSending(true)
    setError(null)

    try {
      const { idMessage } = await sendMessage(chatId, text, id, apiToken)

      setMessages((prev) => [...prev, { id: idMessage, text: text, isIncoming: false }])
      setMessage('')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Не удалось отправить сообщение.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="chat-box">
      <div className="chat-header">
        <img alt="avatar" src={avatar} className="chat-header__avatar" />
        <div className="chat-header__userName">{userName}</div>
      </div>

      <div className="chat-window-wrapper">
        <div className="chat-window-box">
          {messages.map((mail) => (
            <MailElement key={mail.id} text={mail.text} isIncoming={mail.isIncoming} />
          ))}
        </div>

        <form onSubmit={handleSend} className="chat-actions-box">
          <input
            value={message}
            onChange={(ev) => setMessage(ev.target.value)}
            maxLength={MAX_MESSAGE_LENGTH}
            type="text"
            className="chat-actions-box__input "
          />
          <button
            disabled={isSending || message.trim() === ''}
            className="chat-actions-box__button"
            style={message.length === 0 ? { display: 'none' } : { display: 'flex' }}
          >
            <img src={IconSend} />
          </button>
        </form>

        {error !== null && <p className="auth-error">{error}</p>}
      </div>
    </div>
  )
}
