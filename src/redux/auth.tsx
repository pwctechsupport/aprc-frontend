const initialState: AuthStore = {
  isAuthed: false,
  user: null,
  token: null
};

const AUTHORIZED = "AUTHORIZED";
const UNAUTHORIZED = "UNAUTHORIZED";

// ---------------------------------------------------------------
// Type Definition
// ---------------------------------------------------------------

interface AuthStore {
  isAuthed: boolean;
  user: User | null | undefined;
  token: string | null | undefined;
}

interface User {
  name: string;
  email: string | null | undefined;
  id: string;
  phone: string;
}

interface AuthorizedAction {
  type: typeof AUTHORIZED;
  payload: {
    user: User;
    token: string;
  };
}

interface UnauthorizeAction {
  type: typeof UNAUTHORIZED;
}

// ---------------------------------------------------------------
// Action Creator
// ---------------------------------------------------------------

export const authorize = (user: User, token: string): AuthorizedAction => {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
  return {
    type: AUTHORIZED,
    payload: { user, token }
  };
};

export const unauthorize = (): UnauthorizeAction => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  return {
    type: UNAUTHORIZED
  };
};

// ---------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------

export default function(
  state = initialState,
  action: AuthorizedAction | UnauthorizeAction
) {
  switch (action.type) {
    case AUTHORIZED:
      return {
        isAuthed: true,
        user: action.payload.user,
        token: action.payload.token
      };
    case UNAUTHORIZED:
      return {
        isAuthed: false,
        user: initialState.user,
        token: initialState.token
      };
  }
  return state;
}
