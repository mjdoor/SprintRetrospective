import React, { useState } from "react";
import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Typography,
  MuiThemeProvider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  IconButton,
  Grid
} from "@material-ui/core/";
import AddIcon from "@material-ui/icons/Add";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ViewTasks from "./ViewTasks";

import theme from "../themes/theme";

const MemberProjectList = props => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
    props.onProjectSelected(panel);
  };

  return (
    <MuiThemeProvider theme={theme}>
      {props.projects.map((project, idx) => {
        return (
          <ExpansionPanel
            expanded={expanded === project.productName}
            onChange={handleChange(project.productName)}
            key={idx}
          >
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{project.productName}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Grid container spacing={1}>
                <Grid item xs={10}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Team Name</TableCell>
                        <TableCell>
                          Team Members
                          <IconButton
                            onClick={props.onOpenMemberModal}
                            color="primary"
                          >
                            <AddIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell>Product Start Date</TableCell>
                        <TableCell>
                          Initial Velocity (story points per sprint)
                        </TableCell>
                        <TableCell>Hours per story point</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>{project.teamName}</TableCell>
                        <TableCell>
                          {project.teamMembers !== undefined
                            ? project.teamMembers.join(", ")
                            : ""}
                        </TableCell>
                        <TableCell>{project.projectStartDate}</TableCell>
                        <TableCell>{project.initialVelocity}</TableCell>
                        <TableCell>{project.hoursPerStoryPoint}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>
                <Grid item xs={2}>
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignContent: "flex-end"
                    }}
                  >
                    <Button
                      style={{ margin: 5 }}
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        props.onOpenSprintModal();
                      }}
                    >
                      Create New Sprint
                    </Button>
                    <Button
                      style={{ margin: 5 }}
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        props.onOpenTaskModal();
                      }}
                    >
                      Add User Story
                    </Button>
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <ViewTasks
                    members={project.teamMembers}
                    productName={project.productName}
                  />
                </Grid>
              </Grid>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        );
      })}
    </MuiThemeProvider>
  );
};

export default MemberProjectList;
