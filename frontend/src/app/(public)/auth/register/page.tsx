import { redirect } from "next/navigation";

export default function RegisterPage() {
  redirect("/auth?mode=register&intro=1");
}
