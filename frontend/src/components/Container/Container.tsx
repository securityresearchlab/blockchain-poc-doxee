import { Component, ReactNode } from "react";

interface Props {
    children?: ReactNode,
}

export default function Container({children, ...props}: Props) {
    return (
        <div className="flex justify-center content-center items-center w-screen h-screen">
            <div className="flex flex-col flex-nowrap justify-around items-center absolute bg-white rounded-xl shadow-xl p-6">                
                {children}
            </div>
        </div>
    )
}