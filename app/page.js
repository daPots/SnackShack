// import all the stuff

'use client' 
import React, {useState, useEffect} from 'react'
import {Box, Stack, Typography, Button, Grid, TextField} from '@mui/material'
import { collection, doc, addDoc, getDoc, updateDoc, deleteDoc, QuerySnapshot, onSnapshot, query } from "firebase/firestore"
import {db} from './firebase'
import { Chewy, Baloo_2 } from 'next/font/google'
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

// cool font
const baloo = Baloo_2({subsets: 'latin', preload: false})

export default function Home() {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState({name: '', quantity: ''})

  // Add item to database
  const addItem = async (e)=>{
    e.preventDefault()
    if(newItem.name!=='' && newItem.quantity!==''){
      setItems([...items, newItem]);
      await addDoc(collection(db, 'items'), {
        name: newItem.name.trim(),
        quantity: newItem.quantity
      })
      setNewItem({name: '', quantity: ''})
    }
  }

  // Read item from database
  useEffect(() => {
    const q = query(collection(db, 'items'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let itemsArray = [];
      querySnapshot.forEach((doc) => {
        itemsArray.push({...doc.data(), id: doc.id});
      });
      setItems(itemsArray);
    })
  }, [])

  // Increase/Decresae item quantity by 1
  const changeQuantity = async (id, increment) => {
    const itemRef = doc(db, 'items', id);
    const itemDoc = await getDoc(itemRef);
    
    if (itemDoc.exists()) {
      const currentQuantity = itemDoc.data().quantity;
      if(increment===true) await updateDoc(itemRef, {quantity: currentQuantity + 1});  
      else{
        if(currentQuantity<=1) await deleteDoc(itemRef);
        else await updateDoc(itemRef, {quantity: currentQuantity - 1}); 
      }
    }
  };

  return (
  // Main box
  <Box
    width="100vw"
    height="100vh"
    display={"flex"}
    justifyContent={"center"}
    flexDirection={"column"}
    alignItems={"center"}
    backgroundColor={"#E7F59E"}>
      {/* Box for the title */}
      <Box
        sx={{borderRadius:5}}
        width="800px"
        height="100px"
        display="flex"
        alignItems="center"
        justifyContent="center">
          <Typography 
            className={baloo.className}
            variant={"h1"} 
            color={"#109648"} 
            textAlign={"center"}
            fontWeight={"800"}>
              Snack Shack
          </Typography>
      </Box>
      {/* Temporary data entry method */}
      <Stack direction={'row'}>
        <TextField 
          id="outlined-basic"
          label="Name"
          variant="outlined"
          value={newItem.name}
          onChange={(e)=>setNewItem({...newItem, name: e.target.value})}/>
        <TextField
          id="outlined-basic"
          label="Quantity"
          variant="outlined"
          value={newItem.quantity}
          onChange={(e)=>setNewItem({...newItem, quantity: e.target.value})}/>
        <Button
          variant="contained"
          color="primary"
          sx={{ whiteSpace: 'nowrap' }}
          onClick={addItem}>
            Add <AddIcon fontSize='small'/>
        </Button>
      </Stack>
      {/* Main stack for each item in pantry */}
      <Stack
        spacing={1}
        sx={{
          width: "800px",
          height: "600px",
          overflow: "auto",
          backgroundColor: "#89DAFF",
          direction: { xs: 'row', sm: 'column' },
          alignItems: "flex-start",
          justifyContent: "flex-start",
          padding: "20px",
          borderRadius: 2
        }}>
        {items.map((item) => (
          //Each entry is a grid with Name, Quantity, and Add/Remove/Remove All buttons
          <Grid
            key={item}
            container
            spacing={1}
            alignItems="center"
            sx={{
              bgcolor: 'white',
              borderRadius: 2,
              padding: '10px',
              boxSizing: 'border-box',
              width: '100%',
            }}>
            <Grid item xs={4}>
              <Typography
                className={baloo.className}
                variant="h6"
                color="#333"
                fontWeight="400"
                textAlign="left">
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography
                className={baloo.className}
                variant="h6"
                color="#333"
                fontWeight="400"
                textAlign="left">
                  Quantity: {item.quantity}
              </Typography>
            </Grid>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="contained"
                color="primary"
                onClick={() => changeQuantity(item.id, true)}
                sx={{ whiteSpace: 'nowrap' }}>
                  Add 1 <AddIcon fontSize='small'/>
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => changeQuantity(item.id, false)}
                sx={{ whiteSpace: 'nowrap'}}>
                  Remove 1 <RemoveIcon fontSize='small'/>
              </Button>
            </Stack>
          </Grid>
        ))}
      </Stack>
  </Box>);
}
