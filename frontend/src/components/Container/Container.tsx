import { Component, ReactNode } from "react";

interface Props {
    children?: ReactNode,
    fullScreen?: boolean,
}

export default function Container({children, ...props}: Props) {

    const defaultStyle = "flex flex-col flex-nowrap justify-around items-center absolute bg-white rounded-xl shadow-xl p-6";
    const fullScreenStyle = "flex flex-col flex-nowrap justify-start items-center absolute bg-white rounded-xl shadow-xl p-6 w-4/5 h-4/5";

    return (
        <div className="flex justify-center content-center items-center w-screen h-screen">
            <div className={props.fullScreen ? fullScreenStyle : defaultStyle}>                
                {children}
            </div>
        </div>
    )
}