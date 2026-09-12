import { SignIn } from "@clerk/nextjs";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl justify-center px-4 py-12">
      <SignIn />
    </div>
  );
}
