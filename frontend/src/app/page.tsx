'use client';

import Button from "@/components/Button/Button";
import Container from "@/components/Container/Container";
import Logo from "@/components/Logo/Logo";
import { User } from "@/model/user";
import { useRouter } from "next/navigation";
import { useState } from "react";

const mockUser: User = new User(
  "Alessandro", "Foglia", "org.ale.foglia", "alessandro.foglia@outlook.it"
);

export default function Home() {
  const router = useRouter();

  const [user, setUser] = useState<User>(mockUser);

  function handleUpload() {
    router.push("/upload")
  }

  function handleLogout() {
    router.push("/login")
  }

  return (
    <>
      <Container fullScreen={true}>
        <div className="flex flex-row justify-around items-center w-full">
          <Logo/>
          <p className="text-gray-600 font-semibold mt-4">{user?.email + " [" + user?.organization + "]"}</p>
        </div>
        <hr className="w-full h-1 border-gray-500 shadow-xl mb-4 mt-4"></hr>
        <div className="flex flex-row justify-around items-center w-full">
          <h2 className="text-2xl text-gray-700 font-bold w-full">My files</h2>
          <div className="flex w-2/4">
            <Button text="Upload new file" onClick={handleUpload} style="primary"></Button>
            <Button text="Logout" onClick={handleLogout} style="secondary"></Button>
          </div>
        </div>
      </Container>
    </>
  );
}