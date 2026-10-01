import React, { createContext, useContext } from 'react';
const user = { id: 'local', user_metadata: { full_name: '本机用户' } };
const AuthContext = createContext({ user, loading: false });
export const useAuth = () => useContext(AuthContext);
export const AuthProvider = ({ children }) => <AuthContext.Provider value={{ user, loading: false }}>{children}</AuthContext.Provider>;
