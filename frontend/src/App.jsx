import { Routes, Route,Navigate} from "react-router";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CodeWorkspace from "./pages/CodeWorkSpace";
import {checkAuth} from "./authSlice"
import { useDispatch,useSelector} from "react-redux";
import { useEffect } from "react";
import AdminPanel from "./component/AdminPanel";
import Admin from "./pages/Admin";
import AdminDelete from "./component/AdminDelete";
import AdminUpdateList from "./component/AdminUpdateList";
import UpdateProblem from "./component/UpdateProblem";
import AdminVideo from "./component/AdminVideo";
import VideoUpload from "./component/AdminUpload";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./component/Navbar";

function App(){
  
    // code likhna isAuthentciated
    const {isAuthenticated,user,loading} =  useSelector((state)=>state.auth);
    const dispatch = useDispatch();
  
  // console.log(user);
  // console.log(user?.role);
  // console.log(isAuthenticated);
  // console.log(loading);
    useEffect(()=>{
     dispatch(checkAuth());
    },[dispatch]);

if (loading) {
  console.log("phle konsa chala dekho");
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-base-100 text-base-content antialiased">
        <Navbar />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={isAuthenticated ?<HomePage></HomePage>:<Navigate to="/signup" />}></Route>
            <Route path="/login" element={isAuthenticated?<Navigate to="/" />:<Login></Login>}></Route>
            <Route path="/signup" element={isAuthenticated?<Navigate to="/" />:<Signup></Signup>}></Route>
            <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
            <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
            <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />} />
            <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />} />
            <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <VideoUpload /> : <Navigate to="/" />} />
            <Route path="/admin/updateList" element={isAuthenticated && user?.role === 'admin' ? <AdminUpdateList /> : <Navigate to="/" />} />
            <Route path="/admin/update/:id" element={isAuthenticated && user?.role === 'admin' ? <UpdateProblem /> : <Navigate to="/" />} />
            <Route path="/problem/:problemId" element={<CodeWorkspace></CodeWorkspace>}></Route>
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App;