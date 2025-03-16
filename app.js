const express = require('express');
const { timeout } = require('puppeteer');
const app = express();
const PORT = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const XLSX = require('xlsx');

puppeteer.use(StealthPlugin());


function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radio de la tierra en metros
    const toRad = (angle) => (angle * Math.PI) / 180;
  
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);
  
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
    const C = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let m = R * C;
    return m.toFixed(2);
}


function calcularPromedioTiempo(tiempos) {
  if (!tiempos || tiempos.length < 1 || tiempos.length > 10) {
    return "Error: Debe proporcionar entre 1 y 10 strings.";
  }

  const diasTranscurridos =[];

  for (const tiempo of tiempos) {
    const tiempoLower = tiempo.toLowerCase();
    if (tiempoLower === 'hoy') {
      diasTranscurridos.push(0);
    } else if (tiempoLower === '1 día') {
      diasTranscurridos.push(1);
    } else if (tiempoLower.endsWith(' días')) {
      const numDias = parseInt(tiempo.split(' ')[0]);
      if (!isNaN(numDias) && numDias > 0) {
        diasTranscurridos.push(numDias);
      }
    } else if (tiempoLower === '1 mes') {
      diasTranscurridos.push(30); // Aproximación de 1 mes a 30 días
    } else if (tiempoLower.endsWith(' meses')) {
      const numMeses = parseInt(tiempo.split(' ')[0]);
      if (!isNaN(numMeses) && numMeses > 0) {
        diasTranscurridos.push(numMeses * 30); // Aproximación de cada mes a 30 días
      } else if (tiempoLower.endsWith(' minuto') || tiempoLower.endsWith(' minutos') || tiempoLower.endsWith(' hora') || tiempoLower.endsWith(' horas')) {
        diasTranscurridos.push(0); // Considerar minutos y horas como "Hoy"
      }
    }
  }

  if (diasTranscurridos.length === 0) {
    return "No se proporcionaron tiempos válidos.";
  }

  const promedioDias = diasTranscurridos.reduce((sum, dias) => sum + dias, 0) / diasTranscurridos.length;

  if (promedioDias === 0) {
    return "Hoy";
  } else {
    return `Hace ${Math.round(promedioDias)} días`;
  }
}

const readlinePromises = require('readline/promises');

const rl = readlinePromises.createInterface({
  input: process.stdin,
  output: process.stdout,
});

app.get('/', (req, res) => {
    res.send('holaaa');
    console.log('hoolaa');
});

