import { ChainFile } from "@/model/chainFile";
import Button from "../Button/Button";

interface Props {
    file: ChainFile,
}

export default function FileCard({...props}: Props) {

    function handleDownloadFile() {
        alert("Download " + props.file.name);
    }

    return (
        <div className="bg-white border-solid border-2 border-gray-700 text-gray-700 rounded-lg flex p-3 w-1/5 shadow-xl">
            <div className="flex flex-col w-full">
                <div className="flex felx-row justify-between w-full flex-wrap">
                    <div><strong className="mb-4 text-xl">{props.file.id}</strong></div>
                    <div>{props.file.uploadDate?.toLocaleDateString()}</div>
                </div>
                <div className="mb-2">{props.file.name + " (" + props.file.size + ")"}</div>
                <div className="mb-2 font-semibold">{props.file.owner}</div>
                <Button style="secondary" text="Download" onClick={handleDownloadFile}></Button>
            </div>
        </div>
    );
}