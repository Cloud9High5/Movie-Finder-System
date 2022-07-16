import React from 'react';
import {useParams} from "react-router-dom";
import {DataGrid} from "@mui/x-data-grid";


function FollowList() {
  const userID = useParams().uid;
  const [followList, setFollowList] = React.useState([]);
  
  const columns = [
    {field: 'id', headerName: 'ID', width: 70},
    {field: 'photo', headerName: 'Avatar', width: 70},
    {field: 'name', headerName: 'Name', width: 130},
    {field: 'email', headerName: 'Last name', width: 130},
  ];
  
  React.useEffect(() => {
    const reqInfo = {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    }
    fetch(`http://127.0.0.1:5000/auth/user/${userID}/following_list`, reqInfo).then(async (res) => {
      if (res.status === 200) {
        const tempData = await res.json();
        console.log(tempData)
        const data = []
        for (let i = 0; i < tempData.length; i++) {
          const temp = {
            id: i,
            photo: tempData[i].photo_url,
            name: tempData[i].username,
            email: tempData[i].email,
          }
          data.push(temp)
        }
        setFollowList(data);
      }
    })
  }, []);
  
  return (
    <div style={{height: 400, width: '100%'}}>
      {Array.isArray(followList) ?
        <DataGrid
          rows={followList}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          checkboxSelection
        /> : <div>You have a empty following list</div>}
    
    </div>
  )
}

export default FollowList;