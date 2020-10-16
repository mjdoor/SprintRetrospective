import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  TextField,
  Button,
  MuiThemeProvider,
  Paper,
  Typography,
} from "@material-ui/core";
import theme from "../../themes/theme";
import styles from "../../styles/styles";
import ACTIONS from "../../redux/actions";
import { firebaseApp } from "../../firebase";

const Login = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { loginError, errorMsg } = useSelector((state) => state);
  const dispatch = useDispatch();

  const onLoginClick = () => {
    dispatch(ACTIONS.loggingIn());
    firebaseApp
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((res) => {
        if (res.user) {
          props.onComplete();
        }
      })
      .catch((e) => {
        dispatch(ACTIONS.loginError(e.message));
      });
  };

  const clearErrors = () => {
    dispatch(ACTIONS.clearErrors());
  };

  return (
    <MuiThemeProvider theme={theme}>
      <Paper elevation={0} style={styles.centerColumnContent}>
        <Typography variant="h3" style={{ marginBottom: 30 }}>
          Login
        </Typography>
        <TextField
          style={styles.textfieldSpacing}
          placeholder="Email address"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          onSelect={clearErrors}
        />
        <TextField
          style={styles.textfieldSpacing}
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          onSelect={clearErrors}
        />
        <Button variant="contained" color="primary" onClick={onLoginClick}>
          Sign In
        </Button>
        {loginError && (
          <Typography variant="caption" style={{ marginTop: 5, color: "red" }}>
            {errorMsg}
          </Typography>
        )}
      </Paper>
    </MuiThemeProvider>
  );
};

export default Login;
