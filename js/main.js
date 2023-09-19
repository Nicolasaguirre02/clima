/* clase historial */
class Historial{
  constructor(nombre, tiempo){
    this.nombre = nombre;
    this.tiempo = tiempo
  }

  mensajeHisorial(){
    return this.nombre+ " " + this.tiempo; 
  }

}

/* Funcionamineto de botones al pasar el periodo */
const contenedor = document.getElementById("contenedor");
const btnDerecho = document.getElementById("btnDerecho");
const btnIzquierdo = document.getElementById("btnIzquierdo");
const elemento = document.getElementsByClassName("elemento");

 contenedor.addEventListener("click", () => {
    contenedor.focus();
});

btnDerecho.addEventListener("click", () => {
    contenedor.scrollLeft += 300;
});

btnIzquierdo.addEventListener("click", () => {
    contenedor.scrollLeft -= 300;
});
/* Fin funcionamineto de botones */

/* Mapa */
const miMapa = document.getElementById("mapa");
const inputMapa = document.getElementById("inputMapa");

let latitud
let longitud

let map;
let inputAutocompletado;

function initMap() {
  let codigoArgentina = {lat: latitud, lng: longitud};

  map = new google.maps.Map(miMapa, {
    center: codigoArgentina, /* latitud y lognitud del mapa */
    zoom: 12,   /* Que tan cerca se va a mostrar el mapa */
  });
  marker = new google.maps.Marker({
    position: codigoArgentina,
    map: map,
    draggable: true 
  });

  marker.addListener('dragend', function(evento){
    document.getElementById("cargarTimepo").classList.remove('d-none');
    document.getElementById("contenedorTarjetaTiempo").classList.add('d-none');

    document.getElementById("cargarPeriodo").classList.remove('d-none');
    document.getElementById("ContenedorPeriodo").classList.add('d-none');

    latitud = this.getPosition().lat();
    longitud = this.getPosition().lng()
    guardarClima();
    guardarPeriodo();
  })

  verAutoCompletado();
}


function verAutoCompletado(){ 
  inputAutocompletado = new google.maps.places.Autocomplete(inputMapa);
  inputAutocompletado.addListener('place_changed', function(){  //este evento es cuando seleccionamos por medio del input el lugar

    document.getElementById("cargarTimepo").classList.remove('d-none');
    document.getElementById("contenedorTarjetaTiempo").classList.add('d-none');

    document.getElementById("cargarPeriodo").classList.remove('d-none');
    document.getElementById("ContenedorPeriodo").classList.add('d-none');

    const lugar = inputAutocompletado.getPlace();
    console.log(lugar.geometry.location)
    map.setCenter(lugar.geometry.location);
    marker.setPosition(lugar.geometry.location)

    latitud = lugar.geometry.location.lat();
    longitud = lugar.geometry.location.lng();

    guardarClima();
    guardarPeriodo();
    
  }); 
}
/* fin mapa */


/* Pide geolocalización al ingresar a la pagina */
document.addEventListener("DOMContentLoaded", function() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        latitud = position.coords.latitude;
        longitud = position.coords.longitude;
        initMap();
        document.getElementById("mapa").style.display = "flex";
        document.getElementById("cargaMapa").style.display = "none";
        guardarClima();
        guardarPeriodo();
      },
      function (error) {
        mensajeError("Activa la geolocalización");
      }
    );
  } else {
    mensajeError("El navegador no admite la geolocalización.");
  }
});
/* Fin geolocalización */





/* Utilizando api de clima en el momento */

    const claveApi = 'dc78e1a5c1eed0a313b2842a689a0b92';      

async function obtenerClima() {
  let apiUrl =  `https://api.openweathermap.org/data/2.5/weather?lat=${latitud}&lon=${longitud}&appid=${claveApi}`;
  try {
    const respuesta = await fetch(apiUrl);


    if (!respuesta.ok) {
      throw new Error('La red no esta disponible');
    }

    const data = await respuesta.json();
    console.log("mi respuesta", data)
    return data;
  } catch (error) {
    console.error('Hubo un problema con la solicitud:', error);
  }
}

