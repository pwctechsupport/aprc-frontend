import { Role } from "../generated/graphql";

const getUser = () => {
  const localStorageUser = localStorage.getItem("user");
  if (localStorageUser) {
    return JSON.parse(localStorageUser);
  }
  return null;
};

const getToken = () => {
  if (localStorage.getItem("token")) {
    return localStorage.getItem("token");
  }
  return null;
};

const initialState: AuthStore = {
  isAuthed: !!getToken(),
  user: getUser(),
  token: getToken()
};

const AUTHORIZED = "AUTHORIZED";
const UNAUTHORIZED = "UNAUTHORIZED";
const UPDATE_USER = "UPDATE_USER";

// ---------------------------------------------------------------
// Type Definition
// ---------------------------------------------------------------

interface AuthStore {
  isAuthed: boolean;
  user: User | null | undefined;
  token: string | null | undefined;
}

interface User {
  firstName: string;
  lastName: string;
  name: string;
  email: string | null | undefined;
  id: string;
  phone: string | null | undefined;
  jobPosition: string | null | undefined;
  department: string | null | undefined;
  roles?: Partial<Role>[];
}

interface AuthorizedAction {
  type: typeof AUTHORIZED;
  payload: {
    user: User;
    token: string;
  };
}
interface UpdateUserAction {
  type: typeof UPDATE_USER;
  payload: User;
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

export const updateUser = (user: User): UpdateUserAction => {
  localStorage.setItem("user", JSON.stringify(user));
  return {
    type: UPDATE_USER,
    payload: user
  };
};

// ---------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------

export default function(
  state = initialState,
  action: AuthorizedAction | UnauthorizeAction | UpdateUserAction
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
    case UPDATE_USER:
      return {
        ...state,
        user: action.payload
      };
  }
  return state;
}
