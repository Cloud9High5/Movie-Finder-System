import React, {useState} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import Header from '../components/header';
import MovieBlock from '../components/movie/movie_block';
import CommentBlock from "../components/review/comment_block";
import {useParams} from "react-router-dom";


export default function MovieDetail() {
    const movieId = useParams().movieID;
    // const token = localStorage.getItem('token');
    const [movie_meta_data, setMovie_movie_data] = useState({
            title: '',
            year: '',
            run_time: '',
            rating: '',
            overview: '',
            director: '',
            poster: ''
        }
    );
    React.useEffect(() => {
        async function fetchMovie() {
            // You can await here
            const detail = await fetch('http://127.0.0.1:5000/films?id=' + movieId);
            const detailData = await detail.json();
            console.log(detailData);
            setMovie_movie_data(detailData);
        }

        fetchMovie();
    }, []);

    return (
        <React.Fragment>
            <CssBaseline/>
            <Container maxWidth="lg">
                <Header/>
                <MovieBlock
                    title={movie_meta_data.title}
                    year={movie_meta_data.year}
                    run_time={movie_meta_data.run_time}
                    rating={movie_meta_data.rating}
                    overview={movie_meta_data.overview}
                    director={movie_meta_data.director}
                    poster={movie_meta_data.poster}
                />
                <CommentBlock/>
            </Container>
        </React.Fragment>
    );
}