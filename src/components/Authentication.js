import React, { useState } from "react";

import Login from "./Authentication/Login";
import Register from "./Authentication/Register";

import theme from "../themes/theme";
import {
  Button,
  MuiThemeProvider,
  Card,
  CardContent,
  Typography
} from "@material-ui/core";

const Authentication = props => {
  const [registering, setRegistering] = useState(false);

  const onSwitchRegistering = () => {
    setRegistering(!registering);
  };

  const onLoggedIn = () => {
    props.history.push("/");
  };

  return (
    <MuiThemeProvider theme={theme}>
      <div
        style={{
          width: "100%",
          height: "calc(90vh - 64px)",
          paddingTop: "10vh",
          backgroundColor: theme.palette.primary.light
        }}
      >
        <Card
          style={{
            width: "20%",
            minWidth: 400,
            margin: "auto"
          }}
        >
          <CardContent>
            {registering ? (
              <Register onComplete={onLoggedIn} />
            ) : (
              <Login onComplete={onLoggedIn} />
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                marginTop: 20
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center"
                }}
              >
                <Typography variant="body1" style={{ marginRight: 10 }}>
                  {registering ? "Already registered?" : "Not registered yet?"}
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={onSwitchRegistering}
                >
                  {registering ? "Sign In" : "Sign Up"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MuiThemeProvider>
  );
};

export default Authentication;
