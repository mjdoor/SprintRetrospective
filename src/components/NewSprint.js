import React, { useState, useEffect } from "react";

import {
  TextField,
  Button,
  Modal,
  MuiThemeProvider,
  Typography,
  Paper
} from "@material-ui/core";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import theme from "../themes/theme";
import styles from "../styles/styles";

import { db } from "../firebase";

const NewSprint = props => {
  const [endDate, setEndDate] = useState(new Date());
  const [madeDateSelection, setMadeDateSelection] = useState(false);
  const [sprintNumber, setSprintNumber] = useState("-");

  // Set up a listener to determine which sprint number a new sprint would be
  useEffect(() => {
    setEndDate(new Date());
    const unsubscribeListener = db
      .collection("projects")
      .doc(props.productName)
      .collection("sprints")
      .onSnapshot(querySnapshot => {
        setSprintNumber(querySnapshot.size + 1);
      });

    return () => {
      if (unsubscribeListener) {
        unsubscribeListener();
      }
    };
  }, [props.productName]); // adding props.productName here will cause the useEffect function to run whenever props.productName has changed

  const changeDate = date => {
    setMadeDateSelection(true);
    // set time to 6:00PM
    date.setHours(18);
    date.setMinutes(0);
    setEndDate(date);
  };

  const submitHandler = () => {
    // add new sprint to project sprint nested collection
    db.collection("projects")
      .doc(props.productName)
      .collection("sprints")
      .add({ sprintNumber, endDate })
      .then(() => {
        props.onClose();
      })
      .catch(e => {
        console.log(`Error adding sprint: ${e.message}`);
      });
  };

  return (
    <MuiThemeProvider theme={theme}>
      <Modal open={props.open} onClose={props.onClose}>
        <Paper style={styles.modal}>
          <Typography variant="h6" style={{ textAlign: "center" }}>
            New Sprint for {props.productName}
          </Typography>
          <div style={styles.centerColumnContent}>
            <TextField
              style={styles.textfieldSpacing}
              label="Sprint Number"
              value={sprintNumber}
              disabled
            ></TextField>
            <Typography
              variant="caption"
              style={{ textAlign: "left", width: "100%" }}
            >
              Due Date
            </Typography>
            <DatePicker selected={endDate} onChange={changeDate} />
            <Button
              style={{ marginTop: 10 }}
              variant="contained"
              color="primary"
              disabled={!madeDateSelection}
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

export default NewSprint;
