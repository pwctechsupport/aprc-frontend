const initialState: ModalStore = {
  bookmark: false
};

const TOGGLE_MODAL = "TOGGLE_MODAL";
const OPEN_MODAL = "OPEN_MODAL";
const CLOSE_MODAL = "CLOSE_MODAL";

// ---------------------------------------------------------------
// Action Creator
// ---------------------------------------------------------------

export const toggleModal = (name: string) => {
  return {
    type: TOGGLE_MODAL,
    name
  };
};

export const openModal = (name: string) => {
  return {
    type: OPEN_MODAL,
    name
  };
};

export const closeModal = (name: string) => {
  return {
    type: CLOSE_MODAL,
    name
  };
};

// ---------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------

export default function(state = initialState, action: ModalAction) {
  switch (action.type) {
    case CLOSE_MODAL:
      return {
        ...state,
        [action.name]: false
      };
    case OPEN_MODAL:
      return {
        ...state,
        [action.name]: true
      };
    case TOGGLE_MODAL:
      return {
        ...state,
        [action.name]: !state[action.name]
      };

    default:
      return state;
  }
}

// ---------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------

interface ModalStore {
  bookmark: boolean;
}

type ModalAction = ToggleModalAction;

interface ToggleModalAction {
  type: typeof TOGGLE_MODAL | typeof CLOSE_MODAL | typeof OPEN_MODAL;
  name: keyof ModalStore;
}
