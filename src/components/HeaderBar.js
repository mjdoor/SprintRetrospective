import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Toolbar,
  AppBar,
  Menu,
  MenuItem,
  IconButton,
  Typography
} from "@material-ui/core";
import Reorder from "@material-ui/icons/Reorder";

import { firebaseApp } from "../firebase";

const HeaderBar = () => {
  const { isAuthenticated } = useSelector(state => state);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" color="inherit">
          Sprint Retrospective
        </Typography>
        {isAuthenticated && (
          <React.Fragment>
            <IconButton
              onClick={handleClick}
              color="inherit"
              style={{ marginLeft: "auto", paddingRight: "1vh" }}
            >
              <Reorder />
            </IconButton>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem component={Link} to="/" onClick={handleClose}>
                Home
              </MenuItem>
              <MenuItem component={Link} to="/projects" onClick={handleClose}>
                Projects
              </MenuItem>
              <MenuItem
                onClick={() =>
                  firebaseApp
                    .auth()
                    .signOut()
                    .then(() => handleClose())
                    .catch(e => console.log("ERROR LOGGING OUT " + e.message))
                }
              >
                Logout
              </MenuItem>
            </Menu>
          </React.Fragment>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default HeaderBar;