async function guardarClima() {
  try {
    const datosClima = await obtenerClima();
    console.log('Datos del clima:', datosClima);


    const { main, name: nombre, weather } = datosClima;
    const { temp: temperatura, temp_max: maxim, temp_min: min } = main;
    const { description: descripcion, id: idClima } = weather[0];

    
    mostrarClima(idClima, temperatura, nombre, maxim, min, descripcion)

    guardarPeriodo();
    

  } catch (error) {
    mensajeError("Error al mostrar el clima");
  }
}


function mostrarClima(idClima, temp, nombre, maximo, minimo, descripcion){
  const titulo = document.getElementById("tarjetaTiempo-titulo");
  const climaDescripcion = document.getElementById("tarjetaTiempo-descripcion");
  const iconoTiempo = document.getElementById("iconoTiempo");
  const tiempoActual = document.getElementById("tarjetaTiempo-temp");
  const max_min = document.getElementById("tarjetaTiempo-minMax");

  const temperatura = cambiarKelvin(temp);
  const max = cambiarKelvin(maximo);
  const min = cambiarKelvin(minimo);

  titulo.innerHTML = nombre;
  climaDescripcion.innerHTML = descripcion;
  tiempoActual.innerHTML = `${temperatura}º`; 
  max_min.innerHTML = `${max}º / ${min}º`;

  /* lluvia */
  if((idClima >= 300 && idClima <=531) || (idClima >= 701 && idClima <= 781 )){
    document.getElementById("body").style.backgroundImage = "url(../img/lluvia.jpg)";
    iconoTiempo.src = '../icono/lluvia.png';

  }else if(idClima >= 600 && idClima <= 622){ /* nieve */
    document.getElementById("body").style.backgroundImage = "url(img/nieve.jpg)";
    iconoTiempo.src = 'icono/nieve.png';

  }else if(idClima >= 801 && idClima <= 804){/* nublado */
    document.getElementById("body").style.backgroundImage = "url(img/nublado.jpg)";
    iconoTiempo.src = 'icono/nublado.png';

  }else if(idClima >= 200 && idClima <= 232){/* tormenta */
    document.getElementById("body").style.backgroundImage = "url(img/tormenta.jpg)";
    iconoTiempo.src = 'icono/tormenta.png';

  }else if(idClima == 800){/* Soleado */
  document.getElementById("body").style.backgroundImage = "url(img/soleado.jpg)"
  iconoTiempo.src = 'icono/soleado.png'
  }
 

  document.getElementById("cargarTimepo").classList.add('d-none');
  document.getElementById("contenedorTarjetaTiempo").classList.remove('d-none');

  const nuevoHistorial = new Historial(nombre, temperatura);

  guardarEnHistorial(nuevoHistorial);
  mostrarHistorial() 
  mensajeExitoso("Busqueda correcta "+nuevoHistorial.mensajeHisorial()+"º")
}

/* function cambiarKelvin(temp){
  return parseInt(temp - 273.15);
}
 */
const cambiarKelvin = temp => parseInt(temp - 273.15);

/* Fin clima al momento */


/* Utilizando api de clima en forma de PERIODO por 5 dias */

let listaPeriodo = [];

