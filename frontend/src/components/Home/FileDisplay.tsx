'use client'

import { FILES } from "@/model/chainFile";
import { UserDto } from "@/openapi";
import { useRouter } from "next/navigation";
import Button from "../Button/Button";
import Container from "../Container/Container";
import FileCardContainer from "../FileCard/FileCardContainer";
import Logo from "../Logo/Logo";

interface Props {
    user?: UserDto;
    handleLogout: () => void;
}

export default function FileDisplay({...props}: Props) {
    const router = useRouter();

    function handleUpload() {
        router.push("/upload")
      }

    return (
        <Container fullScreen={true}>
            <div className="flex flex-row justify-around items-center w-full">
                <Logo/>
                <p className="text-gray-600 mt-4">{props.user?.email}&nbsp;<strong>[{props.user?.organization}]</strong></p>
            </div>
            <hr className="w-full h-1 border-gray-500 shadow-xl mb-4 mt-4"></hr>
            <div className="flex flex-row justify-around items-center w-full">
                <h2 className="text-2xl text-gray-700 font-bold w-full underline">Recently files</h2>
                <div className="flex felx-wrap w-2/4 gap-2">
                <Button text="Upload new file" onClick={handleUpload} style="primary"></Button>
                <Button text="Logout" onClick={props.handleLogout} style="secondary"></Button>
                </div>
            </div>
            <FileCardContainer files={FILES}></FileCardContainer>
        </Container>
    )
}