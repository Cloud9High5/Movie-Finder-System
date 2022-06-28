import React, {useRef} from 'react';
// import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/styles';
import Card from "@material-ui/core/Card";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Modal from '@mui/material/Modal';
import Typography from "@material-ui/core/Typography";
import Stack from '@mui/material/Stack';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import {Rating} from "@mui/material";
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


export default function MovieBlock(props) {
    const classes = useStyles();
    const [visibility, setVisibility] = React.useState(false);
    const [rate, setRate] = React.useState(0);
    const commentRef = useRef('');
    const handleOpen = () => setVisibility(true);
    const handleClose = () => setVisibility(false);
    // const rateNums = {
    //     five_star: 100,
    //     four_star: 87,
    //     three_star: 20,
    //     two_star: 4,
    //     one_star: 1,
    // };
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

    const rateMovie = async () => {
        handleClose();

        const requestInfo = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // movie_id: props.id,
                movie_id: parseInt(props.id),
                uid: parseInt(localStorage.getItem('token')),
                rating: rate,
                review: commentRef.current.value
            }),
        };
        console.log(requestInfo)
        const response = await fetch('http://127.0.0.1:5000/review', requestInfo);

        const result = await response.json();
        console.log('result is: ', JSON.stringify(result));


    }

    return (
        <React.Fragment>
            <Box sx={{flexGrow: 1}}>
                <Grid container rowSpacing={2} columnSpacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h3" component={"span"}>{props.title}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <Card sx={{minWidth: 200}}>
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
                        <Card sx={{minWidth: 200}}>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="span">
                                    Overview:
                                </Typography>
                                <Divider/>
                                {props.overview}
                            </CardContent>
                        </Card>
                        <Stack direction="row" spacing={2}>
                            <Box sx={{p: 1}}>
                                <Typography gutterBottom variant="h4" component="span">
                                    Average rate: {props.rating}
                                </Typography>
                                {/*<React.Fragment>*/}
                                {/*    {Object.keys(rateNums).map((num, index) =>*/}
                                {/*        <Box component="fieldset" mb={3}*/}
                                {/*             borderColor="transparent"*/}
                                {/*             sx={{*/}
                                {/*                 display: 'flex',*/}
                                {/*                 flexDirection: 'row',*/}
                                {/*                 p: 1,*/}
                                {/*                 m: 1,*/}
                                {/*                 borderRadius: 1,*/}
                                {/*             }}*/}
                                {/*             key={index}*/}
                                {/*        >*/}
                                {/*            <Box><Rating name="read-only"*/}
                                {/*                         value={Object.entries(rateNums).length - index}*/}
                                {/*                         readOnly/></Box>*/}
                                {/*            <Box><Typography component="legend">{rateNums[num]}</Typography></Box>*/}
                                {/*        </Box>)}*/}
                                {/*</React.Fragment>*/}
                            </Box>
                            <Box sx={{p: 1}}>
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
                                            <Rating
                                                name="simple-controlled"
                                                value={rate}
                                                size="large"
                                                onChange={(event, newValue) => {
                                                    setRate(newValue);
                                                }}
                                            />
                                            <TextField sx={{marginTop: 2}}
                                                       fullWidth
                                                       id="outlined-basic"
                                                       label="Leave a comment..."
                                                       variant={"outlined"}
                                                       multiline
                                                       inputRef={commentRef}
                                                       rows={6}/>
                                            <Button sx={{marginTop: 2}}
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
    rating: PropTypes.string,
    poster: PropTypes.string,
    run_time: PropTypes.string,
}