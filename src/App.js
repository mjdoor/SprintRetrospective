import React from "react";
import { useSelector } from "react-redux";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import theme from "./themes/theme";
import "./App.css";
import Authentication from "./components/Authentication";
import Projects from "./components/Projects";
import Home from "./components/Home";

import HeaderBar from "./components/HeaderBar";

function App() {
  const { isAuthenticated, isVerifying, loggingIn, user } = useSelector(
    state => state
  );

  const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={props => {
        if (isVerifying) {
          return <div>Loading...</div>;
        } else if (loggingIn) {
          return <div>Logging in...</div>;
        } else if (isAuthenticated) {
          return <Component {...props} />;
        } else {
          return <Redirect to="/authenticate" />;
        }
      }}
    />
  );

  return (
    <MuiThemeProvider theme={theme}>
      <Router>
        <HeaderBar />
        <Switch>
          <PrivateRoute exact path="/" component={Home} />
          <Route exact path="/authenticate" component={Authentication} />
          <PrivateRoute
            exact
            path="/projects"
            component={() => <Projects isManager={user.role === "pmo"} />}
          />
        </Switch>
      </Router>
    </MuiThemeProvider>
  );
}

export default App;
