import { StyleSheet, Image, View } from 'react-native';


export default function Galery({imageList})
{
  const GaleryDisplayed = imageList.map((imURI, index) => {
        console.log(imURI)
        return (<Image key = {index} source={{uri:imURI}} style={styles.image} />)
    })

  return(
    <View style={styles.container}>
      {GaleryDisplayed}
    </View>
  )
}

const styles = StyleSheet.create({
    image: {
      width: 150,
      height: 200,
    },
    container: {
      display: "flex",
      justifyContent: "space-around",
      flexWrap: "wrap",
      alignItems: "center",
      flexDirection:"row",
    },
  });