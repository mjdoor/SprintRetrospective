import React, { useState, useEffect, Fragment } from "react";
import * as firebase from "firebase/app";
import {
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  MuiThemeProvider,
  FormHelperText
} from "@material-ui/core/";

import theme from "../themes/theme";
import { db } from "../firebase";

const UserStory = props => {
  const [loggedHours, setLoggedHours] = useState(0);
  const [reestimate, setReestimate] = useState(0);
  const [reestimateAlreadyMade, setReestimateAlreadyMade] = useState(false);

  const [shouldValidate, setShouldValidate] = useState(false);
  const noAssignee = props.assignee === "";

  useEffect(() => {
    // check if a reestimate has already been made for this story in this sprint. If so, we don't want the user to be able to make another reestimate for this sprint
    db.collection("projects")
      .doc(props.productName)
      .collection("tasks")
      .doc(props.storyId)
      .get()
      .then(doc => {
        let reestimateInfo = doc.data().reestimateInfo;
        let existingReestimate = reestimateInfo
          ? reestimateInfo.find(r => r.sprintNum === props.sprint)
          : null;
        if (reestimateInfo && existingReestimate) {
          setReestimate(existingReestimate.reestimate);
          setReestimateAlreadyMade(true);
        }
      })
      .catch(e =>
        console.log(
          `"ERROR READING REESTIMATES: ${props.description}, ${e.message}`
        )
      );
    // eslint-disable-next-line
  }, []);

  const saveStatus = status => {
    // update story status in firestore
    db.collection("projects")
      .doc(props.productName)
      .collection("tasks")
      .doc(props.storyId)
      .set({ status: status }, { merge: true })
      .catch(e =>
        console.log(`ERROR SAVING STATUS: ${props.description}, ${e.message}`)
      );
  };

  const saveSprint = sprintNum => {
    // validate that there is an assignee before assigning to a sprint
    if (noAssignee) {
      setShouldValidate(true);
    } else {
      // update story sprint in firestore
      db.collection("projects")
        .doc(props.productName)
        .collection("tasks")
        .doc(props.storyId)
        .update({ sprint: firebase.firestore.FieldValue.arrayUnion(sprintNum) })
        .catch(e =>
          console.log(
            `ERROR SAVING SPRINT NUM: ${props.description}, ${e.message}`
          )
        );
    }
  };

  const saveLoggedActualHours = hours => {
    // update story actual hours in firestore
    db.collection("projects")
      .doc(props.productName)
      .collection("tasks")
      .doc(props.storyId)
      .set({ actualHoursWorked: props.actualHours + hours }, { merge: true })
      .catch(e =>
        console.log(
          `ERROR SAVING ACTUAL HOURS: ${props.description}, ${e.message}`
        )
      );
  };

  const saveAssignee = name => {
    // update story assignee in firestore
    db.collection("projects")
      .doc(props.productName)
      .collection("tasks")
      .doc(props.storyId)
      .set({ assignee: name }, { merge: true })
      .catch(e =>
        console.log(`ERROR SAVING ASSIGNEE: ${props.description}, ${e.message}`)
      );
  };

  const saveReestimate = reestimate => {
    db.collection("projects")
      .doc(props.productName)
      .collection("tasks")
      .doc(props.storyId)
      .update({
        reestimateInfo: firebase.firestore.FieldValue.arrayUnion({
          sprintNum: props.sprint,
          reestimate,
          hoursWorkedToDate: props.actualHours,
          status: props.status
        })
      })
      .then(() => setReestimateAlreadyMade(true))
      .catch(e =>
        console.log(
          `ERROR SAVING REESTIMATE: ${props.description}, ${e.message}`
        )
      );
  };

  return (
    <MuiThemeProvider theme={theme}>
      <div style={{ flex: 1, flexDirection: "row" }}>
        <div style={{ margin: "0 1%", width: "20%", float: "left" }}>
          <Typography variant="caption">Description</Typography>
          <Typography variant="body1">{props.description}</Typography>
        </div>

        <FormControl
          disabled={props.endedSprint}
          style={{ margin: "0 1%", width: "15%", maxWidth: 150 }}
        >
          <InputLabel>Status</InputLabel>
          <Select
            value={props.status}
            onChange={e => saveStatus(e.target.value)}
          >
            <MenuItem value="Planned">Planned</MenuItem>
            <MenuItem value="Started">Started</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
          </Select>
        </FormControl>
        <FormControl
          disabled={props.endedSprint}
          style={{ margin: "0 1%", width: "15%", maxWidth: 180 }}
        >
          <InputLabel>Assignee</InputLabel>
          <Select
            value={props.assignee}
            onChange={e => saveAssignee(e.target.value)}
          >
            <MenuItem value="" disabled>
              Unassigned
            </MenuItem>
            {props.members.map(member => {
              return (
                <MenuItem key={`mem-${member}`} value={member}>
                  {member}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <FormControl
          style={{ margin: "0 1%", width: "15%", maxWidth: 150 }}
          error={noAssignee && shouldValidate}
          disabled={props.endedSprint && props.status === "Delivered"}
        >
          <InputLabel>Sprint</InputLabel>
          <Select
            value={props.sprint}
            onChange={e => {
              if (e.target.value !== "") {
                saveSprint(parseInt(e.target.value));
              }
            }}
          >
            <MenuItem value={0} disabled>
              Product Backlog
            </MenuItem>
            {props.sprints
              .sort((lhs, rhs) => lhs.sprintNumber - rhs.sprintNumber)
              .map((sprintInfo, idx) => {
                return (
                  <MenuItem
                    key={`idx-${idx}`}
                    value={sprintInfo.sprintNumber}
                    disabled={
                      sprintInfo.sprintNumber <=
                      props.sprint /* don't allow the user to select a sprint for a story that is earlier than the sprint it's already in*/
                    }
                  >
                    Sprint {sprintInfo.sprintNumber}
                  </MenuItem>
                );
              })}
          </Select>
          {noAssignee && shouldValidate && (
            <FormHelperText>
              Assignee must be selected before selecting a sprint
            </FormHelperText>
          )}
        </FormControl>
        <TextField
          style={{ margin: "0 1%", width: 120 }}
          label="Initial Estimated Hours"
          value={props.initialHours}
          disabled
        />
        {props.sprint !== 0 && (
          <Fragment>
            <TextField
              style={{ margin: "0 1%", width: 100 }}
              label="Actual Hours Worked"
              type="number"
              value={props.actualHours}
              disabled
            />
            {props.status !== "Delivered" && (
              <TextField
                disabled={props.endedSprint || reestimateAlreadyMade}
                style={{ margin: "0 1%", width: 100 }}
                label="Log Hours"
                type="number"
                value={loggedHours}
                onChange={e => {
                  if (e.target.value !== "") {
                    setLoggedHours(parseFloat(e.target.value));
                  } else {
                    setLoggedHours("");
                  }
                }}
                onBlur={e => {
                  setLoggedHours(0);
                  if (e.target.value !== "") {
                    saveLoggedActualHours(parseFloat(e.target.value));
                  }
                }}
              />
            )}
            {props.allowReestimate && props.status !== "Delivered" && (
              <TextField
                disabled={reestimateAlreadyMade}
                style={{ margin: "0 1%", width: 150 }}
                label="Re-estimated Hours to Complete"
                type="number"
                value={reestimate}
                onChange={e => {
                  if (e.target.value !== "") {
                    setReestimate(parseFloat(e.target.value));
                  } else {
                    setReestimate("");
                  }
                }}
                onBlur={e => {
                  if (e.target.value !== "" && e.target.value != "0") {
                    saveReestimate(parseFloat(e.target.value));
                  }
                }}
              />
            )}
          </Fragment>
        )}
      </div>
      <div style={{ float: "clear" }} />
      <Divider light style={{ marginTop: 10 }} />
    </MuiThemeProvider>
  );
};

export default UserStory;
