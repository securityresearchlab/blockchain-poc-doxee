'use client';

import { useEffect, useState } from "react";
import Container from "../Container/Container";
import Logo from "../Logo/Logo";
import TextField from "../TextField/TextField";
import Button from "../Button/Button";
import { useRouter } from "next/navigation";
import FileSelect from "./FileSelect";
import { File } from "buffer";
import PopUpMessage from "../PopUpMessage/PopUpMessage";
import { JwtUtilities } from "@/utils/jwtUtilities";
import { ChainDocumentsService } from "@/openapi";
import { LOADER_VISIBLE } from "@/reducers/actions";
import { useDispatch } from "react-redux";

export default function UploadForm() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [owner, setOwner] = useState<string>();
    const [file, setFile] = useState<File>();
    const [popUpDisplay, setPopUpDisplay] = useState<boolean>(false);
    const [popUpSeverity, setPopUpSeverity] = useState<'error' | 'warning' | 'success' | 'info'>('info');
    const [popUpMessage, setPopUpMessage] = useState<string>('');

    useEffect(() => {
        const isExpired = JwtUtilities.isExpired(localStorage.getItem('X-AUTH-TOKEN'))
        if(isExpired)
            router.push('/login');
      }, []);

    function handleOwner(value: any) {
        setOwner(value);
    }

    function handleHome() {
        router.back();
    }

    function handleFileSelect(file: File) {
        if(file && file.size > 10000) {
            setPopUpMessage("Il file selezionato supera le dimensioni massime consentite (10KB)");
            setPopUpSeverity('warning');
            setPopUpDisplay(true);
        } else if (file) {
            setPopUpDisplay(false);
            setFile(file);
        }
    }

    function handleUpload() {
        if(file) {
            setPopUpDisplay(false);
            dispatch({
                type: LOADER_VISIBLE,
                visible: true,
            });
            ChainDocumentsService.chainDocumentControllerUploadChainDocument()
                .then(res => {
                    setPopUpMessage("File caricato correttamente");
                    setPopUpSeverity('success');
                    setPopUpDisplay(true);
                })
                .catch(err => {
                    setPopUpMessage("Error during signUp: " + err.body.message);
                    setPopUpSeverity('error');
                    setPopUpDisplay(true);
                    dispatch({
                        type: LOADER_VISIBLE,
                        visible: false,
                    });
                })
            alert("Upload file " + file?.name + " for " + owner);
        } else {
            setPopUpMessage("Selezionare un file procedere");
            setPopUpSeverity('warning');
            setPopUpDisplay(true);
        }
    }

    return (
        <>
            <PopUpMessage serverity={popUpSeverity} title={popUpSeverity.toUpperCase()} message={popUpMessage} display={popUpDisplay}/>
            <Container>
                <Logo/>
                <hr className="border-gray-500 h-0.5 w-full mb-4 shadow-xl"/>
                <p className="text-gray-500 text-sm font-light mb-8 whitespace-normal">Select a new file to upload form your device</p>
                <div className="flex flex-col w-full gap-4">
                    <TextField label="Owner" onChange={handleOwner}></TextField>
                    <FileSelect onChange={handleFileSelect}></FileSelect>
                </div>
                <div className="flex flex-col gap-2 w-full mt-8">
                    <Button text="Upload" style="primary" onClick={handleUpload}/>
                    <Button text="Home" onClick={handleHome}/>
                </div>
            </Container>
        </>
    );
}