import { InvitationDto, MemberDto, UserDto } from "@/openapi";
import Button from "../Button/Button";
import Container from "../Container/Container";
import Logo from "../Logo/Logo";

interface Props {
    user?: UserDto;
    invitation?: InvitationDto;
    member?: MemberDto;
    handleLogout: () => void;
    handleCreatePeerNode: () => void;
}

export default function PeerNodeCreation({...props}: Props) {

    return (
        <Container>
            <Logo/>
            <hr className="bg-gray-500 h-0.5 w-full mb-4 shadow-xl"/>
            <p className="text-gray-500 text-sm font-light mb-8 whitespace-normal text-center">
                Once the status is {MemberDto.status.AVAILABLE} you can create the peer node
            </p>
            {props.member &&
                <div className="flex flex-col gap-2">
                    <div><div className="font-semibold">Organization</div>{props.user?.organization}</div>
                    <div><div className="font-semibold">Aws Client ID</div>{props.user?.awsClientId}</div>
                    <div><div className="font-semibold">Invitation ID</div>{props.member?.memberId}</div>
                    <div><div className="font-semibold">Invitation Status</div>{props.invitation?.status}</div>
                    <div><div className="font-semibold">Member Status</div>{props.member?.status}</div>
                    {props.member?.nodes?.map(node => (
                        <>
                            <div><div className="font-semibold">Peer Node</div>{node.nodeId}</div>
                            <div><div className="font-semibold">Status</div>{node.status}</div>
                        </>
                    ))}
                </div>
            }
            <div className="w-full mt-8">
                {(props.member && props.member.status == MemberDto.status.AVAILABLE) &&
                    <Button text="Create Peer Node" onClick={props.handleCreatePeerNode} style="primary"></Button>
                }
                <Button text="Logout" onClick={props.handleLogout} style="secondary"></Button>
            </div>
        </Container>
      );
}