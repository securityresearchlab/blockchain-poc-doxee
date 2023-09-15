'use client'
import { Ref, forwardRef, useState } from "react";

interface Props {
    label: string;
    defaultValue?: string;
    required?: boolean;
    password?: boolean;
    onChange: (value: any) => void;
}

export default function TextField({...props}: Props) {
    const [value, setValue] = useState<string>(props.defaultValue ? props.defaultValue : '');

    function handleOnChange(event: any) {
        const val: string = event.target.value;
        setValue(val);
        props.onChange(val);
    }   
    
    return (
        <div className="w-full">
            <p className="capitalize text-gray-500 text-sm ml-1 mb-1">{value ? props.label : undefined}</p>
            <input type={props.password ? "password" : "text"} value={value} defaultValue={props.defaultValue} onChange={handleOnChange} placeholder={props.label}
                className="border-solid border-2 border-gray-200 rounded-md w-full h-10 text-gray-700 p-2 shadow-md" required={props.required ? props.required : false}></input>
        </div>
    );
}