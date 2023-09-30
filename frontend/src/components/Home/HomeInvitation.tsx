'use client';

import Button from "@/components/Button/Button";
import Container from "@/components/Container/Container";
import Logo from "@/components/Logo/Logo";
import { ProposalDto, UserDto, UsersService } from "@/openapi";
import { LOADER_VISIBLE } from "@/reducers/actions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export default function HomeInvitation() {
    const router = useRouter();
    const dispatch = useDispatch();
  
    const [user, setUser] = useState<UserDto>();
    const [proposal, setProposal] = useState<ProposalDto>();
  
    useEffect(() => {
      dispatch({
        type: LOADER_VISIBLE,
        visible: true,
      });
        UsersService.usersControllerGetUser()
            .then((res: UserDto) => { 
                setUser(res);
                setProposal(res?.proposals?.sort((a, b) => a.creationDate > b.creationDate ? 1 : 0).at(0));
                dispatch({
                  type: LOADER_VISIBLE,
                  visible: false,
                });
            });
    }, []);
  
    function handleRequestNewInvitation() {
      dispatch({
        type: LOADER_VISIBLE,
        visible: true,
      });
      if(user?.email) 
        UsersService.usersControllerGenerateNewProposal()
          .then(res => {
            setProposal(res);
            dispatch({
              type: LOADER_VISIBLE,
              visible: false,
            });
          });
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