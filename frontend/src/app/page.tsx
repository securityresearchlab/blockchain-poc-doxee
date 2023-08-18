'use client';

import Button from "@/components/Button/Button";
import Container from "@/components/Container/Container";
import Logo from "@/components/Logo/Logo";
import FileCardContainer from "@/components/FileCard/FileCardContainer";
import { FILES } from "@/model/chainFile";
import { User } from "@/model/user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { JwtUtilities } from "@/utils/jwtUtilities";

const mockUser: User = new User(
  "Alessandro", "Foglia", "org.ale.foglia", "alessandro.foglia@outlook.it"
);

export default function Home() {
  const router = useRouter();

  const [user, setUser] = useState<User>(mockUser);

  useEffect(() => {
    const isExpired = JwtUtilities.isExpired(localStorage.getItem('X-AUTH-TOKEN'))
    if(isExpired)
      handleLogout();
  }, []);

  function handleUpload() {
    router.push("/upload")
  }

  function handleLogout() {
    localStorage.removeItem('X-AUTH-TOKEN');
    router.push("/login")
  }

  return (
    <Container fullScreen={true}>
      <div className="flex flex-row justify-around items-center w-full">
        <Logo/>
        <p className="text-gray-600 mt-4">{user?.email}&nbsp;<strong>[{user?.organization}]</strong></p>
      </div>
      <hr className="w-full h-1 border-gray-500 shadow-xl mb-4 mt-4"></hr>
      <div className="flex flex-row justify-around items-center w-full">
        <h2 className="text-2xl text-gray-700 font-bold w-full underline">Recently files</h2>
        <div className="flex felx-wrap w-2/4 gap-2">
          <Button text="Upload new file" onClick={handleUpload} style="primary"></Button>
          <Button text="Logout" onClick={handleLogout} style="secondary"></Button>
        </div>
      </div>
      <FileCardContainer files={FILES}></FileCardContainer>
    </Container>
  );
}