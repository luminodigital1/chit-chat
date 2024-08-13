import { ClientSdkConfig, fetchJsonRequest, ICustomerJWT } from "./fetch";

export interface CreateCustomer {
  firstName: string;
  lastName: string;
  cellphone: string;
  password: string;
  email: string;
}

export interface CustomerLogin {
  password: string;
  email: string;
}

export interface Customer {
  customerId: string;
  firstName: string;
  lastName: string;
  cellphone: string;
  password: string;
  email: string;
}

export interface CustomerLoginRes {
  jwt: ICustomerJWT;
  customer: Customer;
}

export async function launchCustomer(body: {
  customer: CreateCustomer;
}): Promise<CreateCustomer> {
  const result = await fetchJsonRequest(`/customers/register`, {
    method: "POST",
    data: body.customer,
  });
  if (result) {
    ClientSdkConfig.jwtStore.save(result);
  }
  return result;
}

export async function customerLogin(body: {
  customer: CustomerLogin;
}): Promise<CustomerLoginRes> {
  const result = await fetchJsonRequest(`/auth/login`, {
    method: "Post",
    data: body.customer,
  });
  if (result) {
    ClientSdkConfig.jwtStore.save(result.jwt);
    sessionStorage.setItem("customerJWT", JSON.stringify(result.jwt));
  }
  return result;
}

export async function getCustomer(email: string): Promise<Customer> {
  const result = await fetchJsonRequest(`/customers`, {
    method: "Get",
    data: email,
  });
  return result;
}

export async function getCustomerById(id: string): Promise<Customer> {
  const result = await fetchJsonRequest(`/customers/${id}`, {
    method: "Get",
    data: id,
  });
  return result;
}
