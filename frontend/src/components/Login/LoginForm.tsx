'use client';

import { useState } from "react";
import Button from "../Button/Button";
import Container from "../Container/Container";
import Logo from "../Logo/Logo";
import TextField from "../TextField/TextField";
import { useRouter } from "next/navigation";
import PopUpMessage from "../PopUpMessage/PopUpMessage";
import { AuthService } from "@/openapi";
import { useDispatch } from "react-redux";
import { LOADER_VISIBLE } from "@/reducers/actions";

export default function LoginForm() {
    const router = useRouter();
    const dispatch = useDispatch();

    const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    const [verify, setVerify] = useState<boolean>(false);
    const [code, setCode] = useState<string>();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [popUpDisplay, setPopUpDisplay] = useState<boolean>(false);
    const [popUpSeverity, setPopUpSeverity] = useState<'error' | 'warning' | 'success' | 'info'>('info');
    const [popUpMessage, setPopUpMessage] = useState<string>('');

    function handleLogin() {
        setPopUpDisplay(false);
        if(email && expression.test(email)) {
            dispatch({
                type: LOADER_VISIBLE,
                visible: true,
            });
            AuthService.authControllerLogin({
                email: email,
                password: password,
            }).then(res => {
                setVerify(true);
                dispatch({
                    type: LOADER_VISIBLE,
                    visible: false,
                });
            }).catch(err => {
                setPopUpMessage("Error during login: " + err.message);
                setPopUpSeverity('error');
                setPopUpDisplay(true);
                dispatch({
                    type: LOADER_VISIBLE,
                    visible: false,
                });
            })
        } else {
            setPopUpMessage('Inserted email is not valid');
            setPopUpSeverity('warning');
            setPopUpDisplay(true);
        }
    }

    function handleGenerateNewCode() {
        dispatch({
            type: LOADER_VISIBLE,
            visible: true,
        });
        setPopUpDisplay(false);
        AuthService.authControllerLogin({
            email: email,
            password: password,
        }).then(res => {
            setPopUpMessage("A new code was sent to: " + email);
            setPopUpSeverity('info');
            setPopUpDisplay(true);
            dispatch({
                type: LOADER_VISIBLE,
                visible: false,
            });
        }).catch(err => {
            setPopUpMessage('Error during the generation of new code.\nPlease retry later');
            setPopUpSeverity('error');
            setPopUpDisplay(true);
            dispatch({
                type: LOADER_VISIBLE,
                visible: false,
            });
        })
    }

    function handleRegister() {
        router.push("/signup");
    }

    async function handleVerify() {
        dispatch({
            type: LOADER_VISIBLE,
            visible: true,
        });
        setPopUpDisplay(false);
        AuthService.authControllerLogin({
            email: email,
            password: password,
            code: code,
        }).then((res) => {
            localStorage.setItem('X-AUTH-TOKEN', res['access_token']);
            router.push('/');
            dispatch({
                type: LOADER_VISIBLE,
                visible: false,
            });
        }).catch((err) => {
            setPopUpMessage('Inserted code is not valid');
            setPopUpSeverity('error');
            setPopUpDisplay(true);
            dispatch({
                type: LOADER_VISIBLE,
                visible: false,
            });
        });
    }

    return (
        <>
            <PopUpMessage serverity={popUpSeverity} title={popUpSeverity.toUpperCase()} message={popUpMessage} display={popUpDisplay}/>
            <Container>
                <Logo/>
                <hr className="border-gray-500 h-0.5 w-full mb-4 shadow-xl"/>
                {!verify && 
                    <form id="loginForm">
                        <p className="text-gray-500 text-sm font-light mb-8 whitespace-normal">Please login with your email to access the services</p>
                        <div className="flex flex-col gap-2 w-full">
                            <TextField label="Email" onChange={setEmail}></TextField>
                            <TextField label="Password" onChange={setPassword} password={true}></TextField>
                        </div>
                        <div className="flex flex-col gap-2 w-full mt-8">
                            <Button text="login" style="primary" onClick={handleLogin}/>
                            <span className="w-full text-center hover:text-sky-600 text-sky-800 underline" onClick={handleRegister}>
                                Do not have an account? Sign up
                            </span>
                        </div>
                    </form>
                }
                {verify && 
                    <form id="loginCodeVerificationForm">
                        <p className="text-gray-500 text-sm font-light mb-8 whitespace-normal">Insert the code we have sent to your email: <strong>{email}</strong></p>
                        <TextField label="Code" onChange={setCode}></TextField>
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
    );
}