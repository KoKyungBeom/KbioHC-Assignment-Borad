import React, { createContext, useState, useContext, useEffect } from 'react';

// AuthContext를 export
export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const initialState = JSON.parse(sessionStorage.getItem('authState')) || {
        isAuthenticated: false,
        token: null,
        userId: null,
        nickname: null,
    };
    const [state, setState] = useState(initialState);

    const login = (token, userId, nickname) => {
        const newState = {
            isAuthenticated: true,
            token,
            userId,
            nickname, 
        };
        setState(newState);
        sessionStorage.setItem('authState', JSON.stringify(newState));
    };

    const logout = () => {
        const newState = {
            isAuthenticated: false,
            token: null,
            userId: null,
            nickname: null, 
        };
        setState(newState);
        sessionStorage.removeItem('authState');
    };

    useEffect(() => {
        const savedState = JSON.parse(sessionStorage.getItem('authState'));
        if (savedState) {
            setState(savedState);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
