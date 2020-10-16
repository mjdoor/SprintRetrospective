import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  TextField,
  Button,
  MuiThemeProvider,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import theme from "../../themes/theme";
import styles from "../../styles/styles";
import ACTIONS from "../../redux/actions";
import { firebaseApp, db } from "../../firebase";

const Register = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const { loginError, errorMsg } = useSelector((state) => state);
  const dispatch = useDispatch();

  const onRegisterClick = () => {
    dispatch(ACTIONS.loggingIn());
    firebaseApp
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((res) => {
        if (res.user) {
          return db.collection("users").doc(res.user.uid).set({
            name,
            role,
          });
        } else {
          throw new Error("Failed to register user");
        }
      })
      .then(() => {
        props.onComplete();
      })
      .catch((e) => {
        dispatch(ACTIONS.loginError(e.message));
      });
  };

  const clearErrors = () => {
    dispatch(ACTIONS.clearErrors());
  };

  const allFilled =
    email !== "" && password !== "" && name !== "" && role !== "";

  return (
    <MuiThemeProvider theme={theme}>
      <Paper elevation={0} style={styles.centerColumnContent}>
        <Typography variant="h3" style={{ marginBottom: 30 }}>
          Register
        </Typography>
        <TextField
          style={styles.textfieldSpacing}
          placeholder="Full Name"
          onChange={(e) => setName(e.target.value)}
          onSelect={clearErrors}
        />
        <TextField
          style={styles.textfieldSpacing}
          placeholder="Email Address"
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
        <div style={{ width: "100%" }}>
          <FormControl
            style={{ minWidth: 120, marginBottom: 30, alignSelf: "left" }}
          >
            <InputLabel>Role</InputLabel>
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <MenuItem value="member">Team Member</MenuItem>
              <MenuItem value="pmo">Project Manager</MenuItem>
            </Select>
          </FormControl>
        </div>

        <Button
          disabled={!allFilled}
          variant="contained"
          color="primary"
          onClick={onRegisterClick}
        >
          Sign Up
        </Button>
        {loginError !== "" && (
          <Typography variant="caption" style={{ marginTop: 5, color: "red" }}>
            {errorMsg}
          </Typography>
        )}
      </Paper>
    </MuiThemeProvider>
  );
};

export default Register;
