'use client';
import { useState } from "react";
import Container from "../Container/Container";
import Logo from "../Logo/Logo";
import TextField from "../TextField/TextField";
import Button from "../Button/Button";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
    const router = useRouter();
    const [verify, setVerify] = useState<boolean>(false);
    const [code, setCode] = useState<string>();
    const [name, setName] = useState<string>();
    const [surname, setSurname] = useState <string>();
    const [organization, setOrganization] = useState<string>();
    const [email, setEmail] = useState<string>();

    function handleLogin() {
        router.push("/login");
    }

    function handleRegister() {
        alert("Sign up: " + email);
        setVerify(true);
    }

    function handleVerify() {
        alert("Verifyed code: " + code);
        handleLogin();
    }

    return (
        <Container>
            <Logo/>
            <hr className="bg-gray-500 h-0.5 w-full mb-4 shadow-xl"/>
            {!verify && 
                <>
                    <p className="text-gray-500 text-sm font-light mb-8 whitespace-normal">Insert data of your organization to complete the sign up</p>
                    <TextField label="Name" onChange={setName}></TextField>
                    <TextField label="Surname" onChange={setSurname}></TextField>
                    <TextField label="Organization" onChange={setOrganization}></TextField>
                    <TextField label="Email" onChange={setEmail}></TextField>
                    <Button text="sign up" onClick={handleRegister} primary={true}/>
                    <Button text="login" onClick={handleLogin} primary={false}/>
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
    )
}