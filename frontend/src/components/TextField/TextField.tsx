'use client'
import { Ref, forwardRef, useState } from "react";

interface Props {
    label: string;
    defaultValue?: string;
    onChange: (value: any) => void;
}

type TextFiledFunctions = {
    reset: () => void;
}

const TextField = forwardRef((props: Props, forwardedRef: Ref<TextFiledFunctions>) => {
    const [value, setValue] = useState<string | undefined>(props.defaultValue);

    function handleOnChange(event: any) {
        const val: string = event.target.value;
        setValue(val);
        props.onChange(val);
    }   
    
    return (
        <div className="w-3/4">
            <p className="capitalize text-gray-500 text-sm ml-1 mb-1">{value ? props.label : undefined}</p>
            <input type="text" value={value} defaultValue={props.defaultValue} onChange={handleOnChange} placeholder={props.label}
                className="border-solid border-2 border-gray-200 rounded-md w-full h-10 mb-6 text-gray-700 p-2 shadow-md"></input>
        </div>
    );
});

export default TextField;