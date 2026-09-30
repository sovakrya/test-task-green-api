const API_URL = 'https://4100.api.green-api.com'
export const MAX_MESSAGE_LENGTH = 1000

export type ContactInfo = {
  avatar: string
  name: string
  contactName: string
  chatId: string
  chatType: string
  lastSeen: number
  phoneNumber: number
  username: string
  isPremium: boolean
  isVerified: boolean
  isScam: boolean
  description: string
}

type Account = {
  exist: boolean
  chatId: string
  username: string
  phoneNumber: number
  fromCache: boolean
}

type SendMessageResponse = {
  idMessage: string
}

type DeleteNotificationResponse = {
  result: boolean
  reason: string
}

type NotificationBody = {
  typeWebhook: string
  instanceData: {
    idInstance: number
    wid: string
    typeInstance: string
  }
  timestamp: number
  idMessage: string
  chatId?: string
  status?: string
  sendByApi?: boolean
  senderData?: {
    chatId: string
    chatName: string
    sender: string
    senderName: string
    senderContactName: string
    senderPhoneNumber: number
  }
  messageData?: {
    typeMessage: string
    textMessageData: {
      textMessage: string
    }
  }
}

type ReceiveNotificationResponse = {
  receiptId: number
  body: NotificationBody
}

const describeFailure = (status: number, reason?: string): string => {
  if (status === 401) {
    return 'Неверный API token.'
  }

  if (status === 403) {
    return 'Метод недоступен на вашем тарифе.'
  }

  if (status === 429) {
    return 'Превышен лимит запросов, ждём.'
  }

  return reason ?? `HTTP ${status}`
}

export async function getAccount(
  phone: string | number,
  idInstance: string,
  apiTokenInstance: string,
): Promise<Account> {
  const digits = String(phone).replace(/\D/g, '')

  if (!/^\d{7,15}$/.test(digits)) {
    throw new Error(`Некорректный номер: ${phone}`)
  }

  const res = await fetch(`${API_URL}/waInstance${idInstance}/checkAccount/${apiTokenInstance}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: Number(digits) }),
  })

  if (!res.ok) {
    throw new Error(describeFailure(res.status, await res.text()))
  }

  return res.json()
}

export async function getContactInfo(
  chatId: string,
  idInstance: string,
  apiTokenInstance: string,
): Promise<ContactInfo> {
  const res = await fetch(`${API_URL}/waInstance${idInstance}/getContactInfo/${apiTokenInstance}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId: chatId }),
  })

  if (!res.ok) {
    throw new Error(describeFailure(res.status, await res.text()))
  }

  return res.json()
}

export async function sendMessage(
  chatId: string,
  message: string,
  idInstance: string,
  apiTokenInstance: string,
): Promise<SendMessageResponse> {
  const res = await fetch(`${API_URL}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId: chatId, message: message }),
  })

  if (!res.ok) {
    throw new Error(describeFailure(res.status, await res.text()))
  }

  return res.json()
}

export async function receiveNotification(
  idInstance: string,
  apiTokenInstance: string,
): Promise<ReceiveNotificationResponse | null> {
  const res = await fetch(
    `${API_URL}/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
  )

  if (!res.ok) {
    throw new Error(describeFailure(res.status, await res.text()))
  }

  const text = await res.text()

  return text === '' ? null : (JSON.parse(text) as ReceiveNotificationResponse)
}

export async function deleteNotification(
  idInstance: string,
  apiTokenInstance: string,
  receiptId: number,
): Promise<DeleteNotificationResponse> {
  const res = await fetch(
    `${API_URL}/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`,
    {
      method: 'DELETE',
    },
  )

  if (!res.ok) {
    throw new Error(describeFailure(res.status, await res.text()))
  }

  return res.json()
}