async function obtenerPeriodo() {
  let apiUrl =  `https://api.openweathermap.org/data/2.5/forecast?lat=${latitud}&lon=${longitud}&appid=${claveApi}`;
  try {
    const respuesta = await fetch(apiUrl);

    if (!respuesta.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await respuesta.json();
    return data;

  } catch (error) {
    mensajeError("Hubo un problema con la solicitud")
  }
}

async function guardarPeriodo() {
  try {
    const datosPeriodo = await obtenerPeriodo();
    console.log('Datos PERIODO:', datosPeriodo);

    let {/* city,  */list} = datosPeriodo;
    /* let {name: nombreCiudad} = city */


    listaPeriodo.push(list)

    /* console.log("nombre del periodo", nombreCiudad);
    console.log("lista de periodo", listaPeriodo) */

    mostrarPeriodo()

    

  } catch (error) {
    /* PONER UN MENSAJE DE ERROR ACA */
    mensajeError("Error al mostrar el periodo");
  }
}

function mostrarPeriodo( ){
  const contenedor = document.getElementById("contenedor");


  for(const listaDatos of listaPeriodo){

    contenedor.innerHTML=''

    for (const objeto of listaDatos) {

    let [fecha, hora] = objeto.dt_txt.split(' ');
    let fechaConvertida = convertirFecha(fecha)


    const icono = validarIdIcono(objeto.weather[0].id);
    let tiempo = cambiarKelvin(objeto.main.temp);

    let elemento = document.createElement("div");
    elemento.classList.add('elemento');

    elemento.innerHTML =  `
                    <div class="card-body d-flex flex-column p-0" >
                      <p class="card-text periodo-dia">${fechaConvertida}</p>
                      <p class="card-text periodo-descripcion">${objeto.weather[0].description}</p>
                      
                      <div class="d-flex justify-content-center">
                          <img  class="card-img-top periodo-icono" src="${icono}" alt="">
                      </div>
                    </div>

                    <div class="d-flex justify-content-between p-2">
                        <p class="mb-0">${tiempo}º</p>
                        <p class="mb-0">${hora} hs</p>
                    </div>
    
    `

    contenedor.appendChild(elemento)
    }

    document.getElementById("cargarPeriodo").classList.add('d-none');
    document.getElementById("ContenedorPeriodo").classList.remove('d-none');

    

  }

}

function convertirFecha(fecha) {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const nuevafecha = new Date(fecha);
  const diaSemana = dias[nuevafecha.getDay()];
  const diaMes = nuevafecha.getDate();
  const mes = meses[nuevafecha.getMonth()];

  return `${diaSemana}, ${diaMes} de ${mes}`;
}

function validarIdIcono(idClima){
  let respuesta = ""

  if((idClima >= 300 && idClima <=531) || (idClima >= 701 && idClima <= 781 )){
    respuesta = 'icono/lluvia.png';

  }else if(idClima >= 600 && idClima <= 622){
    respuesta = 'icono/lluvia.png';

  }else if(idClima >= 801 && idClima <= 804){
    respuesta = 'icono/nublado.png'

  }else if(idClima >= 200 && idClima <= 232){
    respuesta = 'icono/tormenta.png'

  }else if(idClima == 800){
    respuesta = 'icono/soleado.png'

  }

  return respuesta

}

/* Fin periodod */


/* Guardar en el local storage */
function guardarEnHistorial(busqueda) {
  let historial = JSON.parse(localStorage.getItem('historial')) || [];
  historial.push(busqueda);
  localStorage.setItem('historial', JSON.stringify(historial));
}

function mostrarHistorial() {
  
  const historial = JSON.parse(localStorage.getItem('historial')) || [];


  listarHistorial(historial);
}

/* mostrar gistorial */
function listarHistorial(listaHistorial){
  console.log("soy historial")
  const contenedorListado = document.getElementById("contenedorListado");

  contenedorListado.innerHTML="";

  listaHistorial.map(historial => {
    const { nombre, tiempo } = historial;
  
    let elemento = document.createElement("div");
    elemento.classList.add("row");
  
    elemento.innerHTML = `
      <div class="col-12" style="padding-bottom: 10px; border-bottom: 1px solid violet;">
        <h2>${nombre}</h2>
        <p>${tiempo}º</p>
      </div>
    `;
  
    contenedorListado.appendChild(elemento);
  });

}


/* Fin guarda */

/* Eliminar historial */
const eliminarHist = document.getElementById("eliminarHist");
eliminarHist.addEventListener("click", function(){
  localStorage.removeItem('historial');
  mostrarHistorial();
  mensajeExitoso("Historial eliminado")
})

/* fin eliminar */


function mensajeError(mensaje){
  Toastify({
    text: mensaje,
    duration: 3000,
    newWindow: true,
    close: true,
    gravity: "top", 
    position: "right", 
    stopOnFocus: true, 
    style: {
      background: "red",
    },
   
  }).showToast();
}

function mensajeExitoso(mensaje){
  Toastify({
    text: mensaje,
    duration: 1000,
    newWindow: true,
    close: true,
    gravity: "top", 
    position: "right",
    stopOnFocus: true, 
    style: {
      background: "green",
    },
   
  }).showToast();
}