const express = require('express');
const app = express();
const PORT = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());
const XMLHttpRequest = require('xhr2');

app.get('/', (req, res) => {
    res.send('holaaa');
    console.log('hoolaa');
});

app.post('/urlToScrap', async (req, res) => {

    let timeer = 0

    setInterval(() => {
        timeer = timeer + .5
    }, 500);

    try {
        let proxyURL = 'gw.dataimpulse.com:823';
        let password = '67e4b118d2a4651a';
        let username = '10461ca1d2a9c33bcb99';
        const url = req.body.url;
        const Hrefs = [];

        if (!url) {
            return res.status(400).json({ message: 'url no encontrada' });
        }

        const direccion = url;
        const newUrls = [];
        let coords
        const urlParts = direccion.split('?shape=');
        const parteShapeCodificada = decodeURIComponent(urlParts[1]);
        const codifiedurl = encodeURIComponent(parteShapeCodificada);

        for (let i = 1; i <= 1; i++) {
            const joinedUrl = `${urlParts[0]}pagina-${i}?shape=${codifiedurl}`;
            newUrls.push(joinedUrl);
        }

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

            for (const url of newUrls) {
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
                const check = await page1.goto(url, { waitUntil: 'domcontentloaded' });

                statuss = check.status();
                if (statuss == 200) {
                    const newHrefs = await page1.evaluate(() => {
                        return Array.from(document.querySelectorAll('a.item-link')).map(link => link.href);
                    });
                    
                    Hrefs.push(...newHrefs);
                    console.log(Hrefs);
                    console.log(timeer);
                } else {
                    console.log(`Página no accesible: ${url} (Status: ${statuss})`);
                        await page1.close();
                        await browser1.close();
                }
                
            }while(statuss !=200 )
            }

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
            const allInfo = [];

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

                    //await page2.goto('https://www.idealista.com/ajax/detailController/staticMapUrl.ajax?adId=97875752&width=646&height=330#',{waitUntil: 'domcontentloaded'});
                    
                    
                            /*let cords = await page2.evaluate(()=>{
                                let rawCords= document.querySelector('pre');
                                return rawCords ? rawCords.innerText : 'N/A';
                            })
                            coords = cords
                            console.log(cords);*/
                        
                    
                    let rrStatus = await page.goto(href, { waitUntil: 'domcontentloaded' });

                    rStatus = rrStatus.status()

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
                        }

                        const carac = document.querySelectorAll('div.details-property-feature-one div.details-property_features ul li')
                        carac.forEach(dt=>{
                            let content = dt.innerText;

                            if (content.includes('m²')) {
                                if(content.includes(',')){
                                    let arrM2 = content.split(',')
                                    if(arrM2[0].includes('construidos')){
                                        caracteristicas.metros2 = arrM2[0];    
                                    }

                                    if(arrM2[1].includes('útiles')){
                                        caracteristicas.metros2Utiles = arrM2[1];
                                    }else{
                                        caracteristicas.metros2Utiles = 'N/A';
                                    }
                                }else{
                                    caracteristicas.metros2 = content;
                                }
                            } else if (content.includes('habitaciones')) {
                                caracteristicas.nHabitaciones = content;
                            } else if (content.includes('baños')) {
                                let n =  content.split(" ")
                                caracteristicas.nBath = n[0];
                            } else if (content.includes('Calefacción')) {
                                caracteristicas.calefaccion = 'si';
                                let rawtipo = content.split(':');
                                let tipo = rawtipo[1]; 
                                caracteristicas.tipoCalefaccion = tipo;
                            } else if (content.includes('Planta')) {
                                caracteristicas.planta = content;
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

                        };
                    });


                        const parts = href.split("/");
                        const numero = parts[parts.length - 2];

                    await page.goto(`https://www.idealista.com/ajax/detailController/staticMapUrl.ajax?adId=${numero}&width=646&height=330#`,{waitUntil: 'domcontentloaded'});

                    let cords = await page.evaluate(()=>{
                        let rawCords= document.querySelector('pre').innerText;
                        let textParts = rawCords.toString();
                        let parts = textParts .split('center=');
                        let partcoords = parts[1].split('&');
                        let soloCoords = partcoords[0].split('%2C');
                        let pureCords = soloCoords[0] + ',' + soloCoords[1];        
                        return pureCords  ? pureCords  : 'N/A';
                    });
                    coords = cords

                    data.coords = cords;
                    data.Anuncio = href;
                    data.inmuebleNro = count;
                    data.timer = timeer;

                    allInfo.push(data);
                    console.log(data);
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

            res.json(allInfo);  // Enviar la respuesta una vez que se completa el scraping
        } catch (error) {
            console.error(error);
            return res.status(504).json({ message: 'error al recorrer las urls' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('error al scrapear');
    }
});

app.listen(PORT, () => {
    console.log('servidor corriendo exitosamente en el puerto', PORT);
});