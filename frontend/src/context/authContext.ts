'use client';

import { createContext, useState } from "react";

const AuthContext = createContext('');
const { Provider } = AuthContext;

const AuthProvider = ({ childern }) => {
    const [authState, setAuthState] = useState({'access_token': ''});

    const setUserAuthInfo = ({ data: any }) => {
        const accessToken = localStorage.getItem('X-AUTH-TOKEN', data['access_token']);
        setAuthState({
            access_token,
        })
    }
}