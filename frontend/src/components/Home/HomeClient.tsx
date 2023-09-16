import { useRouter } from "next/router";
import Button from "../Button/Button";
import Container from "../Container/Container";
import Logo from "../Logo/Logo";

interface Props {
    email: string;
}

export default function HomeClient({...props}: Props) {
    const router = useRouter();

    function handleLogout() {
        localStorage.removeItem('X-AUTH-TOKEN');
        router.push("/login")
    }

    return (
        <Container>
            <Logo/>
            <hr className="bg-gray-500 h-0.5 w-full mb-4 shadow-xl"/>
            <p className="text-gray-500 text-sm font-light mb-8 whitespace-normal text-center">
                Welcome
            </p>
            <div className="w-full mt-8">
                <Button text="Logout" onClick={handleLogout} style="secondary"></Button>
            </div>
        </Container>
      );
}