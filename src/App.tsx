import { useState } from 'react'

import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { Auth } from './Auth/ui/Auth'
import { Chat } from './Chat/ui/Chat'

import './App.css'

function App() {
  const [id, setId] = useState('')
  const [apiToken, setApiToken] = useState('')
  const [phone, setPhone] = useState('')
  const [chatId, setChatId] = useState('')
  const [avatar, setAvatar] = useState('')
  const [userName, setUserName] = useState('')

  return (
    <BrowserRouter>
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route
            path="/auth"
            element={
              <Auth
                id={id}
                apiToken={apiToken}
                phone={phone}
                setApiToken={setApiToken}
                setId={setId}
                setPhone={setPhone}
                setChatId={setChatId}
                setAvatar={setAvatar}
                setUserName={setUserName}
              />
            }
          />
          <Route
            path="/chat"
            element={
              <>
                <Chat
                  id={id}
                  apiToken={apiToken}
                  phone={phone}
                  chatId={chatId}
                  avatar={avatar}
                  userName={userName}
                />
              </>
            }
          />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
