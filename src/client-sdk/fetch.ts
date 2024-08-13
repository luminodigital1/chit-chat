import axios, { AxiosRequestConfig } from "axios";

export interface ICustomerJWT {
  customerId: string;
  token: string;
  issuedAt: string;
  expAt: string;
  refreshToken: string;
}

export interface IJWTStore {
  provide: () => ICustomerJWT | undefined | null;
  save: (jwt: ICustomerJWT) => void;
  logout: () => void;
}
export interface ISDKConfig {
  BaseUrl: string;
  AutoClientSdk: string;
  WebCustomer: string;
  jwtStore: IJWTStore;
  log: boolean;
}

export class DefaultJWTStore implements IJWTStore {
  constructor(private jwt?: ICustomerJWT) {}

  provide() {
    if (!this.jwt) {
      const storedJWT = sessionStorage.getItem("customerJWT");
      if (storedJWT) {
        this.jwt = JSON.parse(storedJWT);
      }
    }
    return this.jwt;
  }

  save(jwt: ICustomerJWT) {
    this.jwt = jwt;
    sessionStorage.setItem("customerJWT", JSON.stringify(jwt));
  }

  logout() {
    this.jwt = undefined;
    sessionStorage.removeItem("customerJWT");
  }
}

export const ClientSdkConfig: ISDKConfig = {
  BaseUrl: "",
  AutoClientSdk: "",
  WebCustomer: "",
  jwtStore: new DefaultJWTStore(),
  log: false,
};

export type TFileFormat = "png" | "jpeg" | "pdf";
export interface IFileResult {
  data: any;
  format: TFileFormat;
}

let setupJWTInprogress = false;
const setupJWTRequests: (() => void)[] = [];
async function setupJWTStore(): Promise<void> {
  if (ClientSdkConfig.AutoClientSdk !== "true") {
    ClientSdkConfig.log &&
      console.log("No setup JWT as AUTO_CLIENT_SDK is true");
    return;
  }
  if (!ClientSdkConfig.BaseUrl) {
    ClientSdkConfig.log &&
      console.log(
        "No setup JWT as there is no base url:",
        ClientSdkConfig.BaseUrl
      );
    return;
  }
  if (!ClientSdkConfig.WebCustomer) {
    console.error("Set the env WEB_CUSTOMER to some uuid");
    return;
  }

  ClientSdkConfig.log &&
    console.log(`[chit-chat-client-sdk] setup in progress started`);
  if (setupJWTInprogress) {
    ClientSdkConfig.log &&
      console.log(`[chit-chat-client-sdk] setup in progress waiting`);
    await new Promise<void>((resolve) => {
      ClientSdkConfig.log &&
        console.log(
          `[chit-chat-client-sdk] adding to setupJWTRequests`,
          setupJWTRequests.length
        );
      setupJWTRequests.push(resolve);
    });
    return;
  }
  try {
    setupJWTInprogress = true;
    ClientSdkConfig.log &&
      console.log(`[chit-chat-client-sdk] setup in progress doing`);

    ClientSdkConfig.jwtStore = new DefaultJWTStore();
    // await launchCustomer({ customer: ClientSdkConfig.WebCustomer });
  } finally {
    setupJWTInprogress = false;
    ClientSdkConfig.log &&
      console.log(`[chit-chat-client-sdk] setup in progress done`);
    while (setupJWTRequests.length > 0) {
      ClientSdkConfig.log &&
        console.log(
          `[chit-chat-client-sdk] setup in progress resuming ${setupJWTRequests.length}`
        );
      const p = setupJWTRequests.shift();
      p?.();
    }
  }
}

export async function fetchJsonRequest(
  url: string,
  config?: AxiosRequestConfig
): Promise<any> {
  const newConfig = config || { method: "GET" };
  return fetchJsonRequestWithRefreshTokenTry({ url, ...newConfig });
}

