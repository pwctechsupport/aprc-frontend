// ---------------------------------------------------------------
// Type Definition
// ---------------------------------------------------------------

interface DialogBoxStore {
  isOpen: boolean;
  title: string;
  text: string;
  callback: Function;
}

interface BoxActionOpen {
  type: typeof DIALOG_BOX_OPEN;
  payload: {
    title: string;
    text: string;
    callback: Function;
  };
}

interface BoxActionClose {
  type: typeof DIALOG_BOX_CLOSE;
}

// ---------------------------------------------------------------
// Initialize
// ---------------------------------------------------------------

const DIALOG_BOX_OPEN = "DIALOG_BOX_OPEN";
const DIALOG_BOX_CLOSE = "DIALOG_BOX_CLOSE";

const initialState: DialogBoxStore = {
  isOpen: false,
  title: "",
  text: "",
  callback: () => {}
};

// ---------------------------------------------------------------
// Action Creator
// ---------------------------------------------------------------

export function openDialogBox(
  payload: BoxActionOpen["payload"]
): BoxActionOpen {
  return {
    type: DIALOG_BOX_OPEN,
    payload
  };
}

export function closeDialogBox(): BoxActionClose {
  return {
    type: DIALOG_BOX_CLOSE
  };
}

// ---------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------

export default function dialogBoxReducer(
  state = initialState,
  action: BoxActionOpen | BoxActionClose
) {
  switch (action.type) {
    case DIALOG_BOX_OPEN:
      return {
        ...state,
        isOpen: true,
        title: action.payload?.title,
        text: action.payload?.text,
        callback: action.payload?.callback
      };
    case DIALOG_BOX_CLOSE:
      return initialState;
    default:
      return state;
  }
}
