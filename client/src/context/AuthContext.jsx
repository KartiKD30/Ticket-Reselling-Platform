import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('access');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data);
                } catch (err) {
                    localStorage.removeItem('access');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('access', res.data.access);
            setUser(res.data.user);
            toast.success('Welcome back!');
            return true;
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Login failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('access');
        setUser(null);
        toast.success('Logged out successfully');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
