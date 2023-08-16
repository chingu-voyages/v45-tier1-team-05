//Fetch Users geolocation
const getData = async function(){
    try {
        const res = await fetch("https://ipinfo.io/json?country?token=178565da107c5e")
        const data = await res.json();
        return data.country;
    } catch(error) {
        console.error('Error fetching geolocation:', error);
        return null;
    }      
}

//If we have received good data, it will display the country in the console
getData().then(country => {
    if(country) {
        console.log('User\'s country:', country);
    }
});