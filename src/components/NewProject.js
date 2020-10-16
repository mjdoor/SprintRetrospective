import React, { useReducer } from "react";

import {
  TextField,
  Button,
  Modal,
  MuiThemeProvider,
  Typography,
  Paper
} from "@material-ui/core";
import theme from "../themes/theme";
import styles from "../styles/styles";

import dateFormat from "dateformat";

import { db } from "../firebase";

const NewProject = props => {
  const initialState = {
    teamName: "",
    teamMembers: [],
    teamNumber: "",
    productName: "",
    projectStartDate: null,
    initialVelocity: null,
    hoursPerStoryPoint: null
  };
  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);

  const submitHandler = () => {
    let startDate = dateFormat(Date.now(), "mmmm d, yyyy");

    // add new project to firestore database
    db.collection("projects")
      .doc(state.productName)
      .set({ ...state, projectStartDate: startDate, teamMembers: [] })
      .then(() => {
        props.onClose();
      })
      .catch(e => {
        console.log(`Error adding project: ${e.message}`);
      });
  };

  const allFilled =
    state.teamName !== "" &&
    state.teamNumber !== "" &&
    state.productName !== "" &&
    state.initialVelocity !== null &&
    state.hoursPerStoryPoint !== null;

  return (
    <MuiThemeProvider theme={theme}>
      <Modal open={props.open} onClose={props.onClose}>
        <Paper style={styles.modal}>
          <Typography variant="h6" style={{ textAlign: "center" }}>
            New Project
          </Typography>
          <div style={styles.centerColumnContent}>
            <TextField
              style={styles.textfieldSpacing}
              label="Team Name"
              onChange={e => setState({ teamName: e.target.value })}
            ></TextField>
            <TextField
              style={styles.textfieldSpacing}
              label="Team Number"
              onChange={e => setState({ teamNumber: e.target.value })}
            ></TextField>
            <TextField
              style={styles.textfieldSpacing}
              label="Product Name"
              onChange={e => setState({ productName: e.target.value })}
            ></TextField>
            <TextField
              style={styles.textfieldSpacing}
              label="Initial Velocity"
              type="number"
              onChange={e =>
                setState({ initialVelocity: parseInt(e.target.value) })
              }
            ></TextField>
            <TextField
              style={styles.textfieldSpacing}
              label="Hours per story point"
              type="number"
              onChange={e =>
                setState({ hoursPerStoryPoint: parseInt(e.target.value) })
              }
            ></TextField>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={!allFilled}
              onClick={submitHandler}
            >
              Save
            </Button>
          </div>
        </Paper>
      </Modal>
    </MuiThemeProvider>
  );
};

export default NewProject;
