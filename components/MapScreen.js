import React, { useEffect } from 'react';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import { useState, useRef  } from 'react';
import {Database} from './Database'
import * as Notifications from 'expo-notifications';
import * as TaskManager from "expo-task-manager"
import * as Device from 'expo-device';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const LOCATION_TASK_NAME = "LOCATION_TASK_NAME"



export default function MapScreen({navigation, route}) {
  const [init, setInit] = useState(false)
  const markers = []
  const images = [{index:-1, list:[]}]
  const loaded = []
  const notificat = []
  const [marlersD, setData] = useState(markers)
  const [im, setIm] = useState(images)
  const [load, setLoaded] = useState(loaded)
  const [notif, setNotif] = useState(notificat)

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState([]);
  const notificationListener = useRef();
  const responseListener = useRef();


  

  useEffect(() => {
    const requestPermissions = async () => {
      const foreground = await Location.requestForegroundPermissionsAsync()
      if (foreground.granted) await Location.requestBackgroundPermissionsAsync()
    }
    requestPermissions()
  }, [])

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(noti => {
      console.log(noti);
      setNotification(notification=>[...notification, noti]);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  

  const startBackgroundUpdate = async () => {
    const { granted } = await Location.getBackgroundPermissionsAsync()
    if (!granted) {
      console.log("location tracking denied")
      return
    }
    const isTaskDefined = await TaskManager.isTaskDefined(LOCATION_TASK_NAME)
    if (!isTaskDefined) {
      console.log("Task is not defined")
      return
    }

    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME
    )
    if (hasStarted) {
      console.log("Already started")
      return
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "Location",
        notificationBody: "Location tracking in background",
        notificationColor: "#fff",
      },
    })
  }

  async function registerForPushNotificationsAsync() {
    let token;
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    return token;
  }


  TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
      console.error(error)
      return
    }
    if (data) {
      const { locations } = data
      const location = locations[0]
      if (location) {
        for(let i = 0; i < marlersD.length; i++)
        {
          if(Math.abs(location.coords.latitude - marlersD[i].latitude)*111.3*1000 +
           Math.abs(location.coords.longitude - marlersD[i].longitude)*111.3*1000 < 10)
          {
            
            if(notif[i]["noti"] == false){
              notif[i]["noti"] = true
              schedulePushNotification(i, marlersD[i].latitude, marlersD[i].longitude)
              console.log({"insert": {"latitude":location.coords.latitude, "longitude": location.coords.longitude}})
            }
          }
          else
          {
            if(notif[i]["noti"] == true && notification.length > 0)
            {
  
              console.log(Math.abs(location.coords.latitude - marlersD[i].latitude)*111.3*1000 +
              Math.abs(location.coords.longitude - marlersD[i].longitude)*111.3*1000)
              console.log({"delete": {"latitude":location.coords.latitude, "longitude": location.coords.longitude}})
  
              let id = -1;
              console.log(i);
              for(let j = 0;j < notification.length; j++)
              {
                console.log(notification[j]["request"]["content"]["data"]["data"])
                if(notification[j]["request"]["content"]["data"]["data"]["index"] == i)
                {
                  console.log(i)
                  id = j;
                  break;
                }
              }
              if(id != -1){
                Notifications.dismissNotificationAsync(notification[id]["request"]["identifier"])
                let r =  notification.filter(I=>I["request"]["content"]["data"]["data"]["index"] != i)
                setNotification(r)
                notif[i]["noti"] = false
                }
            }
          }
        }
        
      }
    }
  })

  function getImList(imList, index)
  {
    im.filter(i=>i["index"] == index)[0]["list"] = Array.from(imList, x=>x["image"]);
  }

  const setImages = (arr) =>{
    for (let q = 0; q < arr.length;q++)
    {
      setIm(im=>[...im, {index: q, list: []}])
      setLoaded(load=>[...load, {index: q, load: false}])
      setNotif(notif=>[...notif, {index: q, noti: false}])
    }
  }


  // инициализация, что бы на каждый перерендер не лезть в бд
  if (init == false)
  {
    Database.setupDatabaseAsync();
    Database.setupDatabaseAsyncI();
    Database.getPoints(setData, setImages);
    setInit(true);
  }

  useEffect(()=>{
    setTimeout(() =>startBackgroundUpdate(), 125)
  }, [])

  const ind = (route.params == undefined? -1: route.params.ind);
  const imL = (route.params == undefined? []: route.params.imL);


  im.filter(i=>i["index"] == ind)[0]["list"] = imL;


  function schedulePushNotification(index, latitude, longitude) {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Point number "+ index + "! 🚩",
        body: 'Here is the notification body',
        data: { data: {latitude: latitude, longitude: longitude, index: index}},
      },
      trigger: null,
    });
  }

  const onMapPress = (e) =>{
    const coordPresed = e.nativeEvent.coordinate;
    const marker = {
        id: marlersD.length,
        latitude: coordPresed.latitude,
        longitude: coordPresed.longitude,
        loaded: false,
    };
    Database.insertPoint(marker);
    setData(marlersD=>[...marlersD, marker]);
    setLoaded(load=>[...load, {index: marlersD.length, load: true}])
    setNotif(notif=>[...notif, {index: marlersD.length, noti: false}])

    const n = marlersD.length;

    const imag = {
      index: n,
      list: []
    };
    setIm(im=>[...im, imag])
  }

  const onMarkerPress = (e, index) => {
    if (load[index]["load"] == false){
      Database.getImages(index, getImList)
      load[index]["load"] = true
    }
    setTimeout(() => navigation.navigate("Galery", {index: index, imList: im.filter(i=>i["index"] == index)[0]["list"]}), 125)
  }

  const markersDisplayed = marlersD.map((marker, index) => {
    return (
      <Marker
            key = {index}
            coordinate={marker}
            title={"Title"}
            description={"Description"}
            onPress = {(e) => onMarkerPress(e, index)}
        />)
  })

  return (
    <View style={styles.container}>
      <MapView 
      showsUserLocation={true}
      initialRegion={{
        latitude: 58.043163,
        longitude: 56.038219,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      onPress={onMapPress}
      style={styles.map}>
        {markersDisplayed}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});