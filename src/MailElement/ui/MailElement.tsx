import './MailElement.css'

interface MailElementProps {
  text: string
  isIncoming: boolean
}

export function MailElement({ text, isIncoming }: MailElementProps) {
  return (
    <div
      className={`mail-element ${isIncoming ? 'mail-element__incoming' : 'mail-element__outcoming'}`}
    >
      {text}
    </div>
  )
}
