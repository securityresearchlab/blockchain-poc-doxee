'use client';

import { useState } from "react";

interface Props {
    text: string,
    primary?: boolean,
    onClick: () => void,
}


export default function Button({...props}: Props) {
    const primaryStyle = "bg-orange-500 p-2 m-1 rounded-md w-3/4 uppercase hover:bg-orange-600 border-solid border-2 border-slate-950 shadow-xl";
    const defaultStyle = "bg-sky-500 p-2 m-1 rounded-md w-3/4 uppercase hover:bg-sky-600 border-solid border-2 border-slate-950 shadow-xl";

    function handleOnClick(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        props.onClick();
    }

    return (
        <button className={props.primary ? primaryStyle : defaultStyle} name={props.text} title={props.text} onClick={handleOnClick}>
            {props.text}
        </button>
    );
}