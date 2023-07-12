'use client';

import { ChainFile } from "@/model/chainFile";
import FileCard from "./FileCard";

interface Props {
    files: Array<ChainFile>,
}

export default function FileCardContainer({...props}: Props) {
    return (
        <div className="mt-12 flex flex-row flex-wrap w-full gap-6">
            {props.files.map(el => (
                <FileCard key={el.id} file={el}></FileCard>
            ))}
        </div>
    )
}