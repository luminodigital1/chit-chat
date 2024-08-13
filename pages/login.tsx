import { customerLogin, CustomerLoginRes } from "@/client-sdk/customer";
import { Box, Button, TextField, Typography } from "@mui/material";
import { Observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import React, { useState } from "react";

function CustomerLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    password: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CustomerLoginRes | null>(null);

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
    setSuccess(null);
    setError(null);

    try {
      const data = {
        password: formData.password,
        email: formData.email,
      };

      const result = await customerLogin({ customer: data });
      setSuccess(result);
      router.push(`/chat/${result.customer.customerId}`);
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
        Log In
      </Typography>
      <Observer>
        {() => (
          <>
            <TextField
              label="Email"
              name="email"
              value={formData.email}
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
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              onClick={saveForm}
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
            {error && <Typography color="error">{error}</Typography>}
            {success && (
              <Typography color="primary">
                Customer Loggen in successfully
              </Typography>
            )}
          </>
        )}
      </Observer>
    </Box>
  );
}

export default CustomerLogin;
