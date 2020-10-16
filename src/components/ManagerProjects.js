import React, { useState } from "react";
import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Typography,
  MuiThemeProvider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@material-ui/core/";

import HelpIcon from "@material-ui/icons/Help";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import SprintSummary from "./SprintSummary";

import theme from "../themes/theme";

const ManagerProjects = props => {
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <MuiThemeProvider theme={theme}>
      <div style={{ width: "100%", position: "relative" }}>
        <IconButton
          onClick={handleClickOpen}
          style={{
            width: 50,
            height: 50,
            position: "absolute",
            right: 20,
            top: -60
          }}
        >
          <HelpIcon />
        </IconButton>
      </div>

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
            <ExpansionPanelDetails
              style={{ display: "flex", flexDirection: "column" }}
            >
              <Typography variant="h5" align="center">
                {"Sprint Summary Report"}
              </Typography>
              <SprintSummary projectName={project.productName} />
            </ExpansionPanelDetails>
          </ExpansionPanel>
        );
      })}
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Info
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            The Sprint Summary Report displays the status, time spent, and %
            completed for each story point at the time of the sprint selected.
            You may see the same user stories, but in different sprints. This
            happens when the story was not finished in the original sprint and
            was reestimated and moved to the next sprint.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="secondary">
            Okay
          </Button>
        </DialogActions>
      </Dialog>
    </MuiThemeProvider>
  );
};

export default ManagerProjects;
