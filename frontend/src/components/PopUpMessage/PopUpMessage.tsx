interface Props {
    serverity: "error" | "warning" | "success" | "info";
    title: string;
    message: string;
    display: boolean;
}

const baseStyle = "rounded-xl border-solid border-2 px-8 py-4 shadow-xl"
const errorStyle = baseStyle + " " + "bg-red-400 text-red-900 border-red-900"
const warningStyle = baseStyle + " " + "bg-yellow-400 text-yellow-900 border-yellow-900"
const successStyle = baseStyle + " " + "bg-green-400 text-green-900 border-green-900"
const infoStyle = baseStyle + " " + "bg-sky-400 text-sky-900 border-sky-900"

const hrError = "w-full h-0.5 border-red-900 shadow-xl mb-2 mt-1";
const hrWarning = "w-full h-0.5 border-yellow-900 shadow-xl mb-2 mt-1";
const hrSuccess = "w-full h-0.5 border-green-900 shadow-xl mb-2 mt-1";
const hrInfo = "w-full h-0.5 border-sky-900 shadow-xl mb-2 mt-1";

export default function PopUpMessage({...props}: Props) {

    return (
        <>
            {props.display && 
                <div className="flex absolute justify-center mt-12 w-full z-10">
                    <div className={props.serverity === "error" ? errorStyle : 
                                    (props.serverity === "warning" ? warningStyle : 
                                    (props.serverity === "success" ? successStyle : infoStyle))}>
                        <div className="text-xl font-bold tracking-wide capitalize">{props.title}</div>
                        <hr className={props.serverity === "error" ? hrError : 
                                    (props.serverity === "warning" ? hrWarning : 
                                    (props.serverity === "success" ? hrSuccess : hrInfo))}></hr>
                        <div>{props.message}</div>
                    </div>
                </div>
            }
        </>
    );
}