import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import { CommentBlock, MovieBlock } from "../../components";
import { useParams } from "react-router-dom";
import Header from "../../components/header/header";
import * as helpers from "../../helpers";

function MovieDetail () {
    const movieId = useParams().movieID;
    return (
        <React.Fragment>
            {/*<CssBaseline/>*/}
            <Container maxWidth="lg">
                <Header/>
                <MovieBlock id={movieId}/>
                {/*{movie_review && <CommentBlock props={movie_review}/>}*/}
                {<CommentBlock/>}
            </Container>
        </React.Fragment>
    );
}

export default MovieDetail;