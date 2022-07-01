import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from './dashboard';
import Login from "./login";
import SignUp from "./signUp";
import MovieDetail  from "./movieDetail";

function App () {
  return (
    <>
      <Router>
        <div className={'pageBody'}>
          <Routes>
            <Route exact path={'/dashboard'} element={<Dashboard/>}/>
            <Route exact path={'/login'} element={<Login/>}/>
            <Route exact path={'/signup'} element={<SignUp/>}/>
            <Route exact path={'/movie_detail/:movieID'} element={<MovieDetail/>}/>
            {/* should be at the bottom */}
            <Route path={'/'} element={<Dashboard/>}/> {/* redirect to homepage */}
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;