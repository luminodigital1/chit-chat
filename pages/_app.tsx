// _app.tsx
import { AppProps } from "next/app";
import React from "react";
import { enableStaticRendering } from "mobx-react-lite";
import { ClientSdkConfig } from "@/client-sdk/fetch";
import "../src/app/globals.css";

if (!ClientSdkConfig.BaseUrl) {
  ClientSdkConfig.BaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  ClientSdkConfig.WebCustomer = process.env.NEXT_PUBLIC_WEB_CUSTOMER || "";
  ClientSdkConfig.AutoClientSdk = process.env.NEXT_PUBLIC_AUTO_CLIENT_SDK || "";
}
enableStaticRendering(true);

function ChitChatApp({ Component, pageProps }: AppProps) {
  React.useEffect(() => {
    document.body.classList?.remove("loading");
  }, []);

  return <Component {...pageProps} />;
}

export default ChitChatApp;
