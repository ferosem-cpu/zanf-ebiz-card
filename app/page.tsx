import { redirect } from "next/navigation";

// The root of this app isn't meant to be visited directly - cards live at
// /card/[slug] and the admin panel at /card/admin. Send visitors to the
// main Zan-F site instead of showing a blank Next.js starter page.
export default function Home() {
  redirect("https://www.zanf.in");
}
