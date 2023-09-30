'use client'

import Loader from "@/components/Loader/Loader";
import SignUpForm from "@/components/SignUpForm/SignUpForm";
import { store } from "@/reducers/store";
import { Provider } from "react-redux";

export default function SignUp() {
    return (
        <Provider store={store}>
            <Loader/>
            <SignUpForm></SignUpForm>
        </Provider>
    );
}