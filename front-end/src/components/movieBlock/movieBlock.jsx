import React, { useRef } from 'react';
// import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import Card from "@material-ui/core/Card";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Modal from '@mui/material/Modal';
import Typography from "@material-ui/core/Typography";
import Stack from '@mui/material/Stack';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { LinearProgress, Rating } from "@mui/material";
import PropTypes from "prop-types";
import Divider from '@mui/material/Divider';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import Button from '@mui/material/Button';
import TextField from "@mui/material/TextField";
import * as helpers from "../../helpers";


const useStyles = makeStyles({
  cards: {
    display: 'flex',
    width: 'auto',
    height: 'auto',
    flexWrap: 'wrap',
  },
  Media: {
    height: 400, width: '100%', objectFit: 'cover'
  }
});


function MovieBlock (props) {
  const classes = useStyles();
  const [visibility, setVisibility] = React.useState(false);
  const [rate, setRate] = React.useState(0);
  const [hover, setHover] = React.useState(-1);
  const commentRef = useRef('');
  const handleOpen = () => setVisibility(true);
  const handleClose = () => setVisibility(false);
  const [info, setInfo] = React.useState({rating: 0});
  const [ratePercentage, setRatePercentage] = React.useState({0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0});

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    rowSpacing: 2,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  const labels = {
    0: 'Terrible',
    1: 'Useless',
    2: 'Poor',
    3: 'Ok',
    4: 'Good',
    5: 'Excellent',
  };

  const rateMovie = async () => {
    handleClose();

    if (commentRef.current.value.length === 0) {
      alert('You need to type some words to make a review.');
      return
    }

    const requestInfo = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify({
        // movie_id: props.id,
        f_id: props.id,
        u_id: localStorage.getItem('uid'),
        rating: rate,
        content: commentRef.current.value
      }),
    };
    // console.log(requestInfo)
    const response = await fetch('http://127.0.0.1:5000/review', requestInfo);
    if (response.status === 200) {
      window.location.reload();
    } else {
      alert("Please login first")
      window.location.reload();

    }
  }

  React.useEffect(() => {
    const temp = {...ratePercentage};
    const reqInfo = {
      headers: {
        'Authorization': helpers.hasNoToken() ? '' : 'Bearer ' + localStorage.getItem('token'),
      },
    }
    fetch('http://127.0.0.1:5000/films?f_id=' + props.id, reqInfo).then(async (info) => {
      const data = await info.json();
      setInfo(data);
      let sum = 0;
      for (const key in data.rating_distribution) {sum += data.rating_distribution[key]}
      for (const [key, value] of Object.entries(data.rating_distribution)) {
        temp[key] = value === 0 ? 0 : parseInt((value / sum * 100).toFixed());
      }
      setRatePercentage({ ...temp });
    })
  }, [])

  return (
    <React.Fragment>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container rowSpacing={2} columnSpacing={3}>
          <Grid item xs={12}>
            <Typography variant="h3" component={"span"}>{info.title}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Card sx={{ minWidth: 200 }}>
              <CardMedia
                component="img"
                className={classes.Media}
                image={info.url_poster}
                alt={'poster of ' + info.title}
              />
              <CardContent>
                <Typography gutterBottom variant="body2" component="div">
                  <strong>Director:</strong> {info.director} / {info.year} / {info.run_time}
                </Typography>
                <Typography gutterBottom variant="body2" component="div">
                  <strong>IMDB Rating:</strong> {info.rating_imdb}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={1}></Grid>
          <Grid item xs={6}>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography gutterBottom variant="h5" component="span">
                  Overview:
                </Typography>
                <Divider/>
                {info.overview}
              </CardContent>
            </Card>
            <Stack direction="row" spacing={2}>
              <Box display={'flex'}>
                {/*<Box sx={{ p: 1 }}>*/}
                  {/*<Typography gutterBottom variant="h5" component="span">*/}
                  {/*  IMDB Rating: {info.rating_imdb}*/}
                  {/*</Typography>*/}
                {/*</Box>*/}
                <Box sx={{ p: 1 }}>
                  <Stack direction="row">
                    <Button variant="outlined"
                            size="large"
                            onClick={handleOpen}
                            startIcon={<AutoFixHighOutlinedIcon/>}>
                      Rate the movie!
                    </Button>
                    <Modal
                      open={visibility}
                      onClose={handleClose}
                      aria-labelledby="modal-modal-title"
                      aria-describedby="modal-modal-description"
                    >
                      <Box sx={style}
                           display="flex"
                           justifyContent="flex-start"
                           flexDirection={'column'}
                           alignItems="flex-start">
                        <Typography id="modal-modal-title" variant="h5" component="h2">
                          Rate for this movie
                        </Typography>
                        <Box display={'flex'}>
                          <Rating
                            name="simple-controlled"
                            value={rate}
                            size="large"
                            onChange={(event, newValue) => {
                              newValue === null ?
                                setRate(0)
                                : setRate(newValue)
                            }}
                            onChangeActive={(event, newHover) => {
                              setHover(newHover);
                            }}
                          />
                          <div style={{
                            fontSize: '20px',
                            marginLeft: '10px'
                          }}>  {labels[hover !== -1 ? hover : rate]} </div>
                        </Box>
                        <TextField sx={{ marginTop: 2 }}
                                   fullWidth
                                   id="outlined-basic"
                                   label="Leave a comment..."
                                   variant={"outlined"}
                                   multiline
                                   inputRef={commentRef}
                                   required={true}
                                   rows={6}/>
                        <Button sx={{ marginTop: 2 }}
                                variant="contained"
                                onClick={rateMovie}
                        >Post</Button>
                      </Box>
                    </Modal>
                  </Stack>
                </Box>
              </Box>
            </Stack>
            <Box display={'flex'} flexDirection={'column'}>
              <Box><Typography variant={'h5'}>DOUBI Rating:</Typography><Rating value={info.rating} precision={0.5} readOnly/></Box>
              <Box display={'flex'} alignItems={'center'}>
                5 star &nbsp;&nbsp; <LinearProgress variant="determinate" value={ratePercentage[5]} sx={{ width: '65%', height: 10 }}/>&nbsp;&nbsp;{ratePercentage[5]}%
              </Box>
              <Box display={'flex'} alignItems={'center'}>
                4 star &nbsp;&nbsp; <LinearProgress variant="determinate" value={ratePercentage[4]} sx={{ width: '65%', height: 10 }}/>&nbsp;&nbsp;{ratePercentage[4]}%
              </Box>
              <Box display={'flex'} alignItems={'center'}>
                3 star &nbsp;&nbsp; <LinearProgress variant="determinate" value={ratePercentage[3]} sx={{ width: '65%', height: 10 }}/>&nbsp;&nbsp;{ratePercentage[3]}%
              </Box>
              <Box display={'flex'} alignItems={'center'}>
                2 star &nbsp;&nbsp; <LinearProgress variant="determinate" value={ratePercentage[2]} sx={{ width: '65%', height: 10 }}/>&nbsp;&nbsp;{ratePercentage[2]}%
              </Box>
              <Box display={'flex'} alignItems={'center'}>
                1 star &nbsp;&nbsp; <LinearProgress variant="determinate" value={ratePercentage[1]} sx={{ width: '65%', height: 10 }}/>&nbsp;&nbsp;{ratePercentage[1]}%
              </Box>
              <Box display={'flex'} alignItems={'center'}>
                0 star &nbsp;&nbsp; <LinearProgress variant="determinate" value={ratePercentage[0]} sx={{ width: '65%', height: 10 }}/>&nbsp;&nbsp;{ratePercentage[0]}%
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

    </React.Fragment>
  );
}

// MovieBlock.propTypes = {
//   title: PropTypes.string,
//   rating: PropTypes.number,
//   rating_imdb: PropTypes.number,
//   poster: PropTypes.string,
//   run_time: PropTypes.string,
// }

export default MovieBlock;