import { CreateCustomer, launchCustomer } from "@/client-sdk/customer";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import React, { useState } from "react";

function CustomerRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    cellphone: "",
    password: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CreateCustomer | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const saveForm = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data: CreateCustomer = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        cellphone: formData.cellphone,
        password: formData.password,
        email: formData.email,
      };

      const result = await launchCustomer({ customer: data });
      setSuccess(result);
      router.push("/login");
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={(e) => e.preventDefault()}
      sx={{ maxWidth: 400, mx: "auto", mt: 4, backgroundColor: "transparent" }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Register Customer
      </Typography>
      <TextField
        label="First Name"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Last Name"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Cellphone"
        name="cellphone"
        value={formData.cellphone}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        type="password"
        label="Password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        onClick={saveForm}
        sx={{ mt: 2 }}
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </Button>
      {error && <Typography color="error">{error}</Typography>}
      {success && (
        <Typography color="primary">
          Customer registered successfully!
        </Typography>
      )}
    </Box>
  );
}

export default CustomerRegister;
