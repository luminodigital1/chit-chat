import { ContactDTO, getContacts } from "@/client-sdk/message";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from "@mui/material";
import { Observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";

interface ContactsProps {
  senderId: string;
  onSelectContact: (contactId: string) => void;
}

export function Contacts({ senderId, onSelectContact }: ContactsProps) {
  const [contacts, setContacts] = useState<ContactDTO[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (senderId) {
        const contacts = await getContacts(senderId);
        setContacts(contacts || []);
      }
    };

    fetchContacts();
  }, [senderId]);

  return (
    <Box
      component="div"
      sx={{
        m: 4,
        p: 2,
        backgroundColor: "#f5f5f5",
        borderRadius: 2,
        boxShadow: 3,
        // width: "30%", // Set width for sidebar
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        // align="center"
        fontWeight="bold"
        color="primary"
      >
        My Contacts
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Observer>
        {() => (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {contacts.map((contact) => (
              <Card
                key={contact.customerId}
                sx={{
                  boxShadow: 3,
                  borderRadius: 2,
                  transition: "0.3s",
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "scale(1.03)",
                    bgcolor: "background.default",
                  },
                }}
                onClick={() => onSelectContact(contact.customerId)}
              >
                <CardHeader
                  title={contact.name}
                  subheader={`Contact #: ${contact.cellphone}`}
                  sx={{ backgroundColor: "primary.main", color: "white" }}
                />
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    {/* Add more contact details here if needed */}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Observer>
    </Box>
  );
}
