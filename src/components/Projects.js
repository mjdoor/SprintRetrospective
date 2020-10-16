import React, { useState, useEffect, Fragment } from "react";
import { useSelector } from "react-redux";
import { Button, Typography } from "@material-ui/core";
import theme from "../themes/theme";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import NewProject from "./NewProject";
import AddTask from "./AddTask";
import AddMember from "./AddMember";
import NewSprint from "./NewSprint";
import MemberProjectList from "./MemberProjectList";
import ManagerProjects from "./ManagerProjects";
import { db } from "../firebase";

const Projects = props => {
  const [openNewProjectModal, setOpenNewProjectModal] = useState(false);
  const [openNewSprintModal, setOpenNewSprintModal] = useState(false);
  const [openNewTaskModal, setOpenNewTaskModal] = useState(false);
  const [openNewMemberModal, setOpenNewMemberModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const { teamMembers } = useSelector(state => state);

  useEffect(() => {
    const unsubscribeListener = db.collection("projects").onSnapshot(
      querySnapshot => {
        const data = querySnapshot.docs.map(doc => doc.data());
        setProjects(data);
      },
      e => console.log(`Error loading projects: ${e.message}`)
    );

    return () => {
      if (unsubscribeListener) {
        unsubscribeListener();
      }
    };
    // eslint-disable-next-line
  }, []);

  const closedModalHandler = modalCloseSetter => () => {
    modalCloseSetter(false);
  };

  return (
    <MuiThemeProvider theme={theme}>
      <Typography variant="h2" color="primary">
        Projects
      </Typography>
      {props.isManager ? (
        <ManagerProjects projects={projects} />
      ) : (
        <Fragment>
          <NewProject
            open={openNewProjectModal}
            onClose={closedModalHandler(setOpenNewProjectModal)}
          />
          {selectedProject && (
            <Fragment>
              <NewSprint
                open={openNewSprintModal}
                onClose={closedModalHandler(setOpenNewSprintModal)}
                productName={selectedProject}
              />
              <AddTask
                open={openNewTaskModal}
                onClose={closedModalHandler(setOpenNewTaskModal)}
                productName={selectedProject}
              />
              <AddMember
                users={teamMembers}
                open={openNewMemberModal}
                onClose={closedModalHandler(setOpenNewMemberModal)}
                productName={selectedProject}
              />
            </Fragment>
          )}
          <Button
            style={{ margin: 20 }}
            color="primary"
            variant="contained"
            onClick={() => setOpenNewProjectModal(true)}
          >
            Add Project
          </Button>
          <MemberProjectList
            projects={projects}
            onOpenSprintModal={() => setOpenNewSprintModal(true)}
            onOpenTaskModal={() => setOpenNewTaskModal(true)}
            onOpenMemberModal={() => setOpenNewMemberModal(true)}
            onProjectSelected={productName => {
              setSelectedProject(productName);
            }}
          />
        </Fragment>
      )}
    </MuiThemeProvider>
  );
};

export default Projects;
