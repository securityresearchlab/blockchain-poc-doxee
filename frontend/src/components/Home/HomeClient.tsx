'use client';

import { InvitationDto, MemberDto, NodeDto, UserDto, UsersService } from "@/openapi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ClientInvitationAccept from "./ClientInvitationAccept";
import FileDisplay from "./FileDisplay";
import { useDispatch } from "react-redux";
import { LOADER_VISIBLE } from "@/reducers/actions";
import PopUpMessage from "../PopUpMessage/PopUpMessage";
import PeerNodeCreation from "./PeerNodeCreation";

export default function HomeClient() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [popUpDisplay, setPopUpDisplay] = useState<boolean>(false);
    const [popUpSeverity, setPopUpSeverity] = useState<'error' | 'warning' | 'success' | 'info'>('info');
    const [popUpMessage, setPopUpMessage] = useState<string>('');
    const [user, setUser] = useState<UserDto>();
    const [invitation, setInvitation] = useState<InvitationDto>();
    const [member, setMember] = useState<MemberDto>();

    useEffect(() => {
        dispatch({
            type: LOADER_VISIBLE,
            visible: true,
        });
        UsersService.usersControllerGetUser()
            .then((res: UserDto) => { 
                setUser(res);
                setInvitation(res?.invitations?.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()).at(0));
                setMember(res.members?.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()).at(0));
                dispatch({
                    type: LOADER_VISIBLE,
                    visible: false,
                });
            });
    }, []);

    function handleAcceptInvitation() {
        dispatch({
            type: LOADER_VISIBLE,
            visible: true,
        });
        setPopUpDisplay(false);
        UsersService.usersControllerAcceptInvitation()
            .then((res: UserDto) => { 
                setUser(res);
                setInvitation(res?.invitations?.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()).at(0));
                setMember(res.members?.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()).at(0));
                dispatch({
                    type: LOADER_VISIBLE,
                    visible: false,
                });
            }).catch(err => {
                setPopUpMessage(err.body.message);
                setPopUpSeverity('error');
                setPopUpDisplay(true);
                dispatch({
                    type: LOADER_VISIBLE,
                    visible: false,
                });
            });
    }

    function handleCreatePeerNode() {
        dispatch({
            type: LOADER_VISIBLE,
            visible: true,
        });
        setPopUpDisplay(false);
        UsersService.usersControllerCreatePeerNode()
            .then((res: UserDto) => { 
                setUser(res);
                setInvitation(res?.invitations?.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()).at(0));
                setMember(res.members?.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()).at(0));
                dispatch({
                    type: LOADER_VISIBLE,
                    visible: false,
                });
            }).catch(err => {
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
            {(user?.nodes?.filter(el => el.status === NodeDto.status.AVAILABLE).length == 0 && invitation?.status == InvitationDto.status.PENDING) &&
                <ClientInvitationAccept 
                    user={user} 
                    invitation={invitation}
                    handleLogout={handleLogout}
                    handleAcceptInvitation={handleAcceptInvitation}/>
            }
            {((invitation?.status == InvitationDto.status.ACCEPTING || invitation?.status == InvitationDto.status.ACCEPTED) && member && 
                user?.nodes?.filter(el => el.status === NodeDto.status.AVAILABLE).length == 0) &&
                <PeerNodeCreation 
                    user={user} 
                    invitation={invitation}
                    member={member}
                    handleLogout={handleLogout}
                    handleCreatePeerNode={handleCreatePeerNode}/>
            }
            {user?.nodes?.filter(el => el.status === NodeDto.status.AVAILABLE) &&
                <FileDisplay
                    user={user}
                    handleLogout={handleLogout}/> 
            }
        </>    
    );
}