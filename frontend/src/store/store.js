import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../authslice'
// Configure your store with the root reducer
// here we give our slice file ko as reducer
export const store = configureStore({
    reducer: {
        auth: authReducer
        //slice:reducer
    }
})
//ye hum export krenge store ko aur use global level me use krenge 