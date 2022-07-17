import React from 'react';
import {useParams} from "react-router-dom";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from "@mui/material/Button";

function createData(uid, photo, name, email) {
  return {uid, photo, name, email};
}

function isSelf(userID) {
  return userID === localStorage.getItem('uid');
}

function FollowList() {
  const userID = useParams().uid;
  const [followList, setFollowList] = React.useState([]);
  
  const unfollow = async (uid) => {

    const requestInfo = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      },
    };
    const response = await fetch(`http://127.0.0.1:5000/auth/user/${uid}/following_list`, requestInfo);
    if (response.status === 200) {
      window.location.reload();
    } else {
      alert("Please login first")
      window.location.reload();

    }
  }
  
  
  React.useEffect(() => {
    const reqInfo = {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    }
    // TODO: error when returned content is empty
    fetch(`http://127.0.0.1:5000/auth/user/${userID}/following_list`, reqInfo).then(async (res) => {
      if (res.status === 200) {
        const tempData = await res.json();
        console.log(tempData)
        const data = []
        for (let i = 0; i < tempData.length; i++) {
          data.push(createData(tempData[i].u_id,tempData[i].photo_url, tempData[i].username, tempData[i].email))
        }
        setFollowList(data);
      }
    })
  }, []);
  console.log(followList)
  return (
    <div style={{height: 400, width: '100%'}}>
      {Array.isArray(followList) ? <TableContainer component={Paper}>
        <Table sx={{minWidth: 650}} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Photo</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              {isSelf(userID) ? <TableCell></TableCell> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {followList.map((row) => (
              <TableRow
                key={row.name}
                sx={{'&:last-child td, &:last-child th': {border: 0}}}
              >
                <TableCell>{row.photo}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                {isSelf(userID) ? <TableCell>
                  <Button variant="contained" onClick={() => unfollow(row.uid)}>Unfollow</Button>
                </TableCell> : null}
                
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer> : <div>You have a empty following list</div>}
    
    </div>
  )
}

export default FollowList;