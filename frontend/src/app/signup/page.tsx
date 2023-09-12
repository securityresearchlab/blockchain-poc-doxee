import SignUpForm from "@/components/SignUpForm/SignUpForm";

export default function SignUp() {
    return (
        process.env.APP_MODE === 'INVITATION' ?
        <SignUpForm mode="INVITATION"></SignUpForm> :
        <SignUpForm mode="CLIENT"></SignUpForm>
    );
}