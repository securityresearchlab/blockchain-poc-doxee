'use client';

import { InvitationDto, UserDto, UsersService } from "@/openapi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ClientInvitationAccept from "./ClientInvitationAccept";
import FileDisplay from "./FileDisplay";

export default function HomeClient() {
    const router = useRouter();

    const [user, setUser] = useState<UserDto>();
    const [invitation, setInvitation] = useState<InvitationDto>();

    useEffect(() => {
        UsersService.usersControllerGetUser()
            .then((res: UserDto) => { 
                setUser(res);
                setInvitation(res?.invitations?.sort((a, b) => a.creationDate > b.creationDate ? 1 : 0).at(0));
            });
    }, []);

    function handleAcceptInvitation() {
        UsersService.usersControllerAcceptInvitation()
            .then((res: UserDto) => { 
                setUser(res);
            });
    }

    function handleLogout() {
        localStorage.removeItem('X-AUTH-TOKEN');
        router.push("/login")
    }

    return (
        <>
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