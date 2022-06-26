import React, {useState} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import Header from '../components/header';
import MovieBlock from '../components/movie/movie_block';
import Comments from "../components/movie/comments";
import Box from "@mui/material/Box";


export default function MovieDetail() {

    const [movie_meta_data, setMovie_movie_data] = useState({
        name: "Titanic",
        director: "James Cameron",
        country: "America",
        img: "example.png",
        mean_rate: 4.8,
        rate: {
            five_star: 100,
            four_star: 87,
            three_star: 20,
            two_star: 4,
            one_star: 1,
        }
    });

    return (
        <React.Fragment>
            <CssBaseline/>
            <Container maxWidth="lg">
                <Header/>
                <MovieBlock props={movie_meta_data}/>
                <Box marginTop={'30px'}>
                    <Comments />
                </Box>
            </Container>
        </React.Fragment>
    );
}