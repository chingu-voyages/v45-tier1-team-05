//Fetch Users geolocation of the user
const getData = async function () {
  try {
    const res = await fetch(
      'https://ipinfo.io/json?country?token=178565da107c5e'
    )
    const data = await res.json()
    return { city: data.city, country: data.country }
  } catch (error) {
    console.error('Error fetching geolocation:', error)
    return null
  }
}

//If we have received good data, it will display the country in the console
getData().then((geoLocation) => {
  if (geoLocation) {
    console.log("User's location:", geoLocation)
  }
})
