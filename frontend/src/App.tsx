import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from "./pages/login"
import RegisterPage from "./pages/register";
import HomePage from "./pages/home/home";
import ExplorePage from './pages/home/explore';
import AdminPage from './pages/admin';

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/home/explore" element={<ExplorePage/>} />
          <Route path="/supersecretadmin" element={<AdminPage/>} />
        </Routes>
    </BrowserRouter>
  )
}

export default App