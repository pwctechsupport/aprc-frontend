const initialState: AuthStore = {
  isAuthed: false,
  user: null,
  token: null
};

const AUTHORIZED = "AUTHORIZED";

interface AuthStore {
  isAuthed: boolean;
  user: User | null | undefined;
  token: string | null | undefined;
}

interface User {
  name: string;
  email: string;
}

interface AuthorizedAction {
  type: typeof AUTHORIZED;
  payload: {
    user: User;
    token: string;
  };
}

export const authorize = (user: User, token: string): AuthorizedAction => {
  return {
    type: "AUTHORIZED",
    payload: { user, token }
  };
};

export default function(state = initialState, action: AuthorizedAction) {
  switch (action.type) {
    case "AUTHORIZED":
      return {
        isAuthed: true,
        user: action.payload.user,
        token: action.payload.token
      };
  }
  return state;
}
