const fs = require("fs");

const axios = require("axios");
const { threadId } = require("worker_threads");

class Busquedas {
	historial = [];
	dbPath = "./db/database.json";

	constructor() {
		this.leerDb();
	}

	get historialCapitalizado() {
		return this.historial.map((lugar) => {
			let palabras = lugar.split(" ");
			palabras = palabras.map((p) => p[0].toUpperCase() + p.substring(1));
			return palabras.join(" ");
		});
	}

	get paramsMapBox() {
		return {
			access_token: process.env.MAPBOX_KEY,
			limit: 5,
			language: "es",
		};
	}

	get paramsWeather() {
		return {
			appid: process.env.OPENWEATHER_KEY,
			units: "metric",
			lang: "es",
		};
	}

	async ciudad(lugar = "") {
		try {
			// peticion http
			const instance = axios.create({
				baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
				params: this.paramsMapBox,
			});

			const resp = await instance.get();
			return resp.data.features.map((lugar) => ({
				id: lugar.id,
				name: lugar.place_name,
				lng: lugar.center[0],
				lat: lugar.center[1],
			}));
		} catch (error) {
			return [];
		}
	}

	async climaLugar(lat, lon) {
		try {
			const instance = axios.create({
				baseURL: `https://api.openweathermap.org/data/2.5/weather?`,
				params: { ...this.paramsWeather, lat, lon },
			});

			const resp = await instance.get();
			return {
				temp: resp.data.main.temp,
				min: resp.data.main.temp_min,
				max: resp.data.main.temp_max,
				desc: resp.data.weather[0].description,
			};
		} catch (error) {
			console.log("No se encontró el clima para la ciudad seleccionada.");
		}
	}

	agregarHistorial(lugar = "") {
		if (this.historial.includes(lugar.toLocaleLowerCase())) {
			return;
		}
		this.historial = this.historial.splice(0, 4);

		this.historial.unshift(lugar.toLocaleLowerCase());
		this.guardarDb();
	}

	guardarDb() {
		const payload = {
			historial: this.historial,
		};

		fs.writeFileSync(this.dbPath, JSON.stringify(payload));
	}

	leerDb() {
		if (!fs.existsSync(this.dbPath)) {
			return;
		}
		const info = fs.readFileSync(this.dbPath, { encoding: "utf-8" });
		const data = JSON.parse(info);
		this.historial = data.historial;
	}
}

module.exports = Busquedas;
