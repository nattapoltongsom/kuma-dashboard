import { permanentRedirect } from "next/navigation";

export default function Root() {
  permanentRedirect("/summary");
  return;
}
