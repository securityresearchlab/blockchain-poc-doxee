'use client';
import { useState } from "react";
import Button from "../Button/Button";
import Container from "../Container/Container";
import Logo from "../Logo/Logo";
import TextField from "../TextField/TextField";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const router = useRouter();
    const [verify, setVerify] = useState<boolean>();
    const [code, setCode] = useState<boolean>();
    const [email, setEmail] = useState<string>();

    function handleLogin() {
        alert("Login: " + email);
        setVerify(true);
    }

    function handleRegister() {
        router.push("/signup");
    }

    function handleVerify() {
        alert("Verifyed code: " + code);
        router.push("/");
    }

    return (
        <Container>
            <Logo/>
            <hr className="bg-gray-500 h-0.5 w-full mb-4 shadow-xl"/>
            {!verify && 
                <>
                    <p className="text-gray-500 text-sm font-light mb-8 whitespace-normal">Please login with your email to access the services</p>
                    <TextField label="Email" onChange={setEmail}></TextField>
                    <Button text="login" primary={true} onClick={handleLogin}/>
                    <Button text="sign up" onClick={handleRegister}/>
                </>
            }
            {verify && 
                <>
                    <p className="text-gray-500 text-sm font-light mb-8 whitespace-normal">Insert the code we have sent to your email: <strong>{email}</strong></p>
                    <TextField label="Code" onChange={setCode}></TextField>
                    <Button text="Verify" onClick={handleVerify} primary={true}/>
                </>
            }
        </Container>
    );
}