import React, { createContext } from 'react';

export const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  return <ChatContext.Provider value={{}}>{children}</ChatContext.Provider>;
}
