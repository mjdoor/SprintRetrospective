import React from "react";
import { useSelector } from "react-redux";
import DashBoard from "./Dashboard";
import { Typography, Paper } from "@material-ui/core";

const Home = () => {
  const { user } = useSelector(state => state);

  return (
    <div>
      <Paper
        elevation={3}
        style={{
          width: "min-content",
          margin: "0 auto",
          padding: 20,
          marginTop: 30
        }}
        align="center"
      >
        <Typography variant="h3" color="primary" align="center" noWrap>
          Welcome {user.name}
        </Typography>
      </Paper>

      <DashBoard />
    </div>
  );
};

export default Home;
