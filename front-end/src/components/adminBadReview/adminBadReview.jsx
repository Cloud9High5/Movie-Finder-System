import React from 'react';
import {useParams} from "react-router-dom";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import * as helpers from "../../helpers";
import Button from "@mui/material/Button";


function createData(rid, fid, content, created_time) {
  return {rid, fid, content, created_time};
}


function AdminBadReview() {
  const userID = useParams().uid;
  const [badReview, setBadReview] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  
  const deleteReview = async (rid) => {
    if (!window.confirm('Are you sure to delete this review?')) {
      return
    }
    if (helpers.hasNoToken()) {
      return
    }
    const reqInfo = {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      },
    }
    const response = await fetch('http://127.0.0.1:5000/review?r_id=' + rid, reqInfo);
    const data = await response.json();
    if (response.status !== 200) {
      alert(data);
    } else {
      console.log(data);
      window.location.reload();
    }
  }
  
  
  React.useEffect(() => {
    const reqInfo = {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    }
    
    fetch(`http://127.0.0.1:5000/review/bad_word`, reqInfo).then(async (res) => {
      if (res.status === 200) {
        const tempData = await res.json();
        console.log(tempData)
        const data = []
        for (let i = 0; i < tempData.length; i++) {
          data.push(createData(tempData[i].r_id, tempData[i].f_id, tempData[i].content, tempData[i].created_time))
        }
        setBadReview(data);
      }
    })
    
  }, [userID]);
  
  return (
    <div style={{height: 800, width: '100%'}}>
      {badReview.length !== 0 ? <Paper sx={{width: '100%', overflow: 'hidden'}}>
        <TableContainer sx={{maxHeight: 750}}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>movie name</TableCell>
                <TableCell>content</TableCell>
                <TableCell>created time</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            {badReview.map((row) => (
              <TableRow
                key={row.rid}
                sx={{'&:last-child td, &:last-child th': {border: 0}}}
              >
                <TableCell>{row.rid}</TableCell>
                <TableCell>{row.content}</TableCell>
                <TableCell>{row.created_time}</TableCell>
                <TableCell>
                  <Button variant="contained" onClick={() => deleteReview(row.rid)}>Remove</Button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </TableContainer>
        {/*<TablePagination*/}
        {/*  rowsPerPageOptions={[10, 25, 100]}*/}
        {/*  component="div"*/}
        {/*  count={badReview.length}*/}
        {/*  rowsPerPage={rowsPerPage}*/}
        {/*  page={page}*/}
        {/*  onPageChange={handleChangePage}*/}
        {/*  onRowsPerPageChange={handleChangeRowsPerPage}*/}
        {/*/>*/}
      </Paper> : <div>Loading Review With Bad Words...</div>}
    
    </div>
  )
}

export default AdminBadReview;