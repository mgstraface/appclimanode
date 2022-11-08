require("dotenv").config();

const {
	inquirerMenu,
	pausa,
	leerInput,
	confirmar,
	mostrarListadoCheckList,
	listarLugares,
} = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

require("colors");

const main = async () => {
	const busquedas = new Busquedas();

	let opt;
	do {
		opt = await inquirerMenu();

		switch (opt) {
			case 1:
				//mostrar mensaje
				const lugar = await leerInput("Ciudad: ");

				//buscar lugares
				const lugares = await busquedas.ciudad(lugar);

				//seleccionar lugar
				const id = await listarLugares(lugares);
				if (id === "0") continue;

				const lugarSel = lugares.find((l) => l.id === id);

				//guardar en DB
				busquedas.agregarHistorial(lugarSel.name);

				//clima
				const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lng);

				//mostrar resultados
				console.clear();
				console.log("\nInformación de la ciudad\n".blue);
				console.log(`Ciudad:`.red, `${lugarSel.name}`);
				console.log(`Lat:`.red, `${lugarSel.lat}`);
				console.log(`Lng:`.red, `${lugarSel.lng}`);
				console.log(`Temperatura actual:`.red, `${clima.temp}`);
				console.log(`Temperatura mínima:`.red, `${clima.min}`);
				console.log(`Temperatura máxima:`.red, `${clima.max}`);
				console.log(`Descripción del clima:`.red, `${clima.desc}`);
				break;

			case 2:
				busquedas.historialCapitalizado.forEach((lugar, i) => {
					const idx = `${i + 1}`.red;
					console.log(`${idx} ${lugar}`);
				});
				break;

			default:
				break;
		}

		await pausa();
	} while (opt !== 0);
};

main();
