import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import{useState, useEffect} from 'react';
import axios from 'axios';

const columns = [
  { id: 'symbol', label: 'Symbol', minWidth: 170 },
  { id: 'description', label: 'Description', minWidth: 100 },
  {
    id: 'asset',
    label: 'Underlying Asset',
    minWidth: 170,
    align: 'right',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'price',
    label: 'Marked Price',
    minWidth: 170,
    align: 'right',
    format: (value) => value.toLocaleString('en-US'),
  }
];

export default function StickyHeadTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(100);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const [rows, setRows] = useState([]);
  const [symbols, setSymbols] = useState({});
  useEffect(()=>{
    axios.get('https://api.delta.exchange/v2/products').then(res=>{
      var strippedDataArray = [];
      var symbolArray = [];
      var symbolsMap = {};
      res.data.result.map((item)=>{
       var row = {};
        symbolArray.push(item.symbol);
       row.symbol = item.symbol;
       row.description = item.description;
       row.asset = item.underlying_asset.symbol;
       row.price = symbols[row.symbol];
        strippedDataArray.push(row);
      });
     //console.log(symbolArray)
     setRows(strippedDataArray);
     let ws = new WebSocket('wss://production-esocket.delta.exchange');
     ws.onopen = function(){
       var subCall = {   "type": "subscribe",   "payload": {     "channels": [       {         "name": "v2/ticker",         "symbols": symbolArray       }     ]   } };
       ws.send(JSON.stringify(subCall))
     }    
     
     ws.onmessage = function(msg) {
       var data = JSON.parse(msg.data);
       if(data.symbol)
       {
         console.log("Our symbol is:" + data.symbol);
        symbolsMap[data.symbol]=data.mark_price;
        setSymbols(symbolsMap);
       }
     }
    })
  }, [symbols]);


  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 1000 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead style={{borderRadius:'0px'}}>
            <TableRow >
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth, backgroundColor:"teal", borderRadius:'0', height:'10px', color:"white", fontSize:'24px' , margin:'10px'}}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.symbol}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
