import React from 'react';
import Container from '@material-ui/core/Container';
import Header from "../components/header";
import DashboardMovieCard from "../components/dashboardMovieCard";


function Dashboard () {
    const [movieInfo, setMovieInfo] = React.useState([]);

    // generate a list of random movie id
    React.useEffect(() => {
        const tempID = [];
        while (tempID.length < 3) {
            const num = Math.floor(Math.random() * 100);
            if (tempID.indexOf(num) === -1) {
                tempID.push(num);
            }
        }

        const tempInfo = [...movieInfo];
        tempID.map(async (id) => {
            const response = await fetch('http://127.0.0.1:5000/films?id=' + id);
            const data = await response.json();
            // console.log(tempInfo);
            console.log(data);
            tempInfo.push(data);
            setMovieInfo(tempInfo);
        })
    }, [])

    console.log(movieInfo)
    return (
        <Container>
            <Header/>
            <div style={{ fontSize: 40 }}>Dashboard Page</div>
            {}
            {movieInfo.map((movie, idx) => {
                return (
                    <DashboardMovieCard key={idx}/>
                    // <h1 key={idx}> ${movie.title} </h1>
                )
            })}
        </Container>
    )
}

export default Dashboard;