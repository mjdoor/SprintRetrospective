import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Collapse,
  Divider,
  MuiThemeProvider,
  Typography
} from "@material-ui/core/";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";

import theme from "../themes/theme";
import { db } from "../firebase";
import UserStory from "./UserStory";

const ViewTasks = props => {
  const [userStories, setUserStories] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [collapser, setCollapser] = useState({}); // keeps track of nested listed, if they are collapsed or not.
  const [project, setProject] = useState({});

  const handleCollapse = key => () => {
    setCollapser(prev => {
      const change = {};
      change[key] = !prev[key];
      return { ...prev, ...change };
    });
  };

  useEffect(() => {
    setTeamMembers(props.members);

    db.collection("projects")
      .doc(props.productName)
      .get()
      .then(doc => {
        if (!doc.exists) {
          console.log("No such document!");
        } else {
          setProject(doc.data());
        }
      })
      .catch(err => {
        console.log("Error getting document", err);
      });

    const unsubscribeListenerTasks = db
      .collection("projects")
      .doc(props.productName)
      .collection("tasks")
      .onSnapshot(querySnapshot => {
        let allTaskData = {};
        let maxSprintNum = 0;
        querySnapshot.forEach(
          doc => {
            const taskData = { ...doc.data(), id: doc.id };
            let sprintArrayLength = taskData.sprint
              ? taskData.sprint.length
              : 0;
            // sprint is an array representing the sprint(s) the task is assigned to. If the array is empty, it hasn't been assigned to a sprint
            let sprintNum =
              sprintArrayLength === 0
                ? 0
                : taskData.sprint[sprintArrayLength - 1]; // put the user story in the most current sprint category

            if (sprintNum > maxSprintNum) {
              maxSprintNum = sprintNum;
            }

            if (allTaskData[sprintNum]) {
              allTaskData[sprintNum].push(taskData);
            } else {
              allTaskData[sprintNum] = [taskData];
            }
          },
          error => {
            console.log(
              `ERROR retrieving tasks for ${props.productName}: ${error.message}`
            );
          }
        );
        // fill in any sprint numbers without any tasks attributed to them so that the sprint heading will show up in the list (albeit with no content)
        for (let i = 0; i <= maxSprintNum; i++) {
          if (!allTaskData[i]) {
            allTaskData[i] = null;
          }
        }
        setUserStories(allTaskData);
      });

    const unsubscribeListenerSprints = db
      .collection("projects")
      .doc(props.productName)
      .collection("sprints")
      .onSnapshot(querySnapshot => {
        let sprintData = [];
        querySnapshot.forEach(
          doc => {
            sprintData.push(doc.data());
          },
          error => {
            console.log(
              `ERROR retrieving sprints for ${props.productName}: ${error.message}`
            );
          }
        );
        setSprints(sprintData);
      });

    // Returning a function from useEffect will cause the function to run when the component is no longer being used - used to clean up/detach listeners...
    return () => {
      if (unsubscribeListenerTasks) {
        unsubscribeListenerTasks();
      }
      if (unsubscribeListenerSprints) {
        unsubscribeListenerSprints();
      }
    };
    // eslint-disable-next-line
  }, [props.members]);

  return (
    <MuiThemeProvider theme={theme}>
      <List>
        {Object.entries(userStories).map((entryArr, idx) => {
          let sprintNum = parseInt(entryArr[0]);
          let seconds = new Date().getTime() / 1000;
          let sprintObj = sprints.find(s => s.sprintNumber === sprintNum);
          let endDateOfSprintInSeconds = 0;
          let velocity = 0;
          let stories = entryArr[1];
          let completedStories = 0;
          let numOfStories = 0;
          let endedSprint = false;
          let allowReestimate = false; // only allow user to record re-estimates for user stories if story is in a sprint that is about to end
          let sprintName = "";
          let sprintCaption = "";
          if (stories) {
            for (const story of Object.values(stories)) {
              if (story.status === "Delivered") {
                velocity += story.initialEstimate / project.hoursPerStoryPoint;
                completedStories++;
              }
              numOfStories++;
            }
          }
          if (sprintObj) {
            sprintName = `Sprint ${sprintNum}: `;
            if (sprintObj.endDate.seconds > seconds) {
              //means it hasnt ended yet
              endDateOfSprintInSeconds = sprintObj.endDate.seconds - seconds;
              let d = Math.floor(endDateOfSprintInSeconds / (3600 * 24));
              let h = Math.floor(
                (endDateOfSprintInSeconds % (3600 * 24)) / 3600
              );

              if (d === 0 && h === 0) {
                sprintCaption = "Ends in less than an hour";
              } else {
                let dayString = d > 0 ? (d === 1 ? "1 day" : `${d} days`) : "";
                let hourString =
                  h > 0 ? (h === 1 ? "1 hour" : `${h} hours`) : "";
                let conjunction = d > 0 && h > 0 ? " and " : "";

                sprintCaption = `Ends in ${dayString}${conjunction}${hourString}`;
              }

              if (numOfStories > 0) {
                sprintCaption += `, with ${completedStories}/${numOfStories} completed stories.`;
              } else {
                sprintCaption += ".";
              }

              if (d <= 1) {
                allowReestimate = true;
              }
            } else {
              //means it has ended
              sprintCaption = "Ended.";
              if (completedStories > 0) {
                sprintCaption += ` ${completedStories} completed ${
                  completedStories === 1 ? "story" : "stories"
                }.`;
              }
              if (numOfStories > completedStories) {
                let difference = numOfStories - completedStories;
                sprintCaption += ` ${difference} unfinished ${
                  difference === 1 ? "story" : "stories"
                }.`;
              }
              endedSprint = true;
            }
          }

          if (sprintNum === 0) {
            sprintName = "Product Backlog: ";
            sprintCaption = `${
              numOfStories > 0
                ? `${
                    numOfStories === 1 ? "1 story" : `${numOfStories} stories`
                  } to do`
                : "Empty"
            }.`;
          }

          return (
            <div key={idx}>
              <ListItem button onClick={handleCollapse(idx)}>
                <ListItemText
                  primary={
                    <p style={{ margin: 0 }}>
                      <b>{sprintName}</b>
                      <span style={{ color: endedSprint ? "red" : "black" }}>
                        {sprintCaption}
                      </span>
                    </p>
                  }
                  secondary={
                    <Typography variant="caption">
                      {endedSprint && `Velocity: ${velocity}`}
                    </Typography>
                  }
                />

                {collapser[idx] ? <ExpandLess /> : <ExpandMore />}
              </ListItem>

              <Divider />
              <Collapse in={collapser[idx]}>
                {stories ? (
                  <List>
                    {stories.map((storyInfo, idx) => {
                      return (
                        <ListItem
                          key={idx}
                          style={{
                            paddingLeft: 20,
                            marginBottom: 10,
                            borderBottomWidth: 2,
                            borderBottomColor: "black"
                          }}
                        >
                          <ListItemText
                            primary={
                              <UserStory
                                storyId={storyInfo.id}
                                productName={props.productName}
                                status={storyInfo.status}
                                assignee={storyInfo.assignee}
                                members={teamMembers}
                                initialHours={storyInfo.initialEstimate}
                                actualHours={storyInfo.actualHoursWorked}
                                sprint={
                                  storyInfo.sprint.length === 0
                                    ? 0
                                    : storyInfo.sprint[
                                        storyInfo.sprint.length - 1
                                      ]
                                }
                                sprints={sprints}
                                allowReestimate={allowReestimate}
                                endedSprint={endedSprint}
                                description={storyInfo.description}
                              />
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                ) : (
                  <Typography
                    variant="body1"
                    style={{ paddingLeft: 20, marginBottom: 10 }}
                  >
                    No stories to show
                  </Typography>
                )}
              </Collapse>
            </div>
          );
        })}
      </List>
    </MuiThemeProvider>
  );
};
export default ViewTasks;
