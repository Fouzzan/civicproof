import { SignUp } from "@clerk/nextjs";

export const metadata = { title: "Create an account" };

export default function SignUpPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl justify-center px-4 py-12">
      <SignUp />
    </div>
  );
}
