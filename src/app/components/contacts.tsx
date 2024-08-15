import { ContactDTO, getAllContacts, getContacts } from "@/client-sdk/message";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  ClickAwayListener,
  Tooltip,
} from "@mui/material";
import Zoom from "@mui/material/Zoom";
import { Observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import SearchBar from "./search";

interface ContactsProps {
  senderId: string;
  onSelectContact: (contactId: string) => void;
}

export function Contacts({ senderId, onSelectContact }: ContactsProps) {
  const [contacts, setContacts] = useState<ContactDTO[]>([]);
  const [allContacts, setAllContacts] = useState<ContactDTO[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const fetchMyContacts = async () => {
      if (senderId) {
        const contacts = await getContacts(senderId);
        setContacts(contacts || []);
      }
    };
    const fetchAllContacts = async () => {
      if (senderId) {
        const contacts = await getAllContacts();
        setAllContacts(contacts || []);
      }
    };

    fetchMyContacts();
    fetchAllContacts();
  }, [senderId]);

  const handleSearchIconClick = () => {
    setSearchOpen((prev) => !prev);
  };

  const handleSearch = (value: string) => {
    if (value) {
      const filteredContacts = allContacts.filter((contact) =>
        contact.name.toLowerCase().includes(value.toLowerCase())
      );
    }
  };

  const handleSelectContact = (contactId: string) => {
    setSearchOpen(false);
    const selectedContact = allContacts.find(
      (contact) => contact.customerId === contactId
    );
    if (
      selectedContact &&
      !contacts.some((contact) => contact.customerId === contactId)
    ) {
      setContacts([...contacts, selectedContact]);
    }
    onSelectContact(contactId);
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          fontWeight="bold"
          color="primary"
        >
          My Contacts
        </Typography>
        <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
          <Box>
            <Tooltip
              TransitionComponent={Zoom}
              open={searchOpen}
              title={
                <SearchBar
                  options={allContacts}
                  onSearch={handleSearch}
                  onSelectContact={handleSelectContact}
                />
              }
              placement="bottom-end"
            >
              <IconButton onClick={handleSearchIconClick}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </ClickAwayListener>
      </Box>
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