(async (req, res) => {
    let dofailed
    let direccionCelda
    let Entidad
    let Ciudad
    let NEstudaintesAprox
    let TipoEntidad
    let Agrupacion
    let coords
    let solodate = [];
    let Promediotiempo
    let CosteMedio
    let HabAll = [];
    const allInfo = [];
    let habArray = [];
    let timeer = 0
    let dataHab = {}
    let enradio = 0
    let proxyURL = 'gw.dataimpulse.com:823';
    let password = '67e4b118d2a4651a';
    let username = '10461ca1d2a9c33bcb99';
    let radio
    let zoom
        
async function tuFuncion() {
    try {
        do{            
            radio = await rl.question('Ingresa el radio de busqueda: ');
            console.log(`El tamaño del Radio ingresado es: ${radio}`);

            if (radio <= 1000) {
                zoom = 15;
            } else if (radio >= 1001 && radio <= 2000) {
                zoom = 14;
            } else if (radio >= 2001 && radio <= 3000) {
                zoom = 13;
            } else if (radio >= 3001 && radio <= 5000) {
                zoom = 12;
            }

            if(radio < 200 || radio > 5000){
                console.log('El radio debe estar entre 200 y 5000 metros');
            }
        }while(radio < 200 || radio > 5000)

    } catch (err) {
        console.error('Error:', err);
    } finally {
        rl.close();
    }
}
  
    await tuFuncion();

    setInterval(() => {
        timeer = timeer + .5
    }, 500);

    let MotherCoords
    let Link
    let listLink

    try{


        const XLSX = require('xlsx');

const workbook = XLSX.readFile('./Busquedapisoalquilerhabitaciones.xlsx'); // Reemplaza 'tu-archivo.xlsx'
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const valoresColumnaC = []; // Array para guardar los valores

// Obtener el rango de la hoja de cálculo
const range = XLSX.utils.decode_range(sheet['!ref']);

// Iterar a través de las filas de la columna C
for (let fila = range.s.r; ; fila++) { // Bucle infinito hasta encontrar una celda vacía
     direccionCelda = 'C' + (fila + 2); // C1, C2, C3, ... (filas en Excel empiezan en 1)
     Entidad = 'A' + (fila + 2); // C1, C2, C3, ... (filas en Excel empiezan en 1)
     Ciudad = 'B' + (fila + 2); // C1, C2, C3, ... (filas en Excel empiezan en 1)
     NEstudaintesAprox = 'D' + (fila + 2); // C1, C2, C3, ... (filas en Excel empiezan en 1)
     TipoEntidad = 'E' + (fila + 2); // C1, C2, C3, ... (filas en Excel empiezan en 1)
     Agrupacion = 'F' + (fila + 2); // C1, C2, C3, ... (filas en Excel empiezan en 1)
    
    const celda = sheet[direccionCelda];
    const entidad = sheet[Entidad];
    const ciudad = sheet[Ciudad];
    const nestudent = sheet[NEstudaintesAprox];
    const TipoEnt = sheet[TipoEntidad];
    const agr = sheet[Agrupacion];

    if (celda && celda.v) {
        let objetoInfo = {
            link : celda.v,
            entidad  : entidad.v ,
            ciudad : ciudad.v,
            nestudent :nestudent.v ,
            TipoEnt : TipoEnt.v,
            agr : agr.v,
        }        // Si la celda existe y tiene un valor, lo agregamos al array
        valoresColumnaC.push(objetoInfo);
    } else {
        // Si la celda está vacía, terminamos el bucle
        break;
    }
}

console.log(valoresColumnaC, '-------'); // Mostrar los valores de la columna C

for(let linkMaps of valoresColumnaC){
    let linkk = linkMaps.link;
    MotherCoords = linkk.split('place/')[1];
    console.log(MotherCoords,'--------');
    let doneCoords = MotherCoords.replace(',','/');
    Link = `https://www.idealista.com/point/venta-viviendas/${doneCoords}/${zoom}/mapa-google`; 

    let browser = await puppeteer.launch({
        headless: true,
        args: [`--proxy-server=${proxyURL}`]
    });

    let page = await browser.newPage();
    await page.authenticate({ username, password });    
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const resourceType = request.resourceType();
        if (resourceType == 'document' || resourceType == 'script'  || resourceType == 'xhr' || resourceType == 'fetch' ) {
            request.continue();
        } else {
            //console.log(request.url(),' : ', request.resourceType());
            request.continue();
            //request.abort();
        }
    });

    let status
    do{

        if(page.isClosed()){
            console.log('page is closed due status 403, reopeing page');
            browser = await puppeteer.launch({
            headless: true,
            args: [`--proxy-server=${proxyURL}`]
            });
        
            page = await browser.newPage();
            await page.authenticate({ username, password });
        
            await page.setRequestInterception(true);

            page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (resourceType == 'document'){
                request.continue();
            } else {
                request.continue()
                //request.abort()
            } })
        };  

        const check = await page.goto(Link, { waitUntil: 'load', timeout: 0 });
        status = check.status();
        if (status == 200 ) {
            
            await page.waitForSelector('a#listing-view-button', {timeout: 0});
            listLink = await page.evaluate(() => {
                return document.querySelector('a#listing-view-button').href;
            });
            await page.locator('a#listing-view-button').click();

            console.log('-------')
            console.log('-------');
            console.log(listLink);
            
            console.log('-------')
            console.log('-------')
        } else {
            console.log(`Página no accesible: ${Link} (Status: ${status})`);
            await page.close();
            await browser.close()
        }
    }while(status != 200 || listLink.includes('mapa-google'))
        await browser.close();
    solodate = []
        
    try{
        let statuss
        
        let browser = await puppeteer.launch({
            headless: true,
            args: [`--proxy-server=${proxyURL}`]
        });
        
        let page = await browser.newPage();
        await page.authenticate({ username, password });    
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (resourceType == 'document' ) {
                request.continue();
            } else {
                //console.log(request.url(),' : ', request.resourceType());
                //request.continue();
                request.abort();
            }
        });
                do{
        
                ///-----------------------------------------///
        
                if(page.isClosed()){
                    console.log('page is closed due status 403, reopeing page');
                    browser = await puppeteer.launch({
                    headless: true,
                    args: [`--proxy-server=${proxyURL}`]
                    });
                
                    page = await browser.newPage();
                    await page.authenticate({ username, password });
                
                    await page.setRequestInterception(true);
        
                    page.on('request', (request) => {
                    const resourceType = request.resourceType();
                    if (resourceType == 'document'){
                        request.continue();
                    } else {
                        request.continue()
                        //request.abort()
                    } })
                };
        
                ///-----------------------------------------///
        
                let HabLink = listLink.split('venta-viviendas');
                //for(let i = 0; i <= 60; i++){
                let newhabLink = `${HabLink[0]}alquiler-habitacion${HabLink[1]}&ordenado-por=precios-asc`;
                console.log('NewHablink',newhabLink);
                //}
                const checkk = await page.goto(newhabLink, { waitUntil: 'domcontentloaded', timeout: 0 });
                statuss = checkk.status();
                if (statuss == 200) {
                    enradio = 0
                    let Nextpage = {}
                    do{    
                        const hablinks = await page.evaluate(() => {
                        let links = document.querySelectorAll('a.item-link');
                        let links2 = Array.from(links).map(link => link.href);
                        return links2;
                    });
        
                    Nextpage = await page.evaluate(()=>{
                        let next = document.querySelector('a.icon-arrow-right-after');
                        if( !next ){
                            return {
                                exists : false,
                                link : "N/A"
                            };
                        }else{
                            return {
                                exists : false,
                                link : next.href
                            };
                        }
                    });
        
                    if (Nextpage.exists == true) {
                        await page.goto(Nextpage.link, { waitUntil: 'domcontentloaded',timeout:0 });
                        console.log('going to new page')
                        console.log(Nextpage)
                    }else{
                        console.log(Nextpage)
                        console.log('no more pages')
                    }
        
                    habArray.push(...hablinks);
                    console.log('----------')
                    console.log('----------')
                    console.log(habArray);
                    console.log(habArray.length);
                    console.log(Nextpage)
                    console.log('----------')
                    console.log('----------')
                    
                }while(Nextpage.exists == true)
        
                } else/* if(status == 404){
                    dofailed == true
                    console.log('breaking url:', Nextpage.link)
                    break

                }else*/{
                    console.log(`Página no accesible: ${Link} (Status: ${statuss})`);
                    await page.close();
                    await browser.close();
                }
            }while(statuss != 200)
                
               /* if(statuss == 404){
                    Nextpage.link
                    continue
                }*/

                let count = 0;
        
                for(const url of habArray){
                    count ++;
                    do{
        
                        if(page.isClosed()){
                            console.log('page is closed due status 403, reopeing page');
                            browser = await puppeteer.launch({
                            headless: true,
                           //slowMo: 1000,
                            args: [`--proxy-server=${proxyURL}`]
                            });
                        
                            page = await browser.newPage();
                            await page.authenticate({ username, password });
                        
                            await page.setRequestInterception(true);
        
                            page.on('request', (request) => {
                            const resourceType = request.resourceType();
                
                        if (resourceType == 'document'){
                            request.continue();
                        } else {
                            request.abort()
                        }
                    });                    
                        }
        
        
                        dataHab = {
                            precio : 'N/A',
                            actualizado : 'N/A',
                            Coords : 'N/A',
                            link : url
                        }
        
                        if(count <= 10){
                            console.log(count)
                        check = await page.goto(url,{waitUntil:'domcontentloaded', timeout:0});
                        
                        
                        if(check.status() == 200){
        
                            
                            dataHab = await page.evaluate(()=>{
                                
                                const rawprecio = document.querySelector('span.info-data-price');
                                const casiprecio =  rawprecio ? rawprecio.innerText.split(" ")[0] : 'N/A';
                                const casicasiprecio = casiprecio.replace(/\./g,"")
                                const precio = parseInt(casicasiprecio);
                                
                                const rawDatee = document.querySelector('p.date-update-text');
                                const rawDate = rawDatee ? rawDatee.innerText : 'N/A';
                                let date
                                if(rawDate.includes('hace')){
                                    let casidate = rawDate.split('hace ');
                                    date = casidate[1];
                                    if(casidate[1].includes('más de')){
                                        let doneupdate = casidate[1].replace('más de ','');
                                        date = doneupdate;
                                    }
                                }else{
                                    date = rawDate;
                                }
        
                                return {
                                    precio : precio,
                                    actualizado : date
                                }
                            })                    
                        
                        
            
                        }else{
                            console.log(`Página no accesible: ${url} (Status: ${statuss})`);
                                await page.close();
                                await browser.close();
                            }
                        }
                        
                        
                    let HabId = url.split('/');
                    let numero = HabId[HabId.length - 2];
                    
                    check = await page.goto(`https://www.idealista.com/ajax/detailController/staticMapUrl.ajax?adId=${numero}&width=646&height=330#`,{waitUntil: 'domcontentloaded', timeout:0});
                    status = await check.status()
                    if (status == 200) {
        
                    await page.waitForSelector('pre',{timeout:0});
                    coords = await page.evaluate(()=>{
                        let rawCords= document.querySelector('pre') ? document.querySelector('pre').innerText : 'N/A';  
        
                        if (rawCords == 'N/A') {
                            return 'N/A';
                        }
                        let textParts = rawCords.toString();
                        let parts = textParts .split('center=');
                        let partcoords = parts[1].split('&');
                        let soloCoords = partcoords[0].split('%2C');
                        let pureCords = soloCoords[0] + ',' + soloCoords[1];        
                        return pureCords  ? pureCords  : 'N/A';
                    });
                        dataHab.link = url;
                        dataHab.CoordsHab = coords;
                        //console.log('info habitacion',dataHab)
                        HabAll.push(dataHab)
                        console.log('habAll:', HabAll)
                        
        
                        
                        const [lat1, lon1] = MotherCoords.split(',').map(Number);
                        const [lat2, lon2] = coords.split(',').map(Number);
                        // Compute the distance
                        const distanceInMeters = haversineDistance(lat1, lon1, lat2, lon2);
                        if (distanceInMeters < radio) {
                            enradio ++;
                    }
        
                }else {
                    console.log(`ajax no accesible: https://www.idealista.com/ajax/detailController/staticMapUrl.ajax?adId=${numero}&width=646&height=330#  (Status: ${statuss})`);
                        await page.close();
                        await browser.close();
                }
        
                    }while(statuss != 200 || coords == 'N/A')
                    }
                    
                    HabAll.forEach(hab=>{
                        if(hab.actualizado != 'N/A'){
                            solodate.push(hab.actualizado);
                        }
                    })
        
                    console.log('solodate:',solodate);
                    Promediotiempo = calcularPromedioTiempo(solodate)
                    
                await browser.close();
            }catch(error){
                console.error(error);
                return res.status(500).json({ message: 'error al scrapear' });
            }
        
            let utilHabs = 0;
            let suma = 0 ;
            HabAll.forEach(hab=>{
        
                if (hab.precio != 'N/A') {
                    utilHabs ++;
                    suma = suma + hab.precio;
                }
            })
            CosteMedio = suma / utilHabs;
            try {
                let url = listLink;
                const Hrefs = [];
        
                if (!url) {
                    return res.status(400).json({ message: 'url no encontrada' });
                }
        
                const direccion = url;
                const newUrls = [];
                const urlParts = direccion.split('?shape=');
                const parteShapeCodificada = decodeURIComponent(urlParts[1]);
                const codifiedurl = encodeURIComponent(parteShapeCodificada);
        /*
                for (let i = 1; i <= 1; i++) {
                    const joinedUrl = `${urlParts[0]}pagina-${i}?shape=${codifiedurl}`;
                    newUrls.push(joinedUrl);
                }*/
        
                try {
                    let statuss
                    let count = 0;
                    
                    let browser1 = await puppeteer.launch({
                        headless: true,
                    args: [`--proxy-server=${proxyURL}`]
                    });
        
                let page1 = await browser1.newPage();
                await page1.authenticate({ username, password });
        
                await page1.setRequestInterception(true);
                // Variable para controlar si se debe abortar todas las solicitudes
        
                page1.on('request', (request) => {
                    const resourceType = request.resourceType();
                
                    if (resourceType == 'document'){
                        request.continue();
                    } else {
                        request.abort();
                    }
                });
                let Nextpage = {}
                        do{
        ////////////////////////////
                            if(page1.isClosed()){
                                console.log('page is closed due status 403, reopeing page');
                                browser1 = await puppeteer.launch({
                                headless: true,
                               //slowMo: 1000,
                                args: [`--proxy-server=${proxyURL}`]
                                });
                            
                                page1 = await browser1.newPage();
                                await page1.authenticate({ username, password });
                            
                                await page1.setRequestInterception(true);
        
                                page1.on('request', (request) => {
                                const resourceType = request.resourceType();
                    
                            if (resourceType == 'document'){
                                request.continue();
                            } else {
                                request.abort()
                            }
                        });                    
        }
        ///////////////////////////
                        let check = await page1.goto(url, { waitUntil: 'domcontentloaded',timeout: 0 });
        
                        statuss = await check.status();
                        if (statuss == 200) {
        
                            const newHrefs = await page1.evaluate(() => {
                                return Array.from(document.querySelectorAll('a.item-link')).map(link => link.href);
                            });
                            
                            Hrefs.push(...newHrefs);
                            console.log(Hrefs);
                            console.log(timeer);
        
        
                            Nextpage = await page1.evaluate(()=>{
                                let next = document.querySelector('a.icon-arrow-right-after');
                                if( next ){
                                    return {
                                        exists : false,
                                        link : next.href
                                    };
                                }else{
                                    return {
                                        exists : false,
                                        link : "N/A"
                                    };
                                }
                            });
                
                            if (Nextpage.exists == true) {
                                url = Nextpage.link;
                                    console.log('going to new page')
                                    console.log(Nextpage)
                            }else{
                                console.log(Nextpage)
                                console.log('no more pages')
                            }
                
        
                        } else {
                            console.log(`Página no accesible: ${url} (Status: ${statuss})`);
                                await page1.close();
                                await browser1.close();
                        }
                        
                    }while(statuss !=200 || Nextpage.exists == true)
                    
        
                    await page1.close();
                    await browser1.close();
        
                                        
                let browser = await puppeteer.launch({
                    headless: true,
                  //slowMo: 1000,
                    args: [`--proxy-server=${proxyURL}`]
                });
                                    let page = await browser.newPage();
                                    //let page2 = await browser.newPage();
                                    await page.authenticate({ username, password });
                                    //await page2.authenticate({ username, password });
        
                                    await page.setRequestInterception(true);
                
                                    page.on('request', (request) => {
                                    const resourceType = request.resourceType();
                                    
                                    if (resourceType == 'document'){
                                        request.continue();
                                    } else {
                                        request.abort();
                                    }
                                    });
        
                    for (const href of Hrefs) {
                        count++;
                        let rStatus 
                        do {
        
                            if(page.isClosed()){
                                console.log('page is closed due status 403, reopeing page');
                                browser = await puppeteer.launch({
                                headless: true,
                                args: [`--proxy-server=${proxyURL}`]
                                });
        
                                page = await browser.newPage();
                                await page.authenticate({ username, password });
                            
                                await page.setRequestInterception(true);
                            
                                    page.on('request', (request) => {
                                        const resourceType = request.resourceType();
                                        let url = request.url();
                                        if (resourceType == 'document'){
                                            request.continue();
                                        } else {
                                            request.abort();
                                        }
                                    });                    
                            }                        
                            
                            let rrStatus = await page.goto(href, { waitUntil: 'domcontentloaded', timeout:0 });
        
                            rStatus = await rrStatus.status()
        
                            console.log('-------')
                            console.log('-------')
                            console.log('-------')
                            console.log(rStatus)
                            console.log('-------')
                            console.log('-------')
                            console.log('-------')
                            
                            if(rStatus == 200 ){
                            const data = await page.evaluate(() => {
        
                                const rawprecio = document.querySelector('span.info-data-price');
                                const casiprecio =  rawprecio ? rawprecio.innerText.split(" ")[0] : 'N/A';
                                const casicasiprecio = casiprecio.replace(/\./g,"")
                                const precio = parseInt(casicasiprecio);
                                
                                let ubicacion = document.querySelector('#headerMap ul');
                                let rawdireccion = ubicacion ? ubicacion.innerText : "N/A";
                                let direccion = rawdireccion.replace(/\n/g, ', ');
        
                                let caracteristicas = {
                                    metros2:"N/A",
                                    Anio:"N/A",
                                    nHabitaciones:"N/A", 
                                    nBath:"N/A",
                                    planta:"N/A",
                                    ascensor:"N/A",
                                    calefaccion:"No",
                                    tipoCalefaccion:"N/A",
                                    aire:"N/A",
                                    piscina:"N/A",
                                    construido: "N/A",
                                    metros2Utiles: "N/A",
                                    Coords : "N/A",
                                    construido : "N/A",
                                    ascensor : "N/A"
                                }
        
                                const carac = document.querySelectorAll('div.details-property-feature-one div.details-property_features ul li')
                                carac.forEach(dt=>{
                                    let content = dt.innerText;
        
                                    if (content.includes('m²') && caracteristicas.metros2 == "N/A") {
                                        if(content.includes(',')){
                                            let arrM2 = content.split(',')
                                            if(arrM2[0].includes('construidos')){
                                                let cutt = arrM2[0].split(' ');
                                                caracteristicas.metros2 = cutt[0];    
                                            }
                                            if(arrM2[1].includes('útiles')){
                                                let cuttt = arrM2[1].split(' ');
                                                caracteristicas.metros2Utiles = cuttt[1];
                                            }else{
                                                caracteristicas.metros2Utiles = 'N/A';
                                            }
                                        }else{
                                            let m2cleaned = content.split(' ')[0];
                                            caracteristicas.metros2 = m2cleaned;
                                        }
                                    } else if (content.includes('habitaciones')) {
                                        let cutData = content.split(' '); 
                                        caracteristicas.nHabitaciones = cutData[0];
                                    } else if (content.includes('baños')) {
                                        let n =  content.split(" ")
                                        caracteristicas.nBath = n[0];
                                    } else if (content.includes('Calefacción')) {
                                        caracteristicas.calefaccion = 'si';
                                        if(content.includes(':')){

                                            let rawtipo = content.split(':');
                                            let tipo = rawtipo[1]; 
                                            caracteristicas.tipoCalefaccion = tipo;
                                        }else{
                                            caracteristicas.tipoCalefaccion = content;
                                        }
                                    } else if (content.includes('Planta')) {
                                        let cut = content.split(' ');
                                        caracteristicas.planta = cut[1];
                                    }else if (content.includes('Con ascensor')) {
                                        caracteristicas.ascensor = 'si';
                                    }else if (content.includes('Construido')) {
                                        caracteristicas.construido = content;
                                    }
                                })
        
                                const carac2 = document.querySelectorAll('div.details-property-feature-two div.details-property_features ul li')
                                carac2.forEach(dt=>{
                                    let content = dt.innerText 
                                    if (content.includes('Piscina')) {
                                        caracteristicas.piscina = content;
                                    } else if (content.includes('Aire')) {
                                        caracteristicas.aire = content;
                                    }
                                })
        
                                return {
                                    'Dirección': direccion,
                                    'Precio': precio,
                                    'm²': caracteristicas.metros2,
                                    'm² Útiles': caracteristicas.metros2Utiles,
                                    "Habitaciones" : caracteristicas.nHabitaciones,
                                    "nBaños" : caracteristicas.nBath,
                                    'calefaccion': caracteristicas.calefaccion,
                                    'tipo de Calefaccion' : caracteristicas.tipoCalefaccion,
                                    'planta' : caracteristicas.planta,
                                    'ascensor' : caracteristicas.ascensor,
                                    'Coords' : caracteristicas.Coords,
                                    'construido' : caracteristicas.construido,
                                    'aire' : caracteristicas.aire,
                                    'pisicina' : caracteristicas.piscina
        
                                };
                            });
        
        
                                const parts = href.split("/");
                                const numero = parts[parts.length - 2];
        
                            await page.goto(`https://www.idealista.com/ajax/detailController/staticMapUrl.ajax?adId=${numero}&width=646&height=330#`,{waitUntil: 'domcontentloaded',timeout:0});
        
                            let cords = await page.evaluate(()=>{
                                let rawCords= document.querySelector('pre') ? document.querySelector('pre').innerText : 'N/A';  
        
                                if (rawCords == 'N/A') {
                                    return 'N/A';
                                }
                                let textParts = rawCords.toString();
                                let parts = textParts .split('center=');
                                let partcoords = parts[1].split('&');
                                let soloCoords = partcoords[0].split('%2C');
                                let pureCords = soloCoords[0] + ',' + soloCoords[1];        
                                return pureCords  ? pureCords  : 'N/A';
                            });
                            coords = cords
        
                            //Aqui esta la distancia en metros, constante distanceInMeters, pasar a la casilla "distancia a la entidad"!
                            //Si la distancia es mayor a la introducida por consola, no llenar esa columna del excel.
                            
                        //Aqui calculo necesario
                        
                            let NumeroDeHabitaciones = data.Habitaciones;
                            let MesesDelAnio = 12;
        
                            let a = CosteMedio * NumeroDeHabitaciones * MesesDelAnio;
                            let b = data.Precio;
        
                            let c = a/b;
        
                            let d = c * 100;
        
                            let resultadoFormateado = d.toFixed(2);
        
                            let Rentabilidad = `${resultadoFormateado}%`
                            ///Esta variable Rentabilidad pasarlo a la casilla de Rentabilidad, esto es lo que si va a cambiar en
                            // cada iteracion asi se repitan los mismos datos de las habitaciones
        
                            
                            // Parse the coordinate strings
                            const [lat1, lon1] = MotherCoords.split(',').map(Number);
                            const [lat2, lon2] = coords.split(',').map(Number);
                            // Compute the distance
                            const distanceInMeters = haversineDistance(lat1, lon1, lat2, lon2);
                            if (parseFloat(distanceInMeters) < parseFloat(radio)) {
                            data.Coords = cords;
                            data.Anuncio = href;
                            data.inmuebleNro = count;
                            data.timer = timeer;
                            data.Rentabilidad = Rentabilidad;
                            data.HabitacionesEnRango = utilHabs;
                            data.PrecioMedio = CosteMedio;
                            data.Promediotiempo = Promediotiempo;
                            data.DistancaAEntidad = distanceInMeters;
                            data.Entidad = linkMaps.entidad; 
                            data.Ciudad = linkMaps.ciudad;
                            data.nEstudaintesAprox = linkMaps.nestudent;
                            data.TipoEntidad = linkMaps.TipoEnt;
                            data.Agrupacion = linkMaps.agr;
                            allInfo.push(data);
                            console.log(data);
                            console.log(`Distance: ${distanceInMeters} meters`);
                        }else{
                            console.log('casa fuera de rango, distancia en metros:',distanceInMeters, 'radio optimo: ',radio)
                        
                            data.Coords = cords;
                            data.Anuncio = href;
                            data.inmuebleNro = count;
                            data.timer = timeer;
                            console.log(data);
                            }
        
                            }else {
                                //await page2.close();
                                await page.close();
                                await browser.close();
                            }
                                        
                        } while (rStatus != 200 || coords == 'N/A');
                    }
                    if (!page.isClosed()){
                        //await page2.close();
                        await page.close();
                    }
                await browser.close();
        //----------------------------------------------------------//
        
        const worksheet = XLSX.utils.json_to_sheet(allInfo);
        // Crear una nueva hoja de cálculo a partir del array JSON
        
        // Crear un nuevo libro de trabajo
        const workbook = XLSX.utils.book_new();
        
        // Agregar la hoja de cálculo al libro de trabajo
        XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
        
        // Obtener la fecha y hora actual
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Sumar 1 porque los meses van de 0 a 11
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        // Formatear la fecha y hora para el nombre del archivo
        const dateTimeString = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
        
        // Crear el nombre del archivo con la fecha y hora
        const filename = `datos_${dateTimeString}.xlsx`;
        
        // Escribir el libro de trabajo en el archivo Excel con el nombre generado
        XLSX.writeFile(workbook, filename);
        
        console.log(`Archivo Excel creado con éxito: ${filename}`);
        
        //----------------------------------------------------------//
         // Enviar la respuesta una vez que se completa el scraping
                } catch (error) {
                    
                    return console.error(error); 
                }
        
            } catch (error) {
                console.error(error);
            }


};

        
    }catch(error){
        return console.error(error);
    }

    // scrpeando habitaciones

})();
