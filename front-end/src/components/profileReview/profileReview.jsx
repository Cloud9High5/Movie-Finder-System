import React from 'react';
import { useParams } from "react-router-dom";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow
} from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const columns = [
  { id: 'created_time', label: 'Date', minWidth: 100 },
  { id: 'content', label: 'Content', minWidth: 200 },
  { id: 'rating', label: 'Rating', minWidth: 30 },
  { id: 'like', label: 'Like', minWidth: 30 },
  { id: 'dislike', label: 'Dislike', minWidth: 30 },
  { id: 'operation', label: 'Operation', minWidth: 30 },
];

function ProfileReview () {
  const uid = useParams().uid;
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [data, setData] = React.useState([]);
  const [flag, setFlag] = React.useState(true);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // whether this page displays the user's own info
  const isSelf = () => {
    const self = localStorage.getItem('uid');
    return self === uid;
  }

  React.useEffect(() => {
    fetch("http://localhost:5000/review?method=u_id&u_id=" + uid, {headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}}).then(async (response) => {
      const data = await response.json();
      console.log(data);
      Array.isArray(data) ?
        setData(data)
        :
        setData([])
    })
  }, [flag])

  const deleteReview = async (rid) => {
    const reqInfo = {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      },
    }
    const response = await fetch('http://127.0.0.1:5000/review?r_id=' + rid, reqInfo);
    if (response.status === 200) {setFlag(!flag)}
    const data = await response.json();
    console.log(data);
  }

  return (
    <>
      <h1>ProfileReview</h1>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 640 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, idx) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={idx}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        if (column.id === 'operation') {
                          return null;
                        }
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format && typeof value === 'number'
                              ? column.format(value)
                              : value}
                          </TableCell>
                        );
                      })}
                      <TableCell>
                        {
                          isSelf() ?
                            <Button variant={'outlined'} color={'warning'} endIcon={<RemoveCircleOutlineIcon/>}
                                    sx={{ textTransform: 'none' }} onClick={() => deleteReview(row.r_id)}>Delete</Button>
                            :
                            <>
                              <Button variant={'outlined'} color={'info'}
                                      endIcon={<ThumbUpIcon sx={{ marginLeft: '12px' }}/>}
                                      sx={{ width: '80px', marginBottom: '5px', textTransform: 'none' }}>Like</Button>
                              <Button variant={'outlined'} color={'error'} endIcon={<ThumbDownAltIcon/>}
                                      sx={{ width: '80px', marginTop: '5px', textTransform: 'none' }}>Dislike</Button>
                            </>
                        }
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  )
}

export default ProfileReview