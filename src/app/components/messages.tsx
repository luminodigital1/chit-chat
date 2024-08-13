import { useRef, useEffect, useState, FormEvent } from "react";
import io, { Socket } from "socket.io-client";
import { Box, Typography, Divider, IconButton } from "@mui/material";
import Send from "@mui/icons-material/Send";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import EmojiPicker from "emoji-picker-react";
import {
  getPersonalMessages,
  MessageDTO,
  sendMessage,
} from "@/client-sdk/message";
import { Customer, getCustomerById } from "@/client-sdk/customer";

export function Messages({ contactId }: { contactId: string }) {
  if (!process.env.NEXT_PUBLIC_BACKEND_SOCKET_URL) {
    throw new Error(
      "NEXT_PUBLIC_BACKEND_SOCKET_URL environment variable is not set"
    );
  }

  const socket = useRef<Socket | null>(null);
  const [prevMessages, setPrevMessages] = useState<MessageDTO[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [contact, setContact] = useState<Customer | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (!socket.current) {
      socket.current = io(
        process.env.NEXT_PUBLIC_BACKEND_SOCKET_URL || "http://localhost:3000",
        {
          query: { userId: contactId },
        }
      );

      socket.current.on("receiveMessage", (message: MessageDTO) => {
        setPrevMessages((prevMessages) => {
          const messageExists = prevMessages.some(
            (msg) =>
              msg.timestamp === message.timestamp &&
              msg.content === message.content
          );
          if (!messageExists) {
            return [...prevMessages, message];
          }
          return prevMessages;
        });
        setNewMessage("");
      });
    }

    const fetchContact = async () => {
      if (contactId) {
        const customer = await getCustomerById(contactId);
        setContact(customer);
      }
    };

    const fetchMessages = async () => {
      if (contactId) {
        const messages = await getPersonalMessages(contactId);
        setPrevMessages(messages || []);
      }
    };

    fetchContact();
    fetchMessages();

    return () => {
      socket.current?.off("receiveMessage");
      socket.current?.disconnect();
    };
  }, [contactId]);

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newMessageData = {
      receiverId: contactId,
      content: newMessage,
      timestamp: new Date(),
    } as MessageDTO;

    const sentMessageResult = await sendMessage(newMessageData);
    if (sentMessageResult) {
      socket.current?.emit("sendMessage", newMessageData);
    }
  };

  const handleEmojiClick = (event: any) => {
    if (event && event.emoji) {
      setNewMessage((prev) => prev + event.emoji);
      setShowEmojiPicker(false);
    } else {
      console.error("Selected emoji is undefined or null");
    }
  };

  return (
    <Box
      component="div"
      sx={{
        m: 4,
        p: 2,
        backgroundColor: "#f5f5f5",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        color="primary"
        fontWeight="bold"
      >
        {`${contact?.firstName} ${contact?.lastName}`}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          height: "calc(100vh - 250px)",
          overflowY: "auto", // Enable vertical scrolling
        }}
      >
        {prevMessages &&
          prevMessages.map((message, index) => {
            const isCurrentUser = message.receiverId !== contactId;
            return (
              <li
                key={index}
                style={{
                  display: "flex",
                  justifyContent: isCurrentUser ? "flex-start" : "flex-end",
                  marginBottom: "10px",
                }}
              >
                <Box
                  sx={{
                    backgroundColor: isCurrentUser ? "#e0e0e0" : "#1976d2",
                    color: isCurrentUser ? "black" : "white",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    maxWidth: "70%",
                  }}
                >
                  {message.content}
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ textAlign: isCurrentUser ? "right" : "left" }}
                  >
                    {new Date(message.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </li>
            );
          })}
      </ul>

      <form
        onSubmit={handleSendMessage}
        style={{ display: "flex", alignItems: "center" }}
      >
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message"
            required
            style={{
              width: "100%",
              padding: "10px 50px 10px 10px",
              borderRadius: "5px",
              boxSizing: "border-box",
            }}
          />
          <IconButton
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            style={{
              position: "absolute",
              right: "50px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <EmojiEmotionsIcon />
          </IconButton>
          {showEmojiPicker && (
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              style={{ position: "absolute", bottom: "100%", right: "0" }}
            />
          )}
          <button
            type="submit"
            style={{
              position: "absolute",
              right: "5px",
              top: "55%",
              transform: "translateY(-50%)",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#1976d2",
            }}
          >
            <Send />
          </button>
        </div>
      </form>
    </Box>
  );
}
