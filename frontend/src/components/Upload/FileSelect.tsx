'use client';

import { useState } from "react";

interface Props {
    onChange: (selectedFile : File) => void;
}

export default function FileSelect({...props}: Props) {

    const [file, setFile] = useState<File>();

    function handleFileSelect(file: any) {
        const selectedFile = file.target.files[0];
        setFile(selectedFile);
        props.onChange(selectedFile);
    }

    return(
        <>
            <div className="flex items-center justify-center w-full">
                <label id="dropzpne-file" className="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">PDF, XML (MAX. 10KB)</p>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{file ? file.name + " (" + Math.round(file.size / 1000) + "KB)" : ""}</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" onChange={handleFileSelect}/>
                </label>
            </div> 
        </>
    );
}