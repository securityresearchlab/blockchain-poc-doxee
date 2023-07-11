'use client';

import { ChainFile } from "@/model/chainFile";
import Container from "../Container/Container";

interface Props {
    files: Array<ChainFile>,
}

const evenRow = "flex bg-gray-100 w-full justify-around mb-1 mt-1";
const oddRow = "flex w-full justify-around mb-1 mt-1";

export default function Table({...props}: Props) {
    return (
        <>
        <div className="mt-4 flex text-md flex-col w-full">
            <div className="flex bg-gray-200 w-full justify-around mb-1 mt-1 font-bold">
                <div className="mx-1">Id</div>
                <div className="mx-1">Name</div>
                <div className="mx-1">Owner</div>
                <div className="mx-1">Upload Date</div>
                <div className="mx-1">Size</div>
            </div>
            {props.files.map((el, i) => (
                <div className={i % 2 == 0 ? evenRow : oddRow}>
                    <div className="mx-1"><strong>{el.id}</strong></div>
                    <div className="mx-1">{el.name}</div>
                    <div className="mx-1">{el.owner}</div>
                    <div className="mx-1">{el.uploadDate?.toLocaleDateString()}</div>
                    <div className="mx-1">{el.size}</div>
                </div>
            ))}
        </div>
        </>
    )
}