'use client';
import { useState } from "react";
import Button from "../Button/Button";
import Container from "../Container/Container";
import Logo from "../Logo/Logo";

export default function LoginForm() {

    const [email, setEmail] = useState<string>();

    function handleLogin() {
        alert("Login")
    }

    function handleRegister() {
        alert("Register")
    }

    return (
        <Container>
            <Logo/>
            <hr className="bg-slate-950 h-0.5 w-full mb-4"/>
            <p className="text-blue-950 text-md font-light mb-4">Effettua la login per accedere ai servizi</p>
            <Button text="Login" primary={true} onClick={handleLogin}/>
            <Button text="Register" onClick={handleRegister}/>
        </Container>
    );
}