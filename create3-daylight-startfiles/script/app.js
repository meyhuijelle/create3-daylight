// _ = helper functions
function _parseMillisecondsIntoReadableTime(timestamp) {
	//Get hours from milliseconds
	const date = new Date(timestamp * 1000);
	// Hours part from the timestamp
	const hours = '0' + date.getHours();
	// Minutes part from the timestamp
	const minutes = '0' + date.getMinutes();
	// Seconds part from the timestamp (gebruiken we nu niet)
	// const seconds = '0' + date.getSeconds();

	// Will display time in 10:30(:23) format
	return hours.substr(-2) + ':' + minutes.substr(-2); //  + ':' + s
}

// 5 TODO: maak updateSun functie
const updateSun = (zon, links, bot, vandaag) => {
	zon.style.left = `${links}%`;
	zon.style.bottom = `${bot}%`;
	zon.setAttribute('data-time', ('0' + vandaag.getHours()).slice(-2) +	':' +('0' + vandaag.getMinutes()).slice(-2)
	);
}


let itBeNight = () => {
	document.querySelector('html').classList.add('is-night');
};

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = (totalMinutes, sunrise) => {
	// In de functie moeten we eerst wat zaken ophalen en berekenen.
	// Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
	
	const zon = document.querySelector('.js-sun'), minutenTotOndergang = document.querySelector('.js-time-left');
	
	let dagVandaag = new Date();
	const zonsopgangDatum = new Date(sunrise * 1000)

	// Bepaal het aantal minuten dat de zon al op is.
	let minutenZonOp = dagVandaag.getHours() * 60 + dagVandaag.getMinutes() - (zonsopgangDatum.getHours() * 60 + zonsopgangDatum.getMinutes());
	// Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
	let procent = (100/totalMinutes) * minutenZonOp, zonOver = procent, zonGrens = procent < 50 ? procent *2:(100-procent)*2;
	updateSun(zon, zonOver, zonGrens, dagVandaag);
	// We voegen ook de 'is-loaded' class toe aan de body-tag.
	// Vergeet niet om het resterende aantal minuten in te vullen.
	minutenTotOndergang.innerHTML = totalMinutes - minutenZonOp;
	document.querySelector('html').classList.add('is-loaded');
	// Nu maken we een functie die de zon elke minuut zal updaten
	let zonUpdate = setInterval => {
		vandaag = new Date();
	
	// Bekijk of de zon niet nog onder of reeds onder is
	if(minutenZonOp < 0 || minutenZonOp > totalMinutes){
		clearInterval(zonUpdate);
		itBeNight();
	}else{
	// Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
		let leftPerc = (100/ totalMinutes) * minutenZonOp;
		let botPerc = leftPercentage < 50? leftPercentage * 2: (100 - leftPercentage) * 2;
		
		updateSun(zon, leftPerc, botPerc, vandaag);
	}
	// PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
	minutenTotOndergang.innerHTML = totalMinutes - minutenZonOp;	
}
};

// 3 Met de data van de API kunnen we de app opvullen
let showResult = queryResponse => {
	// Variabelen 
	const sunrise = document.querySelector('.js-sunrise'), sunset = document.querySelector('.js-sunset'), location= document.querySelector('.js-location');
	// We gaan eerst een paar onderdelen opvullen
	sunrise.innerHTML = _parseMillisecondsIntoReadableTime(queryResponse.city.sunrise);
	sunset.innerHTML = _parseMillisecondsIntoReadableTime(queryResponse.city.sunset)

	// Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
	location.innerHTML = `${queryResponse.city.name},${queryResponse.city.country}`;
	// Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
	
	// Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
	const timeDifference = new Date(queryResponse.city.sunset * 1000 - queryResponse.city.sunrise*1000)
	// Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
	placeSunAndStartMoving(timeDifference.getHours()*60+ timeDifference.getMinutes(), queryResponse.city.sunrise)
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
let getAPI = async (lat, lon) => {
	// Eerst bouwen we onze url op
	const ENDPOINT = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=474bb03b2a05b60843e169fce34651dc&units=metric&lang=nl&cnt=1`;
	// Met de fetch API proberen we de data op te halen.
	const req = await fetch(`${ENDPOINT}`);
	const data = await req.json();
	console.log(data);
	// Als dat gelukt is, gaan we naar onze showResult functie.
	showResult(data);

	//tip: controleer tijdig uw werking door dingen af te printen in de console!
};

document.addEventListener('DOMContentLoaded', function() {
	// 1 We will query the API with longitude and latitude.
	// Dit zijn denkik de coördinaten van Kortrijk!
	console.log('DOM ingeladen!')
	getAPI(50.8027841, 3.2097454);
});
