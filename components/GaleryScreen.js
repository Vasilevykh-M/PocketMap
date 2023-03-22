import Button from "./Button";
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import Galery from "./Galery";
import {ScrollView} from "react-native";
import { Database } from "./Database";



export default function GaleryScreen({route, navigation}) {

  const {index, imList} = route.params;

  const [im, setIm] = useState(imList);

  const [newIm, setNewIm] = useState([]);

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setIm(im=>[...im, result.assets[0].uri]);
      setNewIm(newIm=>[...newIm, result.assets[0].uri]);
    } else {
      alert('You did not select any image.');
    } 
  };

  const setIminDB = () =>
  {
    newIm.map((imag)=>{Database.insertImage({id:index, image:imag})})
  }

  return (
    <ScrollView>
      <Galery imageList={im}/>
      <Button label = "Choose a photo" theme={"primary"} onPress = {()=> pickImageAsync()}/>
      <Button label = "Save changes" theme = {"not"} onPress={()=> {newIm.length != 0 ? setIminDB():console.log("empty"), navigation.navigate("Home", {ind:index, imL:im})}}/>
    </ScrollView>
  );
}
