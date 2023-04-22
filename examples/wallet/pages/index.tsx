import Image from "next/image";
import { Inter } from "next/font/google";
import { PageLayout } from "@/components/Layout";

const inter = Inter({ subsets: ["latin"] });
import { ConnectButton } from "@rainbow-me/rainbowkit";
export default function Home() {
  return (
    <PageLayout title="coinshield">
      <p className="text-center w-full p-20">Hello world</p>
    </PageLayout>
  );
}
