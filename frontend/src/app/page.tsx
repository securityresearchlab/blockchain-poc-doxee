'use client';

import Button from "@/components/Button/Button";
import Container from "@/components/Container/Container";
import Logo from "@/components/Logo/Logo";
import { Proposal } from "@/model/proposal";
import { User } from "@/model/user";
import { OpenAPI, UsersService } from "@/openapi";
import { JwtUtilities } from "@/utils/jwtUtilities";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();

  const [user, setUser] = useState<User>();
  const [proposal, setProposal] = useState<Proposal>();

  useEffect(() => {
    const jwtToken: string | null = localStorage.getItem('X-AUTH-TOKEN');
    const isExpired = JwtUtilities.isExpired(jwtToken);
    if(isExpired)
      handleLogout();
    if(jwtToken) {
      OpenAPI.TOKEN = localStorage.getItem("X-AUTH-TOKEN")!;
      UsersService.usersControllerGetUser(JwtUtilities.getEmail(jwtToken))
        .then((res: User) => { 
          setUser(res);
          setProposal(res?.proposals?.sort((a, b) => a.creationDate > b.creationDate ? 1 : 0).at(0));
        });
    }
  }, []);

  function handleRequestNewInvitation() {
    if(user?.email) 
      UsersService.usersControllerGenerateNewProposal(user.email).then(res => setProposal(res));
  }

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
            <div><div className="font-semibold">Proposal ID</div>{proposal?.proposalId}</div>
            <div><div className="font-semibold">Status</div>{proposal?.status}</div>
        </div>
        <div className="w-full mt-8">
          {(proposal?.status != "APPROVED" && proposal?.status != "IN_PROGRESS") &&
            <Button text="Request new invitation" onClick={handleRequestNewInvitation} style="primary"></Button>
          }
          <Button text="Logout" onClick={handleLogout} style="secondary"></Button>
        </div>
    </Container>
  );
}