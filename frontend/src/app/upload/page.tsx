'use client'

import Loader from "@/components/Loader/Loader";
import UploadForm from "@/components/Upload/UploadForm";
import { OpenAPI } from "@/openapi";
import { store } from "@/reducers/store";
import { JwtUtilities } from "@/utils/jwtUtilities";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";

export default function Upload() {
    const router = useRouter();

    const [jwtExpired, setJwtExpired] = useState<boolean>(true);

    useEffect(() => {
        const jwtToken: string | null = localStorage.getItem('X-AUTH-TOKEN');
        const isExpired = JwtUtilities.isExpired(jwtToken);
        setJwtExpired(isExpired);
        if(!jwtToken || isExpired) {
        handleLogout();
        } else {
        OpenAPI.TOKEN = jwtToken;
        }
    }, []);

    function handleLogout() {
        localStorage.removeItem('X-AUTH-TOKEN');
        router.push("/login")
    }

    return (
        <Provider store={store}>
            <Loader/>
            <UploadForm></UploadForm>
        </Provider>
    );
}