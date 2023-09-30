'use client'

import Loader from "@/components/Loader/Loader";
import LoginForm from "@/components/Login/LoginForm";
import { store } from "@/reducers/store";
import { Provider } from "react-redux";

export default function Login() {
    return (
        <Provider store={store}>
            <Loader/>
            <LoginForm></LoginForm>
        </Provider>
    );
}