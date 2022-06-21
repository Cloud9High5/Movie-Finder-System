import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/styles';
import Paper from '@mui/material/Paper';
import Card from "@material-ui/core/Card";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from "@material-ui/core/Typography";
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import {Rating} from "@mui/material";

const useStyles = makeStyles({
    Card: {
        width: 200, margin: 'auto'
    }, Media: {
        height: 500, width: '100%', objectFit: 'cover'
    }
});


export default function MovieBlock({props}) {

    const classes = useStyles();
    const rateNums = props.rate;

    return (
        <React.Fragment>
            <Box sx={{flexGrow: 1}}>
                <Grid container rowSpacing={2} columnSpacing={5}>
                    <Grid item xs={12}>
                        <Typography variant="h2">{props.name}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Card sx={{minWidth: 200}}>
                            <CardMedia
                                component="img"
                                className={classes.Media}
                                image="https://upload.wikimedia.org/wikipedia/en/1/18/Titanic_%281997_film%29_poster.png"
                                alt={props.name}
                            />
                            <CardContent>
                                <Typography gutterBottom variant="body2" component="div">
                                    Director:{props.director}
                                </Typography>
                                <Typography gutterBottom variant="body2" component="div">
                                    Country:{props.country}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={6}>
                        <Typography gutterBottom variant="h5" component="div">
                            Rating
                        </Typography>
                        <Box>Average rate:{props.mean_rate}</Box>
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
                                    <Box><Rating name="read-only" value={Object.entries(rateNums).length - index} readOnly/></Box>
                                    <Box><Typography component="legend">{rateNums[num]}</Typography></Box>
                                </Box>)}
                        </div>
                    </Grid>
                </Grid>

            </Box>

        </React.Fragment>);
}