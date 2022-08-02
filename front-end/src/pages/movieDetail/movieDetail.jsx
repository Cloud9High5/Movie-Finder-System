import React, { useState } from 'react';
import Container from '@material-ui/core/Container';


import { CommentBlock, DashboardMovieCard, MovieBlock } from "../../components";
import { useParams } from "react-router-dom";
import Header from "../../components/header/header";
import { Box, Typography } from "@mui/material";
import { Divider } from "@material-ui/core";
import * as helpers from '../../helpers';

function MovieDetail () {
  const movieId = useParams().movieID;
  const [recommendedMovies, setRecommendedMovies] = React.useState([]);
  React.useEffect(() => {
    const reqInfo = {
      headers: {
        'Authorization': helpers.hasNoToken() ? '' :  'Bearer ' + localStorage.getItem('token'),
      }
    }
    fetch('http://localhost:5000/films/' + movieId + '/recommend/film', reqInfo).then(async (response) => {
      if (response.status === 200){
        const data = await response.json();
        setRecommendedMovies(data);
      }
    })
  }, [movieId])

  return (
    <React.Fragment>
      {/*<CssBaseline/>*/}
      <Container maxWidth="lg">
        <Header/>
        <MovieBlock id={movieId}/>
        {/*{movie_review && <CommentBlock props={movie_review}/>}*/}
        <Box marginTop={'20px'}>
          <Typography variant={'h5'}> Movies you may interested in: </Typography>
          <Divider/>

          <Box display={'flex'} flexWrap={'wrap'}>
            {recommendedMovies.map((movie, idx) => {
              return (<DashboardMovieCard title={movie.title} poster={movie.url_poster} rating={movie.rating} movie_id={movie.f_id} key={idx}/>)
            })}
          </Box>
        </Box>

        {<CommentBlock/>}
      </Container>
    </React.Fragment>
  );

}

export default MovieDetail;