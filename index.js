const { read } = require('fs')
const fs = require('fs/promises')
const http = require('http')
const archivo = ('./assents/anime.json')

const leerArchivo = async () => {
    try {

        const datosArchivo = await fs.readFile(archivo)
        const datosLeidos = JSON.parse(datosArchivo)
        return datosLeidos

    } catch (error) {
        return []
    }
}



const guardarArchivo = async (contenido) => {
    try {
        await fs.writeFile(archivo, contenido, 'utf-8')
        console.log('Se ha guardado los datos')
    } catch (error) {
        console.log('Error al guardar datos', error);
    }
}

// nombre, genero, año, autor

http.createServer((req, res) => {
    console.log(req.method);
    console.log(req.url);
    const url = new URL(req.url, `http://${req.headers.host}`);
    const params = new URLSearchParams(url.searchParams);
    console.log(params);
    const idd = params.get('id');

    //home
    if (req.url == '/') {
        res.write('<h1>CONSULTAS</h1>');
        res.write('<h3>Para utilizar la app, en el terminal hay que escribir lo siguiente</h3><h2>npm run dev</h2><br>');
        res.write('<h3>posteriormente, se recomienda utilizacion de postman o cualquier aplicativo que utilise los metodos GET, POST, PUT y DETELE.</h3>');
        res.write('<h3>Se debe ingresar a la siguiente ruta:</h3><h2>http://localhost:3000</h2><br>');
        res.write('<h2>CONSULTAR ANIME</h2>');
        res.write('<h3>En Postman se seleciona la opcion GET y a la ruta anterior se le adiciona /anime quedando asi:</h3>');
        res.write('<h2>http://localhost:3000/anime</h2><br>');
        res.write('<h2>CONSULTAR ANIME POR ID</h2>');
        res.write('<h3>En Postman se seleciona la opcion GET y a la ruta anterior se le adiciona /anime?id= al lado de igual se escribe el numero de la ID que se quiere consultar quedando asi:</h3>');
        res.write('<h2>http://localhost:3000/anime?id=1</h2><br>');
        res.write('<h2>CREAR DATOS NUEVOS</h2>');
        res.write('<h3>En Postman se seleciona la opcion POST y en la ruta anterior se adiciona /crear quedando asi:</h3>');
        res.write('<h2>http://localhost:3000/crear</h2>');
        res.write('<h3>posteriormente en parametros se ingresa a "Body", luego selecciona "raw" en formato JSON para ingresar datos estos deben ir entremedio de corchete y con  comillas, ejemplo:</h3>');
        res.write('<h3>Es para consultar todos los animes</h3>');
        res.write('<h3>{<br>"nombre": "Ranma 1/2",<br>"genero":"shonen",<br>"año":"1987",<br>"autor":"Rumiko Takahashi"<br>}</h3><br>');
        res.write('<h2>MODIFICAR DATOS</h2>');
        res.write('<h3>En Postman se selecciona la opcion PUT y en la ruta anterior se adiciona /modificar?id= se ingresa el numero de ID que se quiere modificar quedando asi:</h3>');
        res.write('<h2>http://localhost:3000/modificar?id=6</h2>');
        res.write('<h3>posteriormente en parametros se ingresa a "Body", luego selecciona "raw" en formato JSON para ingresar datos estos deben ir entremedio de corchete y con  comillas, ejemplo:</h3>');
        res.write('<h3>{<br>"nombre": "Kimetsu no yaiba",<br>"genero":"shonen",<br>"año":"2019",<br>"autor":"Koyoharu Gotouge"<br>}</h3><br>');
        res.write('<h2>ELIMINAR DATOS</h2>');
        res.write('<h3>En Postman se selecciona la opcion DELETE y en la ruta anterior se adiciona /eliminar?id= se ingresa el numero de ID que se quiere eliminar quedando asi:</h3>');
        res.write('<h2>http://localhost:3000/eliminar?id=6</h2>');
        res.write('<h3>**Para ternimal la consultas en el terminal NODE del VScode se presionan las teclas "Ctrl" + "C" y despues del mensaje se escribe "S" dando enter </h3>');

        res.end()

    }

    //obtener anime todo o x id
    if (req.url.startsWith('/anime') && req.method == 'GET') {

        res.write('<h1>llegaste al anime</h1><br>');
        leerArchivo().then((anime) => {

            if (idd != null) {
                let filtrado = anime[idd]//.find(objeto => objeto.id == params.get('id'));
                res.write(JSON.stringify(filtrado));


            } else {
                res.write(JSON.stringify(anime));
            }
            res.end();
        })
    }

    //crear
    if (req.url.startsWith('/crear') && req.method == 'POST') {
        let body;
        req.on('data', (datos) => {

            body = JSON.parse(datos);
            console.log(body);
        })
        req.on('end', () => {
            let nuevoId;
            leerArchivo().then((anime) => {
                nuevoId = Math.max(...Object.keys(anime)) + 1;
                anime[nuevoId] = body;
                console.log(anime);

                guardarArchivo(JSON.stringify(anime)).then(() => {
                    res.write('Se ha guardado el anime');

                }).catch(error => {
                    res.write('Hubo un error al eliminar');
                })

                res.end();
            })
        })
    }
    //modificar
    if (req.url.startsWith('/modificar') && req.method == 'PUT') {
        let cambioId;
        let body;
        req.on('data', (datos) => {
            body = JSON.parse(datos);
        })
        req.on('end', () => {
            leerArchivo().then((anime) => {

                anime[idd] = body

                guardarArchivo(JSON.stringify(anime)).then(() => {
                    res.write('Se ha guardado el anime');
                }).catch(error => {
                    res.write('Hubo un error al eliminar');
                })

                res.end();
            })

        })


    }

    //eliminar
    if (req.url.startsWith('/eliminar') && req.method == 'DELETE') {
        leerArchivo().then((anime) => {

            if (idd != null) {
                delete anime[idd]
                guardarArchivo(JSON.stringify(anime)).then(() => {
                    res.write('Se ha eliminado el anime');

                }).catch(error => {
                    res.write('Hubo un error al eliminar');
                })


            } else {
                res.write('No se ha podido eliminar');

            }
            res.end();
        })

    }


}).listen(3000, () => {
    console.log('El servidor esta iniciado en el puerto 3000');
})