async function fetchJsonRequestWithRefreshTokenTry(
  config: AxiosRequestConfig,
  second: boolean = false
): Promise<any> {
  try {
    if (!ClientSdkConfig.BaseUrl) {
      throw Error("set the base url in ClientConfig");
    }
    const jwtStore = ClientSdkConfig?.jwtStore?.provide();
    if (jwtStore?.expAt) {
      const expAt = new Date(jwtStore.expAt);
      const now = new Date().getTime() + 600000;
      if (expAt.getTime() < now) {
        if ((jwtStore as any).customerId) {
          await getNewToken();
        }
      }
    }

    const authToken = ClientSdkConfig.jwtStore.provide()?.token;
    config.baseURL = ClientSdkConfig.BaseUrl;

    let headers = config.headers || {};
    const hasContentType =
      Object.keys(headers).findIndex(
        (k) => k.toLowerCase() === "content-type"
      ) !== -1;
    if (!hasContentType) {
      headers["Content-Type"] = "application/json";
    }
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const newConfig = { ...config, headers };
    ClientSdkConfig.log &&
      console.log(`[chit-chat-client-sdk] fetching`, newConfig);
    const result = await axios(newConfig);
    ClientSdkConfig.log &&
      console.log(`[chit-chat-client-sdk] fetched`, result.status);
    if (result.status >= 200 && result.status < 300) {
      const contentType = result.headers["content-type"];
      if (
        contentType &&
        contentType.indexOf("application/json") === -1 &&
        contentType.indexOf("text/html") === -1
      ) {
        const fileResult: IFileResult = {
          data: result.data,
          format: result.headers.format as TFileFormat,
        };
        return fileResult;
      } else if (
        contentType &&
        contentType.indexOf("application/json") !== -1
      ) {
        const data = result.data;
        return data;
      } else if (contentType && contentType.indexOf("text/html") !== -1) {
        const text = result.data;
        return text;
      }
    } else {
      console.error(`I should not be here ${result.status}`);
    }
  } catch (err: any) {
    const result = err.response;
    const data = result?.data;
    if (data) {
      try {
        if (!second) {
          if (
            result.status === 401 &&
            (ClientSdkConfig.jwtStore?.provide() as any)?.customerId
          ) {
            ClientSdkConfig.log &&
              console.log(`[chit-chat-client-sdk] refreshing token`);
            await getNewToken();
            return fetchJsonRequestWithRefreshTokenTry(config, true);
          }
        }
      } catch (err: any) {}
      ClientSdkConfig.log &&
        console.log(`[chit-chat-client-sdk] error on fetch`, config);
      if (typeof data.read === "function") {
        const d = data.read();
        throw new Error(JSON.stringify(d.toString()));
      } else {
        throw new Error(JSON.stringify(data));
      }
    }
    throw err;
  }
}

let renewInprogress = false;
const renewRequests: (() => void)[] = [];
async function getNewToken(): Promise<void> {
  const refreshToken = ClientSdkConfig.jwtStore.provide()?.refreshToken;
  if (!refreshToken) throw new Error("No refresh token provided");
  if (renewInprogress) {
    await new Promise<void>((resolve) => {
      ClientSdkConfig.log &&
        console.log(
          `[chit-chat-client-sdk] adding to renewRequests`,
          renewRequests.length
        );
      renewRequests.push(resolve);
    });
    return;
  }
  try {
    renewInprogress = true;
    ClientSdkConfig.log &&
      console.log(`[chit-chat-client-sdk] refreshing token`);
    const url = `${ClientSdkConfig.BaseUrl}/customers/refresh`;
    const result = await axios({
      url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: { refreshToken },
    });
    const data = result.data;
    if (result.status >= 200 && result.status < 300) {
      ClientSdkConfig.log &&
        console.log(
          `[chit-chat-client-sdk] new token \n${JSON.stringify(data, null, 2)}`
        );
      ClientSdkConfig.jwtStore.save(data);
      return;
    } else if (result.status === 404) {
      ClientSdkConfig.jwtStore.logout();
    }
    throw new Error(
      `Something wrong while fetching new token: ${JSON.stringify(data)}`
    );
  } catch (err: any) {
    const result = err?.response;
    if (result.status === 404) {
      ClientSdkConfig.jwtStore.logout();
    }
    throw new Error(
      `Something wrong while fetching new token: ${JSON.stringify(
        err.response?.data ?? err.response ?? err.message
      )}`
    );
  } finally {
    renewInprogress = false;
    ClientSdkConfig.log &&
      console.log(`[chit-chat-client-sdk] refresh token done`);
    while (renewRequests.length > 0) {
      ClientSdkConfig.log &&
        console.log(
          `[chit-chat-client-sdk] refresh token resuming ${renewRequests.length}`
        );
      const p = renewRequests.shift();
      p?.();
    }
  }
}

export function queryString(query: {
  [K: string]:
    | number
    | string
    | boolean
    | object
    | undefined
    | Array<number | string | boolean | object | undefined>;
}) {
  const qs = (Object.getOwnPropertyNames(query) as (keyof typeof query)[])
    .filter((q) => {
      const v = query[q];
      if (v === undefined) return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    })
    .map((q) => {
      const v = query[q]!;
      if (Array.isArray(v)) {
        const vv = v
          .filter((v1) => v1 !== undefined)
          .map((v1) => `${q}=${encode(v1)}`);
        return vv.join("&");
      } else {
        return `${q}=${encode(v)}`;
      }
    })
    .join("&");
  return qs;
}

function encode(v: any): string {
  if (typeof v === "boolean" || typeof v === "number") {
    v = v.toString();
  } else if (typeof v === "object") {
    v = JSON.stringify(v);
  }
  return encodeURI(v);
}
