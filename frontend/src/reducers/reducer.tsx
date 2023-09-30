import { combineReducers } from "redux";
import loaderReducer from "./loaderReducer";

const reducer = combineReducers({
    loader: loaderReducer
    ,
});

export default reducer;