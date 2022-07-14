import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import { CommentBlock, MovieBlock } from "../../components";
import { useParams } from "react-router-dom";
import Header from "../../components/header/header";

function MovieDetail () {
    const movieId = useParams().movieID;
    // const token = localStorage.getItem('token');
    const [movie_info, setMovie_info] = useState({
            title: '',
            year: '',
            run_time: '',
            rating: '',
            overview: '',
            director: '',
            poster: ''
        }
    );
    const [movie_review, setMovie_review] = useState();
    React.useEffect(() => {
        async function fetchMovie () {
            const getMovieInfo = await fetch('http://127.0.0.1:5000/films?f_id=' + movieId);
            const movieInfo = await getMovieInfo.json();
            const getMovieReview = await fetch('http://127.0.0.1:5000/review?method=f_id&f_id=' + movieId);
            const movieReview = await getMovieReview.json();
            setMovie_info(movieInfo);
            setMovie_review(movieReview);
        }

        fetchMovie();
    }, []);

    console.log(movie_info)
    return (
        <React.Fragment>
            {/*<CssBaseline/>*/}
            <Container maxWidth="lg">
                <Header/>
                <MovieBlock
                    id={movieId}
                    title={movie_info.title}
                    year={movie_info.year}
                    run_time={movie_info.run_time}
                    rating={movie_info.rating_imdb}
                    overview={movie_info.overview}
                    director={movie_info.director}
                    poster={movie_info.url_poster}
                />
                {movie_review && <CommentBlock props={movie_review}/>}
            </Container>
        </React.Fragment>
    );
}

export default MovieDetail;