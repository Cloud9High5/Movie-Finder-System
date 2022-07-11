import React from 'react';
import { useParams } from "react-router-dom";

function ProfileReview() {
    const uid = useParams().uid;

    console.log(uid)


    return (
        <h1>ProfileReview</h1>
    )
}

export default ProfileReview