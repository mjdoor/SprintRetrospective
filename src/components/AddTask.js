import React, { useReducer } from "react";
import {
  Typography,
  Button,
  TextField,
  Modal,
  MuiThemeProvider,
  Paper
} from "@material-ui/core/";

import theme from "../themes/theme";
import styles from "../styles/styles";
import { db } from "../firebase";

const Task = props => {
  const initialState = {
    description: "",
    initialEstimate: ""
  };
  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);

  const addTaskToProject = () => {
    db.collection("projects")
      .doc(props.productName)
      .collection("tasks")
      .add({
        ...state,
        status: "Planned",
        assignee: "",
        sprint: [],
        actualHoursWorked: 0
      })
      .then(() => {
        props.onClose();
      })
      .catch(error =>
        console.log("ERROR: failed to add task " + error.message)
      );
  };

  const allFilled = state.description !== "" && state.initialEstimate !== "";

  return (
    <MuiThemeProvider theme={theme}>
      <Modal open={props.open} onClose={props.onClose}>
        <Paper style={styles.modal}>
          <Typography variant="h6" style={{ textAlign: "center" }}>
            New Task
          </Typography>
          <div style={styles.centerColumnContent}>
            <TextField
              style={styles.textfieldSpacing}
              label="Task Description"
              multiline
              onChange={e => setState({ description: e.target.value })}
            ></TextField>
            <TextField
              style={styles.textfieldSpacing}
              label="Initial Relative Estimate (hours)"
              type="number"
              onChange={e =>
                setState({ initialEstimate: parseFloat(e.target.value) })
              }
            ></TextField>
            <Button
              variant="contained"
              color="primary"
              onClick={addTaskToProject}
              disabled={!allFilled}
            >
              Save
            </Button>
          </div>
        </Paper>
      </Modal>
    </MuiThemeProvider>
  );
};
export default Task;
