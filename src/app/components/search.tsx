import React, { useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { ContactDTO } from "@/client-sdk/message";

const SearchBar = ({
  options,
  onSearch,
  onSelectContact,
}: {
  options: ContactDTO[];
  onSearch: (value: string) => void;
  onSelectContact: (contactId: string) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = (event: any, value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleSelectContact = (event: any, value: string | null) => {
    const selectedContact = options.find((contact) => contact.name === value);
    if (selectedContact) {
      onSelectContact(selectedContact.customerId);
    }
  };

  return (
    <Autocomplete
      sx={{
        width: "500px",
        "& .MuiAutocomplete-inputRoot": {
          width: "100% !important",
        },
        "& .MuiAutocomplete-listbox": {
          width: "500px",
          backgroundColor: "black",
        },
      }}
      options={options.map((option: ContactDTO) => option.name)}
      getOptionLabel={(option) => option}
      value={searchTerm}
      onInputChange={handleSearch}
      onChange={handleSelectContact}
      renderInput={(params) => (
        <TextField {...params} label="Search" sx={{ width: "80%" }} />
      )}
    />
  );
};

export default SearchBar;
