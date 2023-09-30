import { LOADER_VISIBLE } from "./actions";
import { DefaultRootStateProps } from "./reducerProps";

export interface LoaderActionProps {
    type: string;
    visible: true;
}
  
const initialState: DefaultRootStateProps["loader"] = {
    action: false,
    visible: false,
};
  
const loaderReducer = (state = initialState, action: LoaderActionProps) => {
    switch (action.type) {
        case LOADER_VISIBLE:
        return {
            ...state,
            action: !state.action,
            visible: action.visible ? action.visible : initialState.visible,
        };
        default:
        return state;
    }
};

export default loaderReducer;