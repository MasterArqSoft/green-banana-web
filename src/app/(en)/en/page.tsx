import { homeMetadata } from "@/lib/seo";
import { Landing } from "@/app/landing";

export const metadata = homeMetadata("en");

export default function Home() {
  return <Landing locale="en" />;
}
