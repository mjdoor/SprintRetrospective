import React, { useEffect, useState } from "react";
import {
  MuiThemeProvider,
  ListItem,
  ListItemText,
  Typography,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  Select,
  MenuItem
} from "@material-ui/core";

import theme from "../themes/theme";

import { db } from "../firebase";

const SprintSummary = props => {
  const [stories, setStories] = useState([]);
  const [sprintShown, setSprintShown] = useState("");
  const [allSprints, setSprints] = useState([]);

  useEffect(() => {
    const unsubscribeListenerTasks = db
      .collection("projects")
      .doc(props.projectName)
      .collection("tasks")
      .onSnapshot(querySnapshot => {
        let allStories = [];
        querySnapshot.forEach(doc => {
          let rawStoryInfo = doc.data();

          if (rawStoryInfo.sprint.length === 0) {
            let processedStoryInfo = {};

            processedStoryInfo.description = rawStoryInfo.description;
            processedStoryInfo.estimate = rawStoryInfo.initialEstimate;
            processedStoryInfo.hoursWorked = rawStoryInfo.actualHoursWorked;
            processedStoryInfo.assignee = rawStoryInfo.assignee || "Unassigned";
            processedStoryInfo.status = rawStoryInfo.status;
            processedStoryInfo.sprint = `Product Backlog`;
            processedStoryInfo.sprintNumber = 0;

            allStories.push(processedStoryInfo);
          } else {
            if (rawStoryInfo.sprint.length > 1) {
              rawStoryInfo.sprint.forEach((sprintNumber, idx) => {
                let processedStoryInfo = {};

                processedStoryInfo.description = rawStoryInfo.description;
                processedStoryInfo.assignee =
                  rawStoryInfo.assignee || "Unassigned";
                processedStoryInfo.status = rawStoryInfo.status;
                processedStoryInfo.sprint = `Sprint ${sprintNumber}`;
                processedStoryInfo.sprintNumber = sprintNumber;

                processedStoryInfo.isIntermediateSprintRecord =
                  idx !== rawStoryInfo.sprint.length - 1;

                // sanity check to ensure reestimate info array actually exists
                if (rawStoryInfo.reestimateInfo) {
                  // In this if block, it means the task has been assigned to multiple sprints
                  // Depending on when this report is accessed, it's possible that the task may have a reestimate
                  // for the sprint it is currently in, but hasn't been moved to a new sprint
                  // So, there may be a reestimate for each sprint, are the latest sprint won't have a reestimate.
                  // Handle each case

                  let reestimateForThisSprint = rawStoryInfo.reestimateInfo.find(
                    info => info.sprintNum === sprintNumber
                  );
                  if (reestimateForThisSprint) {
                    // if there is a reestimate for this sprint...
                    processedStoryInfo.estimate =
                      reestimateForThisSprint.hoursWorkedToDate +
                      reestimateForThisSprint.reestimate;
                    processedStoryInfo.hoursWorked =
                      reestimateForThisSprint.hoursWorkedToDate;

                    // overwrite the status of this story info to the status at the time of the reestimate
                    processedStoryInfo.status = reestimateForThisSprint.status;
                  } else {
                    // if there's not a reestimate for this sprint, use the latest reestimate
                    let latestReestimate = rawStoryInfo.reestimateInfo.sort(
                      (lhs, rhs) => lhs.sprintNum - rhs.sprintNum
                    )[rawStoryInfo.reestimateInfo.length - 1];
                    processedStoryInfo.estimate =
                      latestReestimate.hoursWorkedToDate +
                      latestReestimate.reestimate;
                    processedStoryInfo.hoursWorked =
                      rawStoryInfo.actualHoursWorked;
                  }
                } else {
                  processedStoryInfo.estimate = rawStoryInfo.initialEstimate;
                  processedStoryInfo.hoursWorked =
                    rawStoryInfo.actualHoursWorked;
                }

                allStories.push(processedStoryInfo);
              });
            } else {
              let processedStoryInfo = {};

              processedStoryInfo.description = rawStoryInfo.description;
              processedStoryInfo.assignee =
                rawStoryInfo.assignee || "Unassigned";
              processedStoryInfo.status = rawStoryInfo.status;
              processedStoryInfo.sprint = `Sprint ${rawStoryInfo.sprint[0]}`;
              processedStoryInfo.sprintNumber = rawStoryInfo.sprint[0];

              // Within this else block, it means this task has only ever been assigned to a one sprint.
              // It may or may not have a reestimate attached to it - if it does have a reestimate, the task just hasn't been moved to a new sprint yet
              // So, check if there is a reestimate for this task
              if (rawStoryInfo.reestimateInfo) {
                // if there is a reestimate (should only be one), use its data for this task's estimate
                processedStoryInfo.estimate =
                  rawStoryInfo.reestimateInfo[0].hoursWorkedToDate +
                  rawStoryInfo.reestimateInfo[0].reestimate;
                processedStoryInfo.hoursWorked =
                  rawStoryInfo.reestimateInfo[0].hoursWorkedToDate;
              } else {
                // if there is no reestimate, use the initial estimate
                processedStoryInfo.estimate = rawStoryInfo.initialEstimate;
                processedStoryInfo.hoursWorked = rawStoryInfo.actualHoursWorked;
              }

              allStories.push(processedStoryInfo);
            }
          }
        });
        allStories.sort((lhs, rhs) => lhs.sprintNumber - rhs.sprintNumber);
        setStories(allStories);
      });

    const unsubscribeListenerSprints = db
      .collection("projects")
      .doc(props.projectName)
      .collection("sprints")
      .onSnapshot(querySnapshot => {
        let sprintData = [];
        querySnapshot.forEach(
          doc => {
            sprintData.push(doc.data().sprintNumber);
          },
          error => {
            console.log(
              `ERROR retrieving sprints for ${props.productName}: ${error.message}`
            );
          }
        );
        sprintData.sort((lhs, rhs) => lhs - rhs);
        setSprints(sprintData);
        if (sprintShown === "") {
          setSprintShown(
            sprintData.length > 0
              ? `Sprint ${sprintData[sprintData.length - 1]}`
              : "Product Backlog"
          );
        }
      });

    return () => {
      if (unsubscribeListenerTasks) {
        unsubscribeListenerTasks();
      }
      if (unsubscribeListenerSprints) {
        unsubscribeListenerSprints();
      }
    };
    // eslint-disable-next-line
  }, []);

  const handleSprintChange = event => {
    setSprintShown(event.target.value);
  };

  return (
    <MuiThemeProvider theme={theme}>
      <FormControl component="fieldset">
        <FormLabel component="legend">Select sprint:</FormLabel>
        <Select
          style={{ width: 250 }}
          onChange={handleSprintChange}
          value={sprintShown}
        >
          <MenuItem key={`sprint-backlog`} value={"Product Backlog"}>
            {"Product Backlog"}
          </MenuItem>
          {allSprints.map(sprint => {
            return (
              <MenuItem key={`sprint-${sprint}`} value={`Sprint ${sprint}`}>
                {`Sprint ${sprint}`}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      {stories
        .filter(story => story.sprint === sprintShown)
        .map((story, idx) => (
          <ListItem key={idx}>
            <ListItemText
              primary={
                <Card>
                  <CardContent style={{ overflow: "auto" }}>
                    <div
                      style={{ margin: "0 1%", width: "22%", float: "left" }}
                    >
                      <Typography variant="caption">Description</Typography>
                      <Typography variant="body1" noWrap>
                        {story.description}
                      </Typography>
                    </div>
                    <div
                      style={{ margin: "0 1%", width: "15%", float: "left" }}
                    >
                      <Typography variant="caption">Status</Typography>
                      <Typography variant="body1">{story.status}</Typography>
                    </div>
                    <div
                      style={{ margin: "0 1%", width: "15%", float: "left" }}
                    >
                      <Typography variant="caption">Assignee</Typography>
                      <Typography variant="body1">{story.assignee}</Typography>
                    </div>
                    <div
                      style={{ margin: "0 1%", width: "10%", float: "left" }}
                    >
                      <Typography variant="caption">
                        Estimate (hours)
                      </Typography>
                      <Typography variant="body1">{story.estimate}</Typography>
                    </div>
                    <div
                      style={{ margin: "0 1%", width: "10%", float: "left" }}
                    >
                      <Typography variant="caption">
                        Total Hours Worked
                      </Typography>
                      <Typography variant="body1">
                        {story.hoursWorked}
                      </Typography>
                    </div>
                    <div
                      style={{ margin: "0 1%", width: "15%", float: "left" }}
                    >
                      <Typography variant="caption">% Complete</Typography>
                      <Typography variant="body1">
                        {story.status === "Delivered" &&
                        !story.isIntermediateSprintRecord
                          ? "100% (Delivered)"
                          : `${Math.round(
                              (story.hoursWorked * 100.0) / story.estimate
                            )}%`}
                      </Typography>
                    </div>
                  </CardContent>
                </Card>
              }
            />
          </ListItem>
        ))}
    </MuiThemeProvider>
  );
};

export default SprintSummary;
