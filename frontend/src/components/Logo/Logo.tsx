import Image from "next/image";
import logo from "../../app/assets/img/doxee-logo.webp";

export default function Logo() {
    return (
        <div className="mb-4 flex-1">
            <Image src={logo} width={200} height={100} alt=""/>
        </div>
    );
}