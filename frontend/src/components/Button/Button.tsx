'use client';

import { useState } from "react";

interface Props {
    text: string,
    style?: "primary" | "secondary" | "default",
    onClick: () => void,
}


export default function Button({...props}: Props) {
    const primaryStyle = "bg-orange-600 p-2 m-1 rounded-md w-3/4 capitalize hover:bg-orange-700 border-solid border-2 border-gray-200 shadow-xl text-white tracking-wide";
    const secondaryStyle = "bg-sky-600 p-2 m-1 rounded-md w-3/4 capitalize hover:bg-sky-700 border-solid border-2 border-gray-200 shadow-xl text-white tracking-wide";
    const defaultStyle = "bg-none p-2 m-1 rounded-md w-3/4 capitalize hover:bg-gray-200 border-solid border-2 border-gray-300 shadow-xl text-gray-500 tracking-wide";

    function handleOnClick(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        props.onClick();
    }

    return (
        <button className={props.style === "primary" ? primaryStyle : (props.style === "secondary" ? secondaryStyle : defaultStyle)} 
                name={props.text} title={props.text} onClick={handleOnClick}>
            {props.text}
        </button>
    );
}