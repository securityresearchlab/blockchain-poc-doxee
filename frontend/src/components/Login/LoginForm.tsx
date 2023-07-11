'use client';
import { useState } from "react";
import Button from "../Button/Button";
import Container from "../Container/Container";
import Logo from "../Logo/Logo";
import TextField from "../TextField/TextField";
import { useRouter } from "next/navigation";
import PopUpMessage from "../PopUpMessage/PopUpMessage";
import sleep from "@/utils/functionUtilities";

export default function LoginForm() {
    const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    const router = useRouter();

    const [verify, setVerify] = useState<boolean>();
    const [code, setCode] = useState<string>();
    const [codeValid, setCodeValid] = useState<boolean>(false);
    const [email, setEmail] = useState<string>();
    const [emailError, setEmailError] = useState<boolean>(false);

    function handleEmail(value: any) {
        setEmailError(false);
        setEmail(value);
    }

    function handleLogin() {
        if(email && expression.test(email))
            setVerify(true);
        else 
            setEmailError(true);
    }

    function handleRegister() {
        router.push("/signup");
    }

    async function handleVerify() {
        setCodeValid(true);
        await sleep(2000);
        router.push("/");
    }

    return (
        <>
            <PopUpMessage serverity="error" title="Error" message="Inserterd email is not valid" display={emailError}></PopUpMessage>
            <PopUpMessage serverity="success" title="Success" message="Inserterd code is valid" display={codeValid}></PopUpMessage>
            <Container>
                <Logo/>
                <hr className="border-gray-500 h-0.5 w-full mb-4 shadow-xl"/>
                {!verify && 
                    <>
                        <p className="text-gray-500 text-sm font-light mb-8 whitespace-normal">Please login with your email to access the services</p>
                        <TextField label="Email" onChange={handleEmail}></TextField>
                        <Button text="login" style="primary" onClick={handleLogin}/>
                        <Button text="sign up" onClick={handleRegister}/>
                    </>
                }
                {verify && 
                    <>
                        <p className="text-gray-500 text-sm font-light mb-8 whitespace-normal">Insert the code we have sent to your email: <strong>{email}</strong></p>
                        <TextField label="Code" onChange={setCode}></TextField>
                        <Button text="Verify" onClick={handleVerify} style="primary"/>
                    </>
                }
            </Container>
        </>
    );
}