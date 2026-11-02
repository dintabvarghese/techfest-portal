import React, { Suspense, lazy } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
const Register = lazy(() => import('./pages/Register.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Feedback = lazy(() => import('./pages/Feedback.jsx'));

// Step 16: Gallery code is downloaded only when the user opens /gallery
const Gallery = lazy(() => import('./pages/Gallery.jsx'));

export default function App() {
  return (
    <>
      <header>
        <h1>TechFest 2026</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
          <Link to="/feedback">Feedback</Link>
          <Link to="/gallery">Gallery</Link>
        </nav>
      </header>
      <main>
        <Suspense fallback={<p>Loading…</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/gallery" element={<Gallery />} />
          </Routes>
        </Suspense>
      </main>
    </>
  );
}
