'use client';

import { useState } from "react";
import Container from "../Container/Container";
import Logo from "../Logo/Logo";
import TextField from "../TextField/TextField";
import Button from "../Button/Button";
import { useRouter } from "next/navigation";
import FileSelect from "./FileSelect";
import { File } from "buffer";
import PopUpMessage from "../PopUpMessage/PopUpMessage";

export default function UploadForm() {
    const router = useRouter();

    const [owner, setOwner] = useState<string>();
    const [file, setFile] = useState<File>();
    const [fileError, setFileError] = useState<boolean>(false);
    const [fileWarning, setFileWarning] = useState<boolean>(false);

    function handleOwner(value: any) {
        setOwner(value);
    }

    function handleHome() {
        router.back();
    }

    function handleFileSelect(file: File) {
        if(file && file.size > 10000) {
            setFileWarning(false);
            setFileError(true);
        } else if (file) {
            setFileError(false);
            setFileWarning(false);
            setFile(file);
        }
    }

    function handleUpload() {
        if(file) {
            setFileWarning(false);
            alert("Upload file " + file?.name + " for " + owner);
        } else {
            setFileWarning(true);
        }
    }

    return (
        <>
            <PopUpMessage display={fileError} serverity="error" title="File not accepted" message="The selected file exceeds the maximum allowed size"></PopUpMessage>
            <PopUpMessage display={fileWarning} serverity="warning" title="File not selected" message="You need to select a file to upload"></PopUpMessage>
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