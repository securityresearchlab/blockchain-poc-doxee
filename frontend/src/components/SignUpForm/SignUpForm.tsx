'use client';

import { AuthService, SignUpUserDto } from "@/openapi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "../Button/Button";
import Container from "../Container/Container";
import Logo from "../Logo/Logo";
import PopUpMessage from "../PopUpMessage/PopUpMessage";
import TextField from "../TextField/TextField";

export default function SignUpForm() {
    const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    const router = useRouter();

    const [verify, setVerify] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [surname, setSurname] = useState <string>('');
    const [organization, setOrganization] = useState<string>('');
    const [awsClientId, setAwsClientId] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [popUpDisplay, setPopUpDisplay] = useState<boolean>(false);
    const [popUpSeverity, setPopUpSeverity] = useState<'error' | 'warning' | 'success' | 'info'>('info');
    const [popUpMessage, setPopUpMessage] = useState<string>('');

    function handleLogin() {
        router.push("/login");
    }

    function handleRegister() {
        setPopUpDisplay(false);
        if(name && surname && organization && email) {
            if(!expression.test(email)) {
                setPopUpMessage("Inserted email is not valid");
                setPopUpSeverity('warning');
                setPopUpDisplay(true);
                return;
            }
            const signUpUserDto: SignUpUserDto = {
                name: name,
                surname: surname,
                organization: organization,
                awsClientId: awsClientId,
                email: email,
            };
            AuthService.authControllerSignUp(signUpUserDto)
                .then((res) => {
                    setVerify(true);
                }).catch((err) => {
                    setPopUpMessage("Error during signUp: " + err.message);
                    setPopUpSeverity('error');
                    setPopUpDisplay(true);
                });
        } else {
            setPopUpMessage("Requested fields are not completed");
            setPopUpSeverity('warning');
            setPopUpDisplay(true);
        }
    }

    async function handleVerify() {
        setPopUpDisplay(false);
        AuthService.authControllerSignIn({
            email: email,
            code: code,
        }).then((res) => {
            localStorage.setItem('X-AUTH-TOKEN', res['access_token']);
            router.push('/');
        }).catch((err) => {
            setPopUpMessage('Inserted code is not valid');
            setPopUpSeverity('error');
            setPopUpDisplay(true);
        });
    }

    async function handleGenerateNewCode() {
        setPopUpDisplay(false);
        if(name && surname && organization && email) {
            const signUpUserDto: SignUpUserDto = {
                name: name,
                surname: surname,
                organization: organization,
                awsClientId: awsClientId,
                email: email,
            };
            AuthService.authControllerSignUp(signUpUserDto)
                .then((res) => {
                    setVerify(true);
                    setPopUpMessage("A new code was sent to: " + email);
                    setPopUpSeverity('info');
                    setPopUpDisplay(true);
                }).catch((err) => {
                    setPopUpMessage('Error during the generation of new code.\nPlease retry later');
                    setPopUpSeverity('error');
                    setPopUpDisplay(true);
                });
        } else {
            setPopUpMessage("Requested fields are not completed");
            setPopUpSeverity('warning');
            setPopUpDisplay(true);
        }
    }

    return (
        <>
            <PopUpMessage serverity={popUpSeverity} title={popUpSeverity.toUpperCase()} message={popUpMessage} display={popUpDisplay}/>
            <Container>
                <Logo/>
                <hr className="bg-gray-500 h-0.5 w-full mb-4 shadow-xl"/>
                {!verify && 
                     <form id="singUpForm">
                        <p className="text-gray-500 text-sm font-light mb-8 whitespace-normal">Insert data of your organization to complete the sign up</p>
                        <div className="flex flex-col gap-2 w-full">
                                <TextField label="Name" onChange={setName} required={true}></TextField>
                                <TextField label="Surname" onChange={setSurname} required={true}></TextField>
                                <TextField label="Organization" onChange={setOrganization} required={true}></TextField>
                                <TextField label="Aws Client ID" onChange={setAwsClientId} required={true}></TextField>
                                <TextField label="Email" onChange={setEmail} required={true}></TextField>
                        </div>
                        <div className="flex flex-col gap-2 w-full mt-8">
                            <Button text="sign up" onClick={handleRegister} style="primary"/>
                            <Button text="login" onClick={handleLogin}/>
                        </div>
                    </form>
                }
                {verify && 
                    <form id="signUpCodeVerificationForm">
                        <p className="text-gray-500 text-sm font-light mb-8 whitespace-normal">Insert the code we have sent to your email: <strong>{email}</strong></p>
                        <TextField label="Code" onChange={setCode} required={true}></TextField>
                        <div className="mt-8 w-full">
                            <Button text="Verify" onClick={handleVerify} style="primary"/>
                        </div>
                        <div className="mt-2 w-full">
                            <Button text="Request new code" onClick={handleGenerateNewCode} style="secondary"/>
                        </div>
                    </form>
                }
            </Container>
        </>
    )
}