import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [getMessageAudio, setGetMessageAudio] = useState(null);
    const [sendMessageAudio, setSendMessageAudio] = useState(null);
    const [isExpired, setIsExpired] = useState(false);
    const baseUrl = 'http://192.168.1.130:5500';

    useEffect(() => {
        const userToken = localStorage.getItem('token');
        if (userToken) {
            try {
                const decoded = jwtDecode(userToken);
                const expTimestamp = decoded.exp;
                const currentTime = Math.floor(Date.now() / 1000);

                if (expTimestamp < currentTime) {
                    setIsExpired(true);
                    // localStorage.removeItem('token');
                    localStorage.clear();
                    
                } else {
                    setUser(decoded);
                }
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
    }, []);

    useEffect(() => {
        if (isExpired) {
            setUser(null); 
        }
    }, [isExpired]);

    return (
        <AuthContext.Provider value={{ 
            user, 
            baseUrl, 
            getMessageAudio, 
            setGetMessageAudio, 
            sendMessageAudio, 
            setSendMessageAudio }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
