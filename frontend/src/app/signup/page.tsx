import SignUpForm from "@/components/SignUpForm/SignUpForm";

export default function SignUp() {
    return (
        process.env.NEXT_PUBLIC_APP_MODE === 'INVITATION' ?
        <SignUpForm mode="INVITATION"></SignUpForm> :
        <SignUpForm mode="CLIENT"></SignUpForm>
    );
}