'use client';
import { useState } from "react";
import Container from "../Container/Container";
import Logo from "../Logo/Logo";
import TextField from "../TextField/TextField";
import Button from "../Button/Button";
import { useRouter } from "next/navigation";
import PopUpMessage from "../PopUpMessage/PopUpMessage";

export default function SignUpForm() {
    const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    const router = useRouter();

    const [verify, setVerify] = useState<boolean>(false);
    const [code, setCode] = useState<string>();
    const [name, setName] = useState<string>();
    const [surname, setSurname] = useState <string>();
    const [organization, setOrganization] = useState<string>();
    const [email, setEmail] = useState<string>();
    const [emailError, setEmailError] = useState<boolean>(false);

    function handleEmail(value: any) {
        setEmailError(false);
        setEmail(value);
    }

    function handleLogin() {
        router.push("/login");
    }

    function handleRegister() {
        if(email && expression.test(email))
            setVerify(true);
        else 
            setEmailError(true);
    }

    function handleVerify() {
        alert("Verifyed code: " + code);
        handleLogin();
    }

    return (
        <>
            <PopUpMessage serverity="error" title="Error" message="Inserterd email is not valid" display={emailError}></PopUpMessage>
            <Container>
                <Logo/>
                <hr className="bg-gray-500 h-0.5 w-full mb-4 shadow-xl"/>
                {!verify && 
                    <>
                        <p className="text-gray-500 text-sm font-light mb-8 whitespace-normal">Insert data of your organization to complete the sign up</p>
                        <TextField label="Name" onChange={setName}></TextField>
                        <TextField label="Surname" onChange={setSurname}></TextField>
                        <TextField label="Organization" onChange={setOrganization}></TextField>
                        <TextField label="Email" onChange={handleEmail}></TextField>
                        <Button text="sign up" onClick={handleRegister} style="primary"/>
                        <Button text="login" onClick={handleLogin}/>
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
    )
}