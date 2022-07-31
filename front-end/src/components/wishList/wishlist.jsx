import React from 'react';
import { useNavigate, useParams } from "react-router-dom";
import * as helpers from "../../helpers";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from "@mui/material";
import CardMedia from "@mui/material/CardMedia";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { hasNoToken } from "../../helpers";


const columns = [
  { id: 'url_poster', label: 'Poster', minWidth: 30 },
  { id: 'title', label: 'Movie', minWidth: 30 },
  { id: 'rating', label: 'Rating', minWidth: 30 },
  { id: 'run_time', label: 'Runtime', minWidth: 30 },
  { id: 'year', label: 'Year', minWidth: 30 },
  { id: 'genres', label: 'Genre', minWidth: 30 },
  { id: 'actors', label: 'Casts', minWidth: 30 },
  { id: 'operation', label: 'Operation', minWidth: 30 },
];

function Wishlist () {
  const uid = useParams().uid;
  const path = useNavigate();
  const [wishList, setWishList] = React.useState([]);
  const [userInfo, setUserInfo] = React.useState({});
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [flag, setFlag] = React.useState(true);
  const [clientWishlist, setClientWishlist] = React.useState([]);

  // obtain user's wishlist
  React.useEffect(() => {
    fetch('http://localhost:5000/auth/user/' + uid + '/wish_list').then(async (response) => {
      const data = await response.json();
      setWishList(data);
    })
  }, [flag, uid])
  // obtain target user info
  React.useEffect(() => {
    const reqInfo = {
      headers: {
        'Authorization': helpers.hasNoToken() ? '' : 'Bearer ' + localStorage.getItem('token'),
      },
    }
    fetch(`http://127.0.0.1:5000/auth/user/${uid}`, reqInfo).then(async (response) => {
      const data = await response.json();
      setUserInfo({ ...data });
    })
  }, [uid])
  // obtain user's own wishlist
  React.useEffect(() => {
    if (hasNoToken()){return}
    fetch('http://localhost:5000/auth/user/' + localStorage.getItem('uid') + '/wish_list').then(async (r) => {
      const d = await r.json();
      setClientWishlist(d);
    })
  }, [flag])
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const removeFromWishlist = async (fid) => {
    if (helpers.hasNoToken()) {
      alert("Please login first");
      return
    }
    const requestInfo = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      },
    };
    const response = await fetch('http://127.0.0.1:5000/auth/user/wish_list/' + fid, requestInfo);
    if (response.status !== 200) {
      const data = await response.json();
      alert(data);
    } else {
      setFlag(!flag);
    }
  }
  const addToWishlist = async (fid) => {
    if (helpers.hasNoToken()) {
      alert("Please login first");
      return
    }
    const requestInfo = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      },
    };
    for (const r of clientWishlist) {
      if (r.f_id === fid) {
        return  // movie already in user's wishlist
      }
    }
    const response = await fetch('http://127.0.0.1:5000/auth/user/wish_list/' + fid, requestInfo);
    if (response.status !== 200) {
      const data = await response.json();
      alert(data);
    } else {
      setFlag(!flag);
    }
  }
  const toMovieInfo = (fid) => {
    path('../movie_detail/' + fid);
  }
  return (
    <>
      <h1>{userInfo.is_self ? 'Your' : userInfo.username + '\'s'} wishlist</h1>

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
              {wishList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, idx) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={idx}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        if (column.id === 'operation') {
                          return (
                            <TableCell key={column.id}>
                              {userInfo.is_self ?
                                <Button variant={'outlined'} color={'warning'} endIcon={<RemoveCircleOutlineIcon/>}
                                        sx={{ textTransform: 'none' }} size={'small'}
                                        onClick={() => removeFromWishlist(row.f_id)}>Remove</Button>
                                : <Button variant={'outlined'} color={'info'} endIcon={<CheckCircleOutlineIcon/>}
                                          sx={{ textTransform: 'none' }} size={'small'}
                                          onClick={() => addToWishlist(row.f_id)}>Add</Button>
                              }

                            </TableCell>
                          );
                        } else if (column.id === 'url_poster') {
                          return (
                            <TableCell key={column.id}>
                              <CardMedia
                                component="img"
                                image={value}
                                sx={{ width: 60 }}
                                alt={'poster of ' + row.title}
                              />
                            </TableCell>
                          );
                        } else if ((column.id === 'genres') || (column.id === 'actors')) {
                          return (
                            <TableCell key={column.id}>
                              {
                                row[column.id].length > 0 ?
                                  row[column.id].join(', ')
                                  : 'N/A'
                              }
                            </TableCell>
                          )
                        } else if (column.id === 'title') {
                          return (
                            <TableCell key={column.id}>
                              <Typography sx={{ cursor: 'pointer' }}
                                          onClick={() => toMovieInfo(row.f_id)}>{row.title}</Typography>
                            </TableCell>
                          )
                        }
                        return (
                          <TableCell key={column.id}>
                            {column.format && typeof value === 'number'
                              ? column.format(value)
                              : value}
                          </TableCell>
                        );
                      })}
                      <TableCell>

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
          count={wishList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  )
}


export default Wishlist;