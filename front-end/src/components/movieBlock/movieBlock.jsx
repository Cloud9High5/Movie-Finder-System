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
import { Rating } from "@mui/material";
import PropTypes from "prop-types";
import Divider from '@mui/material/Divider';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import Button from '@mui/material/Button';
import TextField from "@mui/material/TextField";


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

  // TODO: display rate distribution later
  console.log(props)

  return (
    <React.Fragment>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container rowSpacing={2} columnSpacing={3}>
          <Grid item xs={12}>
            <Typography variant="h3" component={"span"}>{props.title}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Card sx={{ minWidth: 200 }}>
              <CardMedia
                component="img"
                className={classes.Media}
                image={props.poster}
                alt={props.title}
              />
              <CardContent>
                <Typography gutterBottom variant="body2" component="span">
                  <strong>Director:</strong> {props.director} / {props.year} / {props.run_time}
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
                {props.overview}
              </CardContent>
            </Card>
            <Stack direction="row" spacing={2}>
              <Box sx={{ p: 1 }}>
                <Typography gutterBottom variant="h4" component="span">
                  Average rate: {props.rating}
                </Typography>
              </Box>
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
                        <div style={{ fontSize: '20px', marginLeft: '10px' }}>  {labels[hover !== -1 ? hover : rate]} </div>
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
            </Stack>
          </Grid>
        </Grid>
      </Box>

    </React.Fragment>
  );
}

MovieBlock.propTypes = {
  title: PropTypes.string,
  rating: PropTypes.number,
  poster: PropTypes.string,
  run_time: PropTypes.string,
}

export default MovieBlock;