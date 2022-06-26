import React from 'react';
// import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/styles';
import Card from "@material-ui/core/Card";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
// import Button from '@mui/material/Button';
import Typography from "@material-ui/core/Typography";
import Stack from '@mui/material/Stack';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import {Rating} from "@mui/material";
import PropTypes from "prop-types";
import Divider from '@mui/material/Divider';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";


const useStyles = makeStyles({
    cards: {
        display: 'flex',
        width: 'auto',
        height: 'auto',
        flexWrap: 'wrap',
    },
    Media: {
        height: 600, width: '100%', objectFit: 'cover'
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
                        <Typography variant="h3">{props.title}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Card sx={{minWidth: 200}}>
                            <CardMedia
                                component="img"
                                className={classes.Media}
                                image={props.poster}
                                alt={props.title}
                            />
                            <CardContent>
                                <Typography gutterBottom variant="body2" component="div">
                                    <strong>Director:</strong> {props.director} / {props.year} / {props.run_time}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={1}></Grid>
                    <Grid item xs={6}>
                        <Card sx={{minWidth: 200}}>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    Overview:
                                </Typography>
                                <Divider/>
                                {props.overview}
                            </CardContent>
                        </Card>
                        <Stack direction="row" spacing={2}>
                            <Box sx={{p: 1}}>
                                <Typography gutterBottom variant="h4" component="div">
                                    Average rate: {props.rating}
                                </Typography>
                                <div>
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
                                            <Box><Rating name="read-only"
                                                         value={Object.entries(rateNums).length - index}
                                                         readOnly/></Box>
                                            <Box><Typography component="legend">{rateNums[num]}</Typography></Box>
                                        </Box>)}
                                </div>
                            </Box>
                            <Box sx={{p: 1}}>
                                <Stack direction="row">
                                    <Typography gutterBottom variant="h4" component="div">
                                        Your rate: {props.rating}
                                    </Typography>
                                    <Button variant="outlined" size="small" startIcon={<AutoFixHighOutlinedIcon/>}>
                                        Change rate
                                    </Button>
                                </Stack>
                                <Box component="fieldset" mb={1} borderColor="transparent">
                                    <Rating
                                        name="simple-controlled"
                                        defaultValue={0}
                                        size="large"
                                        // onChange={(event, newValue) => {
                                        //     setValue(newValue);
                                        // }}
                                    />
                                </Box>
                            </Box>
                        </Stack>
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