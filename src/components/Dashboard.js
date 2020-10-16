import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Typography,
  FormControl,
  FormLabel,
  Select,
  MenuItem
} from "@material-ui/core";

import EstimateAccuracyScorecard from "./EstimateAccuracyScorecard";

const Dashboard = () => {
  const { teamMembers } = useSelector(state => state);
  const [selectedMember, setSelectedMember] = useState("");

  const handleMemberChange = event => {
    setSelectedMember(event.target.value);
  };

  return (
    <div style={{ padding: 10 }}>
      <Typography variant="h5" color="textPrimary">
        Dashboard
      </Typography>
      <div style={{ padding: 10 }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">
            Select a team member to view his/her estimate accuracy:
          </FormLabel>
          <Select
            style={{ width: 250 }}
            onChange={handleMemberChange}
            value={selectedMember}
            displayEmpty
          >
            <MenuItem disabled value={""}>
              <em>Team Member</em>
            </MenuItem>
            {teamMembers.map((member, idx) => {
              return (
                <MenuItem key={idx} value={member}>
                  {member}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        {selectedMember !== "" && (
          <EstimateAccuracyScorecard member={selectedMember} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
