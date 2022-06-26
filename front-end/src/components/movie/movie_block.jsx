import React from 'react';
// import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/styles';
import Card from "@material-ui/core/Card";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
// import Button from '@mui/material/Button';
import Typography from "@material-ui/core/Typography";
// import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import {Rating} from "@mui/material";
import PropTypes from "prop-types";

import DashboardMovieCard from "../dashboardMovieCard";

const useStyles = makeStyles({
    cards: {
        display: 'flex',
        width: 'auto',
        height: 'auto',
        flexWrap: 'wrap',
    },
    Media: {
        height: 300, width: '100%', objectFit: 'cover'
    }
});


export default function MovieBlock(props) {
    const classes = useStyles();
    const rateNums = {
        five_star: 100,
        four_star: 87,
        three_star: 20,
        two_star: 4,
        one_star: 1,
    };

    return (
        <React.Fragment>
            <Box sx={{flexGrow: 1}}>
                <Grid container rowSpacing={2} columnSpacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h2">{props.title}</Typography>
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
                                <Typography gutterBottom variant="body2" component="div">
                                    Director:{props.director}
                                </Typography>
                                <Typography gutterBottom variant="body2" component="div">
                                    Year:{props.year}
                                </Typography>
                                <Typography gutterBottom variant="body2" component="div">
                                    {props.run_time}
                                </Typography>
                                <Typography gutterBottom variant="body2" component="div">
                                    Overview:{props.overview}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6}>

                        <Typography gutterBottom variant="h5" component="div">
                            Rating
                        </Typography>
                        <Box>Average rate:{props.rating}</Box>
                        <div>
                            <Box component="fieldset" mb={1} borderColor="transparent">
                                <Typography component="legend">Controlled</Typography>
                                <Rating
                                    name="simple-controlled"
                                    value={0}
                                    // onChange={(event, newValue) => {
                                    //     setValue(newValue);
                                    // }}
                                />
                            </Box>
                            {Object.keys(rateNums).map((num, index) =>
                                <Box component="fieldset" mb={3}
                                     borderColor="transparent"
                                     sx={{
                                         display: 'flex',
                                         flexDirection: 'row',
                                         p: 1,
                                         m: 1,
                                         borderRadius: 1,
                                     }}
                                     key={index}
                                >
                                    <Box><Rating name="read-only" value={Object.entries(rateNums).length - index}
                                                 readOnly/></Box>
                                    <Box><Typography component="legend">{rateNums[num]}</Typography></Box>
                                </Box>)}
                        </div>
                    </Grid>
                </Grid>
            </Box>

        </React.Fragment>);
}

MovieBlock.propTypes = {
    title: PropTypes.string,
    rating: PropTypes.string,
    poster: PropTypes.string,
    run_time: PropTypes.string,
}