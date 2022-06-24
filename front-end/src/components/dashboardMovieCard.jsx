import React from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CardActionArea } from "@mui/material";

function DashboardMovieCard (props) {
    console.log(props);
    return (
        <Card sx={{ maxWidth: 210, marginLeft: 2, marginRight: 2, marginTop: 2 }}>
            <CardActionArea>
                <CardMedia
                    component="img"
                    image={props.poster}
                    sx={{ width: 210, height: 307 }}
                    alt={'poster of ' + props.title}
                />
                <CardContent>
                    <Typography gutterBottom variant="h6" component="div" noWrap={true}>
                        {props.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        IMDB Rating: {props.rating}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}

DashboardMovieCard.propTypes = {
    title: PropTypes.string,
    rating: PropTypes.string,
    poster: PropTypes.string,
}

export default DashboardMovieCard;