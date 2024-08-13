import { ClientSdkConfig } from "@/client-sdk/fetch";
import CustomerRegister from "./customer";

export default function Home() {
  ClientSdkConfig.BaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  return (
    <>
      <CustomerRegister />
    </>
  );
}
