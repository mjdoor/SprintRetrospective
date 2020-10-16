import ACTIONS from "./actions";

const intitialState = {
  isAuthenticated: false,
  loggingIn: false,
  loginError: false,
  isVerifying: false,
  errorMsg: "",
  user: {},
  teamMembers: []
};

export default (state = intitialState, action) => {
  switch (action.type) {
    case ACTIONS.Types.AUTHENTICATE_USER:
      return {
        ...state,
        loginError: false,
        loggingIn: false,
        isAuthenticated: true
      };
    case ACTIONS.Types.LOGGING_IN:
      return {
        ...state,
        loginError: false,
        loggingIn: true
      };
    case ACTIONS.Types.DEAUTHENTICATE_USER:
      return {
        ...state,
        loginError: false,
        isAuthenticated: false,
        user: {}
      };
    case ACTIONS.Types.LOGIN_ERROR:
      return {
        ...state,
        loginError: true,
        isVerifying: false,
        isAuthenticated: false,
        errorMsg: action.errorMsg
      };
    case ACTIONS.Types.CLEAR_ERRORS:
      return { ...state, loginError: false, errorMsg: "" };
    case ACTIONS.Types.PENDING_AUTH:
      return {
        ...state,
        isVerifying: true
      };
    case ACTIONS.Types.CANCEL_PENDING:
      return {
        ...state,
        isVerifying: false
      };
    case ACTIONS.Types.SET_USER:
      return {
        ...state,
        user: action.user
      };
    case ACTIONS.Types.SET_MEMBERS:
      return { ...state, teamMembers: action.members };
    default:
      return state;
  }
};
