import {DataGrid} from '@mui/x-data-grid';
import React from 'react';
import {useParams} from "react-router-dom";


function BlackList() {
  const userID = useParams().uid;
  const [blackList, setBlackList] = React.useState([]);
  
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
    
    fetch(`http://127.0.0.1:5000/auth/user/${userID}/black_list`, reqInfo).then(async (res) => {
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
        setBlackList(data);
      }
    })
    
  }, [userID]);
  
  return (
    <div style={{height: 400, width: '100%'}}>
      {Array.isArray(blackList) ?
        <DataGrid
          rows={blackList}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          checkboxSelection
        /> : <div>Your have a empty black list</div>}
    
    </div>
  )
}

export default BlackList;