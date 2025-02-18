import React from 'react';
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import Login from './components/Login';
import Chat from './components/Chat';
import Register from './components/Register';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Register />} >
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/chat" element={<Chat />} />
    </Route>
  )
);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
