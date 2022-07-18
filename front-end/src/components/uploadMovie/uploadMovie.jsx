import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import {useNavigate} from "react-router-dom";
import React, {useRef} from 'react';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import * as helpers from "../../helpers";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import {Typography} from "@mui/material";

function UploadMovie() {
  const navigate = useNavigate();
  const overallRef = useRef('');
  const [movie, setMovie] = React.useState({
    "title": "",
    "year": 2022,
    "run_time": "",
    "rating_imdb": '',
    "director": "",
    "url_poster": ""
  });
  const [value, setValue] = React.useState(new Date());
  
  const uploadMovieInfo = async () => {
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
  
  return (
    <div style={{height: 400, width: '100%'}}>
      <Paper variant="outlined" sx={{my: {xs: 3, md: 3}, p: {xs: 2, md: 3}}}>
        <React.Fragment>
          <Grid container spacing={3} justifyContent="flex-start">
            {/*<Grid item xs={12} sm={8}>*/}
            {/*  <Typography variant="h3" component="div">*/}
            {/*    Create a listing*/}
            {/*  </Typography>*/}
            {/*</Grid>*/}
            <Grid item xs={12} sm={12}>
              <TextField
                required
                id="title"
                name="title"
                label="Title"
                value={movie.title || ''}
                variant="standard"
                onChange={(e) => setMovie({...movie, title: e.target.value})}
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
                      setMovie({...movie, year: parseInt(year)})
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
                  inputProps: {min: 0},
                  endAdornment: (
                    <InputAdornment position='end'>min</InputAdornment>
                  ),
                }}
                onChange={(event) => {
                  if (parseInt(event.target.value) < 0) {
                    event.target.value = "0";
                  } else {
                    setMovie({...movie, run_time: event.target.value + 'min'});
                    
                  }
                }
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">IMDB Rating</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={movie.rating_imdb.toString()}
                  label="IMDB Rating"
                  onChange={(e: SelectChangeEvent) => {
                    setMovie({...movie, rating_imdb: parseInt(e.target.value)})
                  }}
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                  <MenuItem value={5}>5</MenuItem>
                </Select>
              </FormControl>
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
                onChange={(e) => setMovie({...movie, director: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField sx={{marginTop: 2}}
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
                     style={{display: 'none'}}/>
              <label htmlFor={'upload-poster'} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <AddAPhotoIcon style={{fontSize: '100px'}}/>
                <Typography>Update Poster</Typography>
              </label>
            </Grid>
            
            <Button
              variant="contained"
              id={'createListing'}
              onClick={uploadMovieInfo}
              sx={{mt: 3, ml: 3}}
            >Upload</Button>
          </Grid>
        </React.Fragment>
      </Paper>
    
    </div>
  )
}

export default UploadMovie;