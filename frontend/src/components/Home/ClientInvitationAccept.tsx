import { InvitationDto, UserDto } from "@/openapi";
import Button from "../Button/Button";
import Container from "../Container/Container";
import Logo from "../Logo/Logo";

interface Props {
    user?: UserDto;
    invitation?: InvitationDto;
    handleLogout: () => void;
    handleAcceptInvitation: () => void;
}

export default function ClientInvitationAccept({...props}: Props) {

    return (
        <Container>
            <Logo/>
            <hr className="bg-gray-500 h-0.5 w-full mb-4 shadow-xl"/>
            <p className="text-gray-500 text-sm font-light mb-8 whitespace-normal text-center">
                If your proposal was accepted from Doxee network you can start enrolling a new member
            </p>
            {props.invitation ? 
                <div className="flex flex-col gap-2">
                    <div><div className="font-semibold">Organization</div>{props.user?.organization}</div>
                    <div><div className="font-semibold">Aws Client ID</div>{props.user?.awsClientId}</div>
                    <div><div className="font-semibold">Invitation ID</div>{props.invitation?.invitationId}</div>
                    <div><div className="font-semibold">Status</div>{props.invitation?.status}</div>
                </div>
                :
                <p className="font-semibold text-center">
                    There are no invitations to display.<br/>Check your proposal status or request a new one.
                </p> 
            }
            <div className="w-full mt-8">
                {(props.invitation && props.invitation.status == InvitationDto.status.PENDING) &&
                    <Button text="Accept Invitation" onClick={props.handleAcceptInvitation} style="primary"></Button>
                }
                <Button text="Logout" onClick={props.handleLogout} style="secondary"></Button>
            </div>
        </Container>
      );
}