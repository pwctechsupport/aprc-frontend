import {
  TypedUseSelectorHook,
  useSelector as useReduxSelector
} from "react-redux";
import { RootState } from "../../redux";

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
