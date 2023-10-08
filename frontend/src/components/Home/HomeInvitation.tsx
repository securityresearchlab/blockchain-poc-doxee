'use client';

import Button from "@/components/Button/Button";
import Container from "@/components/Container/Container";
import Logo from "@/components/Logo/Logo";
import { ProposalDto, UserDto, UsersService } from "@/openapi";
import { LOADER_VISIBLE } from "@/reducers/actions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import PopUpMessage from "../PopUpMessage/PopUpMessage";

export default function HomeInvitation() {
    const router = useRouter();
    const dispatch = useDispatch();
  
    const [popUpDisplay, setPopUpDisplay] = useState<boolean>(false);
    const [popUpSeverity, setPopUpSeverity] = useState<'error' | 'warning' | 'success' | 'info'>('info');
    const [popUpMessage, setPopUpMessage] = useState<string>('');
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
                setProposal(res?.proposals?.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()).at(0));
                dispatch({
                  type: LOADER_VISIBLE,
                  visible: false,
                });
            });
    }, []);
  
    function handleRequestNewInvitation() {
      setPopUpDisplay(false);
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
          })
          .catch(err => {
            setPopUpMessage(err.body.message);
            setPopUpSeverity('error');
            setPopUpDisplay(true);
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
      <>
        <PopUpMessage serverity={popUpSeverity} title={popUpSeverity.toUpperCase()} message={popUpMessage} display={popUpDisplay}/>
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
              <Button text="Request new invitation" onClick={handleRequestNewInvitation} style="primary"></Button>
              <Button text="Logout" onClick={handleLogout} style="secondary"></Button>
            </div>
        </Container>
      </>
    );
  }