import { firebaseApp, db } from "../firebase";

const Types = {
  LOGGING_IN: "LOGGING_IN",
  AUTHENTICATE_USER: "AUTHENTICATE_USER",
  DEAUTHENTICATE_USER: "DEAUTHENTICATE_USER",
  LOGIN_ERROR: "LOGIN_ERROR",
  PENDING_AUTH: "PENDING_AUTH",
  CANCEL_PENDING: "CANCEL_PENDING",
  CLEAR_ERRORS: "CLEAR_ERRORS",
  SET_USER: "SET_USER",
  SET_MEMBERS: "SET_MEMBERS"
};

const pendingAuth = () => {
  return { type: Types.PENDING_AUTH };
};
const cancelPending = () => {
  return { type: Types.CANCEL_PENDING };
};

const loggingIn = () => {
  return { type: Types.LOGGING_IN };
};
const authenticateUser = () => {
  return { type: Types.AUTHENTICATE_USER };
};

const deauthenticateUser = () => {
  return { type: Types.DEAUTHENTICATE_USER };
};

const loginError = msg => {
  return { type: Types.LOGIN_ERROR, errorMsg: msg };
};

const clearErrors = () => {
  return { type: Types.CLEAR_ERRORS };
};

const setUser = user => {
  return { type: Types.SET_USER, user: user };
};

const setTeamMembers = members => {
  return { type: Types.SET_MEMBERS, members };
};

const verifyAuth = () => dispatch => {
  dispatch(pendingAuth());
  firebaseApp.auth().onAuthStateChanged(user => {
    if (user !== null) {
      dispatch(authenticateUser());

      db.collection("users")
        .doc(user.uid)
        .onSnapshot(
          doc => {
            dispatch(setUser(doc.data()));
          },
          error => {
            dispatch(setUser({}));
          }
        );

      db.collection("users")
        .where("role", "==", "member")
        .onSnapshot(
          querySnapshot => {
            const data = querySnapshot.docs.map(doc => doc.data().name);
            dispatch(setTeamMembers(data));
          },
          e => console.log(`Error loading team members: ${e.message}`)
        );
    } else {
      dispatch(deauthenticateUser());
    }
    dispatch(cancelPending());
  });
};

export default {
  verifyAuth,
  loggingIn,
  authenticateUser,
  loginError,
  clearErrors,
  pendingAuth,
  cancelPending,
  Types
};
