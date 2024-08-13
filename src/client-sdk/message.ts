import { Customer } from "./customer";
import { fetchJsonRequest } from "./fetch";

export interface MessageDTO {
  senderId: string;
  sender?: Customer;
  receiverId: string;
  receiver?: Customer;
  content: string;
  timestamp: Date;
}

export interface SendMessageDTO {
  senderId?: string;
  receiverId: string;
  content: string;
  timestamp: Date;
}

export interface ContactDTO {
  customerId: string;
  name: string;
  cellphone: string;
  email: string;
}

export async function sendMessage(
  message: SendMessageDTO
): Promise<MessageDTO[] | undefined> {
  return fetchJsonRequest(`/messages`, {
    method: "POST",
    data: message,
  });
}

export async function getAllMessages(
  senderId: string
): Promise<MessageDTO[] | undefined> {
  return fetchJsonRequest(`/messages`, {
    method: "Get",
    data: senderId,
  });
}

export async function getPersonalMessages(
  receiverId: string
): Promise<MessageDTO[] | undefined> {
  console.log("receiverId", receiverId);
  return fetchJsonRequest(
    `/messages/get-personal-messages?receiverId=${encodeURIComponent(
      receiverId
    )}`,
    {
      method: "GET",
    }
  );
}

export async function getContacts(
  senderId: string
): Promise<ContactDTO[] | undefined> {
  return fetchJsonRequest(`/messages/contacts`, {
    method: "Get",
    data: senderId,
  });
}
