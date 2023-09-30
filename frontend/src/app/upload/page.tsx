'use client'

import Loader from "@/components/Loader/Loader";
import UploadForm from "@/components/Upload/UploadForm";
import { store } from "@/reducers/store";
import { Provider } from "react-redux";

export default function Upload() {
    return (
        <Provider store={store}>
            <Loader/>
            <UploadForm></UploadForm>
        </Provider>
    );
}