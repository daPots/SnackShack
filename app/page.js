// import all the stuff

'use client' 
import React, {useState, useEffect, useRef} from 'react'
import {Camera} from "react-camera-pro";
import {Box, Stack, Typography, Button, Grid, TextField, ImageList, ImageListItem} from '@mui/material'
import {collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, QuerySnapshot, onSnapshot, query, where} from "firebase/firestore"
import {db} from './firebase'
import { Chewy, Baloo_2 } from 'next/font/google'
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

// cool font
const baloo = Baloo_2({subsets: 'latin', preload: false})

export default function Home() {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState({name: '', quantity: ''})

  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [image, setImage] = useState(null);
  const camera = useRef(null);

  // Add item to database
  const addItem = async (e) => {
    e.preventDefault();
    if (newItem.name.trim() !== '' && newItem.quantity.trim() !== '') {
      const itemName = newItem.name.trim();
      const itemQuantity = parseInt(newItem.quantity, 10)||0;
      // Check if item already exists
      const q = query(collection(db, 'items'), where("name", "==", itemName));
      const querySnapshot = await getDocs(q);
      // if exists, update quantity
      if (!querySnapshot.empty) {querySnapshot.forEach(async (doc) => {
          const itemRef = doc.ref;
          const itemDoc = await getDoc(itemRef);
          const currentQuantity = itemDoc.data().quantity;
          await updateDoc(itemRef, { quantity: currentQuantity + itemQuantity });
        });
      } // if not, add as new item
      else await addDoc(collection(db, 'items'), {name: itemName, quantity: itemQuantity});

      setNewItem({ name: '', quantity: '' });
    }
  };


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

  // check if camera is available on client side
  useEffect(() => {setCameraAvailable(typeof window !== 'undefined')}, []);

  // need this to convert photo data url from base-64 to blob format
  const dataURLToBlob = (dataURL) => {
    const [header, data] = dataURL.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(data);
    const array = [];
    for (let i = 0; i < binary.length; i++) {array.push(binary.charCodeAt(i));}
    return new Blob([new Uint8Array(array)], { type: mime });
  };  
  
  // camera takes photo if working
  const handleTakePhoto = async () => {
    if (camera.current) {
      try {
        // take pic
        const photoDataURL = await camera.current.takePhoto();
        // convert data URL to Blob
        const photoBlob = dataURLToBlob(photoDataURL);
        const photoUrl = URL.createObjectURL(photoBlob);
        setImage(photoUrl);
        // Hide camera after taking photo
        setCameraVisible(false);
      } catch (error) {console.error('Error taking photo:', error);}
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
      {/* Stack for camera section and main list section */}
      <Stack
        sx={{
          width: "95vw",
          height: "80vh",
          overflow: "auto",
          backgroundColor: "white",
          direction: "row",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "20px",
          borderRadius: 2}}>
          {/* Camera & Data entry section */}
          <Stack direction={'column'} marginRight={"50px"}>
            {cameraVisible ? (
              <>
                <Camera ref={camera} aspectRatio={1 / 1} />
                <Button disableElevation color='success' variant='contained' onClick={handleTakePhoto}>Take Picture</Button>
              </>) : (
              <Button disableElevation color='success' variant='contained' onClick={() => setCameraVisible(true)}>Turn On Camera</Button>
            )}
            <ImageList sx={{ width: 300, height: 300 }} cols={1}>
              {image && (
                <ImageListItem key={image}>
                  <img
                    src={image}
                    alt={"picture"}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </ImageListItem>
              )}
            </ImageList>
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
              alignItems: "center",
              justifyContent: "flex-start",
              padding: "20px",
              borderRadius: 2}}>
                <Typography
                  className={baloo.className}
                  variant={"h3"} 
                  color={"#109648"} 
                  fontWeight={"800"}>
                    Items:
                </Typography>
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
                        disableElevation
                        variant="contained"
                        color="primary"
                        onClick={() => changeQuantity(item.id, true)}
                        sx={{ whiteSpace: 'nowrap' }}>
                          Add 1 <AddIcon fontSize='small'/>
                      </Button>
                      <Button
                        disableElevation
                        variant="contained"
                        color="secondary"
                        onClick={() => changeQuantity(item.id, false)}
                        sx={{ whiteSpace: 'nowrap'}}>
                          Remove 1 <RemoveIcon fontSize='small'/>
                      </Button>
                    </Stack>
                  </Grid>))}
          </Stack>
      </Stack>
  </Box>);
}
