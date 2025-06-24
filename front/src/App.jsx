import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AudioRecognition from "./components/AudioRecognition";
import Login from "./components/Login";
import Signup from "./components/signup";

function App() {
   return (
      <Router>
         <Routes>
            <Route path="/" element={<AudioRecognition />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
         </Routes>
      </Router>
   );
}

export default App;
