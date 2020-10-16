import React, { useState } from "react";
import {
  Typography,
  Button,
  Modal,
  MuiThemeProvider,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@material-ui/core/";

import theme from "../themes/theme";
import styles from "../styles/styles";
import { db } from "../firebase";
import * as firebase from "firebase";
import "firebase/firestore";

const AddMember = props => {
  const [memberName, setMemberName] = useState("");

  const addMemberToProject = () => {
    db.collection("projects")
      .doc(props.productName)
      .update({
        teamMembers: firebase.firestore.FieldValue.arrayUnion(memberName)
      })
      .then(() => {
        props.onClose();
      })
      .catch(error =>
        console.log("ERROR: failed to add member " + error.message)
      );
  };

  const allFilled = memberName !== "";

  return (
    <MuiThemeProvider theme={theme}>
      <Modal open={props.open} onClose={props.onClose}>
        <Paper style={styles.modal}>
          <Typography variant="h6" style={{ textAlign: "center" }}>
            New Team Member
          </Typography>
          <div style={styles.centerColumnContent}>
            <FormControl style={{ margin: "1% 1%", width: "100%" }}>
              <InputLabel>Member</InputLabel>
              <Select onChange={e => setMemberName(e.target.value)}>
                {props.users.map(user => {
                  return (
                    <MenuItem key={`user-${user}`} value={user}>
                      {user}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              onClick={addMemberToProject}
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
export default AddMember;
