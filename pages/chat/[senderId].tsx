import { useState } from "react";
import { useRouter } from "next/router";
import { Box } from "@mui/material";
import { Contacts } from "@/app/components/contacts";
import { Messages } from "@/app/components/messages";

export default function ChatPage() {
  const router = useRouter();
  const senderId = Array.isArray(router.query.senderId)
    ? router.query.senderId[0]
    : router.query.senderId;

  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null
  );

  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Box sx={{ width: "30%" }}>
        <Contacts
          senderId={senderId || ""}
          onSelectContact={handleContactSelect}
        />
      </Box>

      <Box sx={{ width: "70%" }}>
        {selectedContactId && <Messages contactId={selectedContactId} />}
      </Box>
    </Box>
  );
}
