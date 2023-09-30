'use client';

import { InvitationDto, UserDto, UsersService } from "@/openapi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ClientInvitationAccept from "./ClientInvitationAccept";
import FileDisplay from "./FileDisplay";
import { useDispatch } from "react-redux";
import { LOADER_VISIBLE } from "@/reducers/actions";
import PopUpMessage from "../PopUpMessage/PopUpMessage";

export default function HomeClient() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [popUpDisplay, setPopUpDisplay] = useState<boolean>(false);
    const [popUpSeverity, setPopUpSeverity] = useState<'error' | 'warning' | 'success' | 'info'>('info');
    const [popUpMessage, setPopUpMessage] = useState<string>('');
    const [user, setUser] = useState<UserDto>();
    const [invitation, setInvitation] = useState<InvitationDto>();

    useEffect(() => {
        dispatch({
            type: LOADER_VISIBLE,
            visible: true,
        });
        UsersService.usersControllerGetUser()
            .then((res: UserDto) => { 
                setUser(res);
                setInvitation(res?.invitations?.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()).at(0));
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
            {(invitation && !user?.memberId) &&
                <ClientInvitationAccept 
                    user={user} 
                    invitation={invitation}
                    handleLogout={handleLogout}
                    handleAcceptInvitation={handleAcceptInvitation}/>
            }
            {user?.memberId &&
                <FileDisplay
                    user={user}
                    handleLogout={handleLogout}/> 
            }
        </>    
    );
}