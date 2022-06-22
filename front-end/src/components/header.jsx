import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
// import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import {lightGreen} from '@material-ui/core/colors';


const useStyles = makeStyles((theme) => ({
    toolbar: {
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: "darkgreen",
    },
    toolbarTitle: {
        flex: 1,
        fontWeight: "bold",
        fontFamily: "Roboto",
    },
    toolbarSecondary: {
        justifyContent: 'space-between',
        overflowX: 'auto',
    },
    toolbarLink: {
        padding: theme.spacing(1),
        flexShrink: 0,
    },
    green: {
        backgroundColor: lightGreen[500],
    },
}));

export default function Header() {
    const classes = useStyles();

    return (
        <React.Fragment>
            <Toolbar className={classes.toolbar}>

                <Typography
                    component="h2"
                    variant="h4"
                    color="inherit"
                    align="left"
                    noWrap
                    className={classes.toolbarTitle}
                >
                    DOUBI
                </Typography>
                {/*When not login, sign up button, when login, avator*/}
                {/*<Button variant="outlined" size="small">*/}
                {/*    Sign up*/}
                {/*</Button>*/}
                <Avatar className={classes.green}>N</Avatar>
            </Toolbar>

        </React.Fragment>
    );
}

Header.propTypes = {
    sections: PropTypes.array,
    title: PropTypes.string,
};