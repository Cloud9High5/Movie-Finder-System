import React from 'react';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {Dashboard, Login, SignUp, MovieDetail, ResetPassword, Profile} from "./pages";

function App() {
  return (
    <>
      <Router>
        <div>
          <Routes>
            <Route exact path={'/mostPopularComments'} element={<Dashboard/>}/>
            <Route exact path={'/login'} element={<Login/>}/>
            <Route exact path={'/signup'} element={<SignUp/>}/>
            <Route exact path={'/movie_detail/:movieID'} element={<MovieDetail/>}/>
            <Route exact path={'/profile'} element={<Profile />} />
            <Route exact path={'/resetPassword'} element={<ResetPassword/>}/>
            {/* should be at the bottom */}
            <Route path={'/'} element={<Dashboard/>}/> {/* redirect to homepage */}
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;