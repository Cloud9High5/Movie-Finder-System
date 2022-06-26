import React from 'react';
import Container from '@material-ui/core/Container';
import Header from "../components/header";
import DashboardMovieCard from "../components/dashboardMovieCard";
import { makeStyles } from '@material-ui/styles';
import { Divider, FormControl, FormHelperText, InputLabel, MenuItem, Select } from "@mui/material";
import MostPopularComments from "../components/movie/most_popular_comments";

const styles = makeStyles({
    cards: {
        display: 'flex',
        width: 'auto',
        height: 'auto',
        flexWrap: 'wrap',
    },
})

function Dashboard () {
    const classes = styles();
    const [movieInfo, setMovieInfo] = React.useState([]);
    const [displayMode, setDisplayMode] = React.useState('random');

    // generate a list of random movie id
    React.useEffect(() => {
        const ids = randomID();
        // const tempInfo = [...movieInfo];
        const tempInfo = [];
        ids.map(async (id) => {
            const response = await fetch('http://127.0.0.1:5000/films?id=' + id);
            const data = await response.json();
            // console.log(tempInfo);
            // console.log(data);
            tempInfo.push(data);
            setMovieInfo([...tempInfo]);
        })
    }, [])

    const randomID = () => {
        const tempID = [];
        while (tempID.length < 10) {
            const num = Math.floor(Math.random() * 100);
            if (num === 0) continue;
            if (tempID.indexOf(num) === -1) {
                tempID.push(num);
            }
        }
        return tempID;
    }

    const changeDisplayMode = async (e) => {
        console.log('Display mode: ' + e.target.value);
        setDisplayMode(e.target.value);

        if (e.target.value === 'random') {
            const ids = randomID();
            console.log(ids);
            const tempInfo = [];
            ids.map(async (id) => {
                const response = await fetch('http://127.0.0.1:5000/films?id=' + id);
                const data = await response.json();
                tempInfo.push(data);
                setMovieInfo([...tempInfo]);
            })

        } else if (e.target.value === 'highest') {
            const response = await fetch('http://127.0.0.1:5000/films/top/10');
            const data = await response.json();
            setMovieInfo(data);
        } else if (e.target.value === 'latest') {
            const response = await fetch('http://127.0.0.1:5000/films/recent/10');
            const data = await response.json();
            setMovieInfo(data);
        }
    }


    return (
        <Container>
            <Header/>
            {/*<div style={{ fontSize: 40 }}>Dashboard Page</div>*/}

            <Divider variant="middle" textAlign={'left'}>
                {/*<Chip label="Movies"/>*/}
                <FormControl sx={{ m: 1, minWidth: 120 }} size={'small'}>
                    <Select
                        value={displayMode}
                        onChange={changeDisplayMode}
                    >
                        <MenuItem value={'random'}>Random Movies</MenuItem>
                        <MenuItem value={'highest'}>Highest Rating</MenuItem>
                        <MenuItem value={'latest'}>Latest Released</MenuItem>
                    </Select>
                    <FormHelperText>Click to change the display mode.</FormHelperText>
                </FormControl>
            </Divider>
            <div className={classes.cards}>
                {movieInfo.map((movie, idx) => {
                    return (
                        <DashboardMovieCard key={idx} title={movie.title} poster={movie.poster}
                                            rating={movie.rating}/>
                    )
                })}
            </div>
            <MostPopularComments />
        </Container>
    )
}

export default Dashboard;