import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { useNavigate } from "react-router-dom";
import React, { useRef } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import InputAdornment from "@mui/material/InputAdornment";
import * as helpers from "../../helpers";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { Box, Tooltip, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import IconButton from '@mui/material/IconButton';

function UploadMovie () {
  const navigate = useNavigate();
  const overallRef = useRef('');
  const [movie, setMovie] = React.useState({
    "title": "",
    "year": 2022,
    "run_time": "",
    "rating_imdb": 0.0,
    "director": "",
    "url_poster": "",
    'genres': [],
    'actors': [],
  });
  const [value, setValue] = React.useState(new Date());
  let [genreLen, setGenreLen] = React.useState([0]);
  const [actorLen, setActorLen] = React.useState([0]);

  const uploadMovieInfo = async () => {
    if ((movie.title === '') || (movie.run_time === '') || (movie.rating_imdb === '') || (movie.director === '') || (movie.genres.length === 0) || (movie.actors.length === 0)) {
      alert('Please input all required information.')
      return
    }
    const requestInfo = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify({
        title: movie.title,
        year: movie.year,
        run_time: movie.run_time,
        rating_imdb: movie.rating_imdb,
        overview: overallRef.current.value,
        director: movie.director,
        url_poster: movie.url_poster,
        genres: movie.genres.filter(e => e.length),
        actors: movie.actors.filter(e => e.length),
      })
    };
    const response = await fetch(`http://127.0.0.1:5000/films`, requestInfo);
    if (response.status === 201) {
      const data = await response.json();
      console.log(data);
      navigate(`/movie_detail/${data.f_id}`);
    } else {
      alert("error")
      window.location.reload();
    }
  }

  const genreAction = (action) => {
    if (action === 1) {
      const temp = genreLen;
      temp.push(temp.length);
      setGenreLen([...temp]);
    } else {
      if (genreLen.length !== 1) {
        const temp = genreLen.slice(0, -1);
        setGenreLen(temp);
      }
    }
  }
  const actorAction = (action) => {
    if (action === 1) {
      const temp = actorLen;
      temp.push(temp.length);
      setActorLen([...temp]);
    } else {
      if (genreLen.length !== 1) {
        const temp = actorLen.slice(0, -1);
        setActorLen(temp);
      }
    }
  }

  const inputGenre = (e, idx) => {
    const temp = movie;
    if (e.target.value === ''){
      temp.genres[idx] = '';
    } else {
      let string = e.target.value.toLowerCase().split('');
      string[0] = string[0].toUpperCase();
      temp.genres[idx] = string.join('');
    }
    setMovie({...temp});
  }
  const inputActor = (e, idx) => {
    const temp = movie;
    if (e.target.value === ''){
      temp.actors[idx] = '';
    } else {
      let string = e.target.value.split(' ');
      for (let idx = 0; idx < string.length; idx++) {
        if (string[idx].length === 0){continue}
        string[idx] = string[idx].replace(/^\S/, s => s.toUpperCase());
      }
      temp.actors[idx] = string.join(' ');
    }
    setMovie({...temp});
  }

  // console.log(movie.actors.filter(e => e.length))

  return (
    <div style={{ height: 400, width: '100%' }}>
      <Paper variant="outlined" sx={{ my: { xs: 3, md: 3 }, p: { xs: 2, md: 3 } }}>
        <React.Fragment>
          <Grid container spacing={3} justifyContent="flex-start">
            <Grid item xs={12} sm={12}>
              <TextField
                required
                id="title"
                name="title"
                label="Title"
                value={movie.title || ''}
                variant="standard"
                onChange={(e) => setMovie({ ...movie, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  views={['year']}
                  label="Year only"
                  value={value}
                  onChange={(newValue) => {
                    const year = newValue.toString().split(' ')[3];
                    if (year[0] === "1" || year[0] === "2") {
                      setValue(newValue);
                      setMovie({ ...movie, year: parseInt(year) })
                      console.log(movie);
                    } else {
                      setValue(new Date("2022"));
                    }
                  }}
                  renderInput={(params) => <TextField {...params} helperText={null}/>}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type={"number"}
                required
                id="run_time"
                name="run_time"
                label="Time"
                value={movie.run_time.slice(0, -3)}
                fullWidth
                InputProps={{
                  inputProps: { min: 0 },
                  endAdornment: (
                    <InputAdornment position='end'>min</InputAdornment>
                  ),
                }}
                onChange={(event) => {
                  if (parseInt(event.target.value) < 0) {
                    event.target.value = "0";
                  } else {
                    setMovie({ ...movie, run_time: event.target.value + 'min' });

                  }
                }
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                type={"number"}
                id="rating_imdb"
                name="rating_imdb"
                label="IMDB rating"
                value={movie.rating_imdb.toString()}
                fullWidth
                InputProps={{
                  inputProps: { min: 0.0, max: 10.0 },
                  endAdornment: (
                    <InputAdornment position='end'>/10</InputAdornment>
                  ),
                }}
                onChange={(event) => {
                  const regex = /^((10.0)|(10|\d)|(\d)(\.\d{1}))?$/
                  if (regex.test(event.target.value)) {
                    setMovie({ ...movie, rating_imdb: parseFloat(event.target.value) });
                  } else {
                    console.log(event.target.value, movie.rating_imdb)
                    setMovie({ ...movie, rating_imdb: 0.0 });
                  }
                }
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="director"
                name="director"
                label="Director"
                value={movie.director}
                variant="standard"
                fullWidth
                onChange={(e) => setMovie({ ...movie, director: e.target.value })}
              />
            </Grid>
            {/*start of genre*/}
            <Box marginTop={2} marginLeft={4}>
            {
              genreLen.map((gen, idx) => {
                return (
                  <Grid item xs={12} sm={12} display={'flex'} marginTop={2} key={idx}>
                    <Grid item xs={2} sm={2}>
                      {`Genre ${idx + 1}: `}
                    </Grid>
                    <Grid item xs={6} sm={6}>
                      <Tooltip title="Movie Genre">
                        <TextField
                          required
                          label="Movie genre"
                          type="string"
                          InputLabelProps={{ shrink: true, }}
                          onInput={(e) => {inputGenre(e, idx)}}
                        />
                      </Tooltip>
                    </Grid>
                    {(gen === genreLen.length - 1) &&
                    <Grid item  xs={1} sm={1}>
                      <IconButton aria-label="Add genre" onClick={() => genreAction(1)}>
                        <AddIcon/>
                      </IconButton>
                      <IconButton disabled={false} aria-label="Remove genre" onClick={() => genreAction(-1)}>
                        <RemoveIcon/>
                      </IconButton>
                    </Grid>}
                  </Grid>

                )
              })
            }</Box>
            {/* actors */}
            <Box marginTop={2} marginLeft={4}>
            {
              actorLen.map((gen, idx) => {
                return (
                  <Grid item xs={12} sm={12} marginTop={2} display={'flex'} key={idx}>
                    <Grid item xs={2} sm={2}>
                      {`Actor ${idx + 1}: `}
                    </Grid>
                    <Grid item xs={6} sm={6}>
                      <Tooltip title="Actor's name">
                        <TextField
                          required
                          label="Actor"
                          type="string"
                          InputLabelProps={{ shrink: true, }}
                          onInput={(e) => {inputActor(e, idx)}}
                        />
                      </Tooltip>
                    </Grid>
                    {(gen === actorLen.length - 1) &&
                    <Grid item xs={1} sm={1}>
                      <IconButton aria-label="Add actor" onClick={() => actorAction(1)}>
                        <AddIcon/>
                      </IconButton>
                      <IconButton disabled={false} aria-label="Remove actor" onClick={() => actorAction(-1)}>
                        <RemoveIcon/>
                      </IconButton>
                    </Grid>}
                  </Grid>

                )
              })
            }
            </Box>
            <Grid item xs={12} sm={12}>
              <TextField sx={{ marginTop: 2 }}
                         fullWidth
                         id="outlined-basic"
                         label="Overview"
                         variant={"outlined"}
                         multiline
                         inputRef={overallRef}
                         required={true}
                         rows={3}

              />
            </Grid>
            <Grid item xs={12} sm={12}>
              {movie.url_poster && <img src={movie.url_poster} width={'300px'} alt={'avatar'}/>}
              <input accept={'image/*'}
                     onChange={e => {
                       helpers.loadImageFromFile(e.target.files[0])
                         .then(src => {
                           setMovie({
                             ...movie,
                             url_poster: src,
                           })
                         })
                       console.log(movie);
                     }}
                     id={'upload-poster'}
                     type={'file'}
                     style={{ display: 'none' }}/>
              <label htmlFor={'upload-poster'}
                     style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <AddAPhotoIcon style={{ fontSize: '100px' }}/>
                <Typography>Update Poster</Typography>
              </label>
            </Grid>

            <Button
              variant="contained"
              id={'createListing'}
              onClick={uploadMovieInfo}
              sx={{ mt: 3, ml: 3 }}
            >Upload</Button>
          </Grid>
        </React.Fragment>
      </Paper>

    </div>
  )
}

export default UploadMovie;