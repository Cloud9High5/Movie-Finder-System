import React, { useState } from 'react';
import Container from '@material-ui/core/Container';


import { CommentBlock, DashboardMovieCard, MovieBlock } from "../../components";
import { useLocation, useParams } from "react-router-dom";
import Header from "../../components/header/header";
import { Alert, Box, Typography } from "@mui/material";
import { Divider } from "@material-ui/core";
import * as helpers from '../../helpers';
import { hasNoToken } from "../../helpers";

function MovieDetail () {
  const movieId = useParams().movieID;
  const [filmBasedRec, setFilmBasedRec] = React.useState([]);
  const [userBasedRec, setUserBasedRec] = React.useState([]);
  const location = useLocation();

  // if (location.state !== null) {
  //   console.log(location.state.info);
  // }


  React.useEffect(() => {
    fetch('http://localhost:5000/films/' + movieId + '/recommend/film').then(async (response) => {
      if (response.status === 200){
        const data = await response.json();
        setFilmBasedRec(data);
      }
    })
    if (!hasNoToken()) {
      const reqInfo = {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        }
      }
      fetch('http://localhost:5000/films/recommend/user', reqInfo).then(async (response) => {
        if (response.status === 200){
          const data = await response.json();
          console.log(data)
          setUserBasedRec(data);
        }
      })
    }

  }, [movieId])

  return (
    <React.Fragment>
      {/*<CssBaseline/>*/}
      <Container maxWidth="lg">
        <Header/>
        <MovieBlock id={movieId} editInfo={location.state === null ? null : location.state.info}/>
        <Box marginTop={'20px'}>
          <Typography variant={'h5'}> Similar movie you may like: </Typography>
          <Divider/>
          <Box display={'flex'} flexWrap={'wrap'}>
            {filmBasedRec.map((movie, idx) => {
              return (<DashboardMovieCard title={movie.title} poster={movie.url_poster} rating={movie.rating} movie_id={movie.f_id} key={idx}/>)
            })}
          </Box>
        </Box>
        {
          !helpers.hasNoToken() && (
            <Box marginTop={'20px'}>
              <Typography variant={'h5'}> Movies recommended based on your review history: </Typography>
              <Divider/>
              <Box display={'flex'} flexWrap={'wrap'}>
                {userBasedRec.length > 0 ? userBasedRec.map((movie, idx) => {
                  return (<DashboardMovieCard title={movie.title} poster={movie.url_poster} rating={movie.rating}
                                              movie_id={movie.f_id} key={idx}/>)
                }):
                  <Alert severity="info" sx={{ width: '100%', marginTop: '10px' }}>No recommendation, you may need to leave more reviews!</Alert>
                }
              </Box>
            </Box>
          )
        }

        {<CommentBlock/>}
      </Container>
    </React.Fragment>
  );

}

export default MovieDetail;