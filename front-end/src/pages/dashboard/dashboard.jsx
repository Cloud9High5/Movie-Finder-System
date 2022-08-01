import React from 'react';
import Container from '@material-ui/core/Container';
import {Header, DashboardMovieCard, MostPopularComments} from "../../components";
import {Divider, FormControl, FormHelperText, MenuItem, Select, TextField} from "@mui/material";
import {makeStyles} from '@material-ui/styles';
import './dashboard.css';
import SearchIcon from '@mui/icons-material/Search';
const styles = makeStyles({
  cards: {
    display: 'flex',
    width: 'auto',
    height: 'auto',
    flexWrap: 'wrap',
  },
})

function Dashboard() {
  const classes = styles();
  const [movieInfo, setMovieInfo] = React.useState([]);
  const [displayMode, setDisplayMode] = React.useState('random');
  const [searchBy, setSearchBy] = React.useState('all');
  const [orderBy, setOrderBy] = React.useState('year');
  const [keyword, setKeyword] = React.useState('');
  const [searchedMovies, setSearchedMovies] = React.useState([]);

  // generate a list of random mostPopularComments id
  React.useEffect(() => {
    fetch('http://127.0.0.1:5000/films/random').then(async (response) => {
      const data = await response.json();
      setMovieInfo(data);
    });
  }, [])

  const handleSearch = async () => {
    if (searchBy === 'all' || keyword === '') {

      return;
    }
    fetch(`http://127.0.0.1:5000/films/search?method=${searchBy}&value=${keyword}&order=${orderBy}`)
      .then(res => res.json())
      .then(data => {
        setSearchedMovies(data);
      })
  }

  const randomID = () => {
    const tempID = [];
    while (tempID.length < 10) {
      const num = Math.floor(Math.random() * 1000);
      if (num === 0) continue;
      if (tempID.indexOf(num) === -1) {
        tempID.push(num);
      }
    }
    return tempID;
  }

  const changeDisplayMode = async (e) => {
    setDisplayMode(e.target.value);
    let response;
    if (e.target.value === 'random') {
      response = await fetch('http://127.0.0.1:5000/films/random');
    } else if (e.target.value === 'highest') {
      response = await fetch('http://127.0.0.1:5000/films/top/10');
    } else if (e.target.value === 'latest') {
      response = await fetch('http://127.0.0.1:5000/films/recent/10');
    }
    const data = await response.json();
    setMovieInfo(data);
  }


  return (
    <Container>
      <Header/>
      {/*<div style={{ fontSize: 40 }}>Dashboard Page</div>*/}
      <Divider variant={'middle'} textAlign={'left'}>
        <FormControl sx={{m: 1, minWidth: 120}} size={'small'}>
          <Select onChange={e => setSearchBy(e.target.value)} value={searchBy}>
            <MenuItem value={'all'}>——Search By——</MenuItem>
            <MenuItem value={'title'}>Title</MenuItem>
            <MenuItem value={'director'}>Director</MenuItem>
            <MenuItem value={'genre'}>Genre</MenuItem>
            <MenuItem value={'actor'}>Actor</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{m: 1, minWidth: 120}} size={'small'}>
          <Select onChange={e => setOrderBy(e.target.value)} value={orderBy}>
            <MenuItem value={'year'}>Sort By Year</MenuItem>
            <MenuItem value={'rating_imdb'}>Sort By Rating</MenuItem>
            <MenuItem value={'rating_doubi'}>Sort By Rating On Doubi</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{m: 1, minWidth: 120}} size={'small'}>
          <TextField size={'small'}
                     value={keyword}
                     onChange={e => setKeyword(e.target.value)}
                     InputProps={{
                       endAdornment: <SearchIcon onClick={handleSearch}/>
                     }}
                     placeholder={'Enter keyword'}/>
        </FormControl>
      </Divider>
      <div className={classes.cards}>
        {searchedMovies.map((movie, idx) => {
          return (
            <DashboardMovieCard key={idx} title={movie.title} poster={movie.url_poster}
                                rating={movie.rating} movie_id={movie.f_id}/>
          )
        })}
      </div>
      <Divider variant="middle" textAlign={'left'}>
        {/*<Chip label="Movies"/>*/}
        <FormControl sx={{m: 1, minWidth: 120}} size={'small'}>
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
            <DashboardMovieCard key={idx} title={movie.title} poster={movie.url_poster}
                                rating={movie.rating} movie_id={movie.f_id}/>
          )
        })}
      </div>
      <MostPopularComments/>
    </Container>
  )
}

export default Dashboard;