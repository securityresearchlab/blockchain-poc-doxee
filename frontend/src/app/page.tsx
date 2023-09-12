'use client';

import Button from "@/components/Button/Button";
import Container from "@/components/Container/Container";
import Logo from "@/components/Logo/Logo";
import { User } from "@/model/user";
import { OpenAPI, UsersService } from "@/openapi";
import { JwtUtilities } from "@/utils/jwtUtilities";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();

  const [user, setUser] = useState<User>();

  useEffect(() => {
    const jwtToken: string | null = localStorage.getItem('X-AUTH-TOKEN');
    const isExpired = JwtUtilities.isExpired(jwtToken);
    if(isExpired)
      handleLogout();
    if(jwtToken) {
      OpenAPI.TOKEN = localStorage.getItem("X-AUTH-TOKEN")!;
      UsersService.usersControllerGetUser(JwtUtilities.getEmail(jwtToken))
        .then(res => { setUser(res); })
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('X-AUTH-TOKEN');
    router.push("/login")
  }

  return (
    <Container>
        <Logo/>
        <hr className="bg-gray-500 h-0.5 w-full mb-4 shadow-xl"/>
        <p className="text-gray-500 text-sm font-light mb-8 whitespace-normal text-center">
          The <strong>Proposal ID</strong> was sent to your email <strong>{user?.email}</strong>
        </p>
        <div className="flex flex-col gap-2">
            <div><div className="font-semibold">Organization</div>{user?.organization}</div>
            <div><div className="font-semibold">Aws Client ID</div>{user?.awsClientId}</div>
            <div><div className="font-semibold">Proposal ID</div>{user?.proposalId}</div>
        </div>
        <div className="w-full mt-8">
          <Button text="Logout" onClick={handleLogout} style="secondary"></Button>
        </div>
    </Container>
  );
}