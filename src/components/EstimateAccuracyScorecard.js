import React, { useState, useEffect, Fragment } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Collapse
} from "@material-ui/core";

import { db } from "../firebase";

const EstimateAccuracyScorecard = props => {
  const [memberHasTasks, setMemberHasTasks] = useState(true);
  const [taskTimeData, setTaskTimeData] = useState({});
  const [collapser, setCollapser] = useState({}); // keeps track of nested listed, if they are collapsed or not.

  const handleCollapse = key => () => {
    setCollapser(prev => {
      const change = {};
      change[key] = !prev[key];
      return { ...prev, ...change };
    });
  };

  const calculateAccuracy = (hoursWorked, hoursEstimated) => {
    return `${Math.round(
      100 * (1 - Math.abs(hoursWorked - hoursEstimated) / hoursEstimated)
    )} %`;
  };

  useEffect(() => {
    setCollapser({});
    /* 
      The query below, with collectionGroup, matches all subcollections named "tasks" - so it returns all tasks that all delivered, that are assigned to the given member
      (this required the creation of an index in Firebase - pretty much automatically done by firebase the first time you try to run the query. 
      An error is generated in the browser console with a link, you just click the link and the index gets created)
     */
    const unsubscribeListenerTasks = db
      .collectionGroup("tasks")
      .where("assignee", "==", props.member)
      .where("status", "==", "Delivered")
      .onSnapshot(
        async querySnapshot => {
          setMemberHasTasks(!querySnapshot.empty);
          /*
            taskInfo, as built below, will be an object where keys are project names, and values are arrays containing estimation/time worked data for each task 
            the member completed within the project
            eg:
            {
              project1: [{description: "some task", initialEstimate: 4, actualHours: 5}, {description: "some other task", initialEstimate: 5, actualHours: 2}],
              project2: [{description: "some third task", initialEstimate: 3, actualHours: 2}]
            }
          */
          const taskInfo = {};
          // using a for loop rather than forEach due to asyncronous .get() function for projectDoc. forEach doesn't wait. With this setup, it does.
          for (let i = 0; i < querySnapshot.docs.length; i++) {
            const taskDoc = querySnapshot.docs[i];
            // the line below is used to find what project the task is in. Using ref.parent.parent goes back up the chain to the project in which this task resides
            const projectDoc = await taskDoc.ref.parent.parent.get();
            const project = projectDoc.data();
            const projectForTask = project.productName;
            if (taskInfo[projectForTask]) {
              taskInfo[projectForTask].push({
                description: taskDoc.data().description,
                initialEstimate: taskDoc.data().initialEstimate,
                actualHours: taskDoc.data().actualHoursWorked
              });
            } else {
              taskInfo[projectForTask] = [
                {
                  description: taskDoc.data().description,
                  initialEstimate: taskDoc.data().initialEstimate,
                  actualHours: taskDoc.data().actualHoursWorked
                }
              ];
            }
          }
          setTaskTimeData(taskInfo);
        },
        e => console.log(`Error loading user's tasks: ${e.message}`)
      );

    return () => {
      if (unsubscribeListenerTasks) {
        unsubscribeListenerTasks();
      }
    };
    // eslint-disable-next-line
  }, [props.member]);

  return (
    <Card
      style={{
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: 20,
        maxWidth: 600
      }}
    >
      <CardHeader
        title="Estimate Accuracy Scorecard"
        subheader={props.member}
        style={{ textAlign: "center" }}
      />
      <CardContent>
        {memberHasTasks ? (
          <List>
            <ListItem>
              <ListItemText
                primary={
                  <Grid container spacing={1}>
                    <Grid item xs={8}>
                      <Typography variant="h6" align="left">
                        Overall Accuracy
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="h6" align="right">
                        {Object.keys(taskTimeData).length > 0
                          ? (() => {
                              // For overall accuracy, get total hours worked and total estimated hours, and use those in the calculation
                              const totals = Object.values(taskTimeData).reduce(
                                // this first reduce traverses through each project
                                (runningTotal, currentProjectTasks) => {
                                  return currentProjectTasks.reduce(
                                    // this inner reduce traverses through each task in a project
                                    // Note: the runningTotal parameter is being passed through both levels of the reduce methods
                                    // (the outer runningTotal parameter is shadowed while the inner runningTotal parameter is being used,
                                    // but it still works out because the object gets returned at the end of each reduce), so
                                    // by the time the entire object is traversed, overall running totals have been calculated
                                    (runningTotal, currentTask) => {
                                      runningTotal.estimateTotal +=
                                        currentTask.initialEstimate;
                                      runningTotal.workedTotal +=
                                        currentTask.actualHours;

                                      return runningTotal;
                                    },
                                    runningTotal
                                  );
                                },
                                { estimateTotal: 0, workedTotal: 0 }
                              );

                              return calculateAccuracy(
                                totals.workedTotal,
                                totals.estimateTotal
                              );
                            })()
                          : "Calculating..."}
                      </Typography>
                    </Grid>
                  </Grid>
                }
              />
            </ListItem>
            <Divider style={{ height: 3, backgroundColor: "black" }} />
            {Object.keys(taskTimeData).length > 0
              ? Object.entries(taskTimeData).map((entryArr, idx) => {
                  const projectName = entryArr[0];
                  const taskDataArray = entryArr[1];

                  const projectTimeTotals = taskDataArray.reduce(
                    (runningTotal, currentTask) => {
                      runningTotal.estimateTotal += currentTask.initialEstimate;
                      runningTotal.workedTotal += currentTask.actualHours;

                      return runningTotal;
                    },
                    { estimateTotal: 0, workedTotal: 0 }
                  );

                  return (
                    <Fragment key={idx}>
                      <ListItem button onClick={handleCollapse(idx)}>
                        <ListItemText
                          primary={
                            <Grid container spacing={1}>
                              <Grid item xs={8}>
                                <Typography variant="h6" align="left">
                                  {projectName}
                                </Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography variant="h6" align="right">
                                  {calculateAccuracy(
                                    projectTimeTotals.workedTotal,
                                    projectTimeTotals.estimateTotal
                                  )}
                                </Typography>
                              </Grid>
                            </Grid>
                          }
                        />
                      </ListItem>
                      <Divider />
                      <Collapse in={collapser[idx]}>
                        <List dense>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Grid container spacing={1}>
                                  <Grid item xs={6}>
                                    <Typography variant="body1" align="left">
                                      Task
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <Typography variant="body1" align="center">
                                      Estimate
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <Typography variant="body1" align="center">
                                      Actual
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <Typography variant="body1" align="right">
                                      Accuracy
                                    </Typography>
                                  </Grid>
                                </Grid>
                              }
                            />
                          </ListItem>
                          <Divider light variant="middle" />
                          {taskDataArray.map((taskData, idx) => (
                            <ListItem key={idx}>
                              <ListItemText
                                primary={
                                  <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                      <Typography variant="body1" align="left">
                                        {taskData.description.length > 25
                                          ? `${taskData.description.substring(
                                              0,
                                              25
                                            )} . . .`
                                          : taskData.description}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                      <Typography
                                        variant="body1"
                                        align="center"
                                      >
                                        {taskData.initialEstimate}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                      <Typography
                                        variant="body1"
                                        align="center"
                                      >
                                        {taskData.actualHours}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                      <Typography variant="body1" align="right">
                                        {calculateAccuracy(
                                          taskData.actualHours,
                                          taskData.initialEstimate
                                        )}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    </Fragment>
                  );
                })
              : null}
          </List>
        ) : (
          <Typography variant="body1" align="center">
            {props.member} hasn't completed any tasks yet, so estimate accuracy
            cannot be calculated.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimateAccuracyScorecard;
