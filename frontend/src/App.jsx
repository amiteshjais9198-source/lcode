import { Route, Routes } from 'react-router-dom'
import Loginpage from './pages/Loginpage.jsx'
import Homepage from './pages/HomePage.jsx'
import Registerpage from './pages/Registerpage.jsx'
import Profilepage from './pages/Profilepage.jsx'
import Adminpage from './pages/Adminpage.jsx'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuth } from './authSlice.js'
import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Problempage from './pages/Problempage/index.jsx'

//dekho ye checkAuth functio from te authslicer pehle agar user website me ghusega to ye backedn 
// me appi call maar dega agar cookie verify ho jata hai to isauthenticated true hojayega aur 
//  route me dekho kya hota hai 
function App() {
  const {isAuthenticated, user}=useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
    
    // Set initial theme to dark by default globally
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme !== 'light') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [dispatch]);

  return (
   <>
   {isAuthenticated && <Navbar />}
   <Routes>
    <Route path="/" element={isAuthenticated?<Homepage></Homepage>:<Navigate to="/login"></Navigate>  }></Route>
    <Route path="/login" element={isAuthenticated?<Navigate to="/"/>:<Loginpage></Loginpage>}></Route>
    <Route path="/register" element={isAuthenticated?<Navigate to="/"/>:<Registerpage></Registerpage>}></Route>
    <Route path="/profile" element={isAuthenticated?<Profilepage/>:<Navigate to="/login"/>}></Route>
    <Route path="/admin" element={isAuthenticated && user?.role === "admin" ? <Adminpage/> : <Navigate to="/"/>}></Route>
     <Route path="/problem/:problemId" element={<Problempage />} />
    </Routes>
   </>
  )
}

export default App
