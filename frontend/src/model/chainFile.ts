export class ChainFile {
    id?: string;
    name?: string;
    owner?: string;
    uploadDate?: Date;
    size?: string;
}

export function getFiles(): Array<ChainFile> {
    return [
        {
            id: "#1",
            name: "fattura-01.pdf",
            owner: "Alessandro Foglia",
            uploadDate: new Date(Date.now()),
            size: "3 KB",
        },
        {
            id: "#2",
            name: "fattura-03.xml",
            owner: "Mario Rossi",
            uploadDate: new Date(Date.now()),
            size: "6 KB",
        },
        {
            id: "#3",
            name: "fattura-011.xml",
            owner: "Paolo Rossi",
            uploadDate: new Date(Date.now()),
            size: "2 KB",
        },
    ]
}