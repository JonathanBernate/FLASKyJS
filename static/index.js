// Caracteres para el tablero
const x = "✖";
const o = "〇";

// Elementos de la página
const cuadrados = document.querySelectorAll(".cuadrado");
const modal = document.querySelector("dialog");
const textoModal = modal.querySelector("h2");
const timerElement = document.getElementById("timer");
const turnoElement = document.getElementById("turno"); // Para mostrar el turno
const botonReiniciar = modal.querySelector("#reiniciarJuego");

// Variables para el temporizador
let tiempoRestante = 0;
let tiempoServidor;
let temporizador;
let estadoJuego = "P1"; // P1 | P2 | PAUSA

let juagador1
let jugador2

window.onload = mostrarUsuariosEnTarjetas;
document.addEventListener("DOMContentLoaded", obtenerUsuarios);  // Ejecutar la función al cargar la página

// Define la función para obtener datos de la tabla "tiempo" desde Flask
function getTiempoData() {
  const url = '/tiempo';  // Define la URL del endpoint Flask

  // Realiza la solicitud HTTP GET usando fetch
  fetch(url)
    .then(response => {
      if (!response.ok) {
        // Maneja errores HTTP
        console.error('Error al obtener datos:', response.status, response.statusText);
        return;
      }
      return response.json();  // Convierte la respuesta a JSON
    })
    .then(data => {
      // Imprime los datos obtenidos en la consola
      console.log('Datos obtenidos de la tabla "tiempo":', data[0]);

      const espera = data[0].tiempo
      tiempoServidor = espera


    })
    .catch(error => {
      // Maneja errores de red o de fetch
      console.error('Error al realizar la solicitud:', error);
    });
}


// Función para actualizar el turno
function actualizarTurno() {
  const jugador = estadoJuego === "P1" ? "1" : "2";
  turnoElement.innerText = `Turno del jugador ${jugador}`;
}

// Iniciar el temporizador
function iniciarTemporizador() {
  timerElement.innerText = `Tiempo restante: ${tiempoRestante}s`;
  temporizador = setInterval(() => {
    tiempoRestante--;
    timerElement.innerText = `Tiempo restante: ${tiempoRestante}s`;

    if (tiempoRestante <= 0) {
      // Cambiar de jugador y reiniciar el temporizador
      cambiarTurno();
    }
  }, 1000); // Actualiza cada segundo
}

// Cambiar de turno
function cambiarTurno() {
  clearInterval(temporizador);
  estadoJuego = estadoJuego === "P1" ? "P2" : "P1";
  tiempoRestante = tiempoServidor; // Reiniciar tiempo para el nuevo jugador
  actualizarTurno(); // Actualizar el mensaje del turno
  iniciarTemporizador(); // Reiniciar el temporizador
}

// Manejador de eventos para cada cuadrado
cuadrados.forEach((cuadrado, posicion) => {
  cuadrado.addEventListener("click", () => {
    if (estadoJuego === "PAUSA") return;
    if (cuadrado.textContent !== "") return;

    cuadrado.textContent = estadoJuego === "P1" ? x : o;
    const posicionGanadora = revisarSiHayGanador();

    if (typeof posicionGanadora === "object") {
      ganar(posicionGanadora);
      return;
    }

    if (posicionGanadora === "empate") {
      mostrarModal("Empate");
    }

    cambiarTurno(); // Cambia el turno después de un movimiento
  });
});

// Manejador de evento para el botón de reinicio
botonReiniciar.addEventListener("click", () => {

  cuadrados.forEach((cuadrado) => {
    cuadrado.textContent = "";
    cuadrado.classList.toggle("ganador", false);
  });

  modal.close();
  estadoJuego = "P1";
  clearInterval(temporizador); // Reiniciar el temporizador
  tiempoRestante = 10;
  iniciarTemporizador(); // Reiniciar el temporizador al reiniciar el juego
  actualizarTurno(); // Restablecer el mensaje del turno
});

function guardarGanador(ganador) {
  console.log(ganador)
  // Enviar resultado al servidor
  fetch('/save_result', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ganador: ganador })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al guardar el resultado');
      }
      return response.json();
    })
    .catch(error => {
      console.error('Hubo un error:', error);
    });
}

function revisarSiHayGanador() {
  const tablero = Array.from(cuadrados).map((cuadrado) => cuadrado.textContent);

  // Reviso filas
  for (let i = 0; i < 9; i += 3) {
    if (tablero[i] && tablero[i] === tablero[i + 1] && tablero[i] === tablero[i + 2]) {
      return [i, i + 1, i + 2];
    }
  }

  // Reviso columnas
  for (let i = 0; i < 3; i++) {
    if (tablero[i] && tablero[i] === tablero[i + 3] && tablero[i + 6]) {
      return [i, i + 3, i + 6];
    }
  }

  // Reviso oblicuas
  if (tablero[0] && tablero[0] === tablero[4] && tablero[8]) return [0, 4, 8];
  if (tablero[2] && tablero[2] === tablero[4] && tablero[6]) return [2, 4, 6];

  // Reviso empate
  if (tablero.includes("")) return false;
  return "empate";
}

function ganar(posicionesGanadoras) {
  posicionesGanadoras.forEach((posicion) => {
    cuadrados[posicion].classList.toggle("ganador", true);
  });

  guardarGanador(estadoJuego)
  mostrarModal("Ganador jugador " + (estadoJuego === "P1" ? "1" : "2"));
  clearInterval(temporizador); // Detener el temporizador en caso de victoria
}


// Llama a la función para obtener datos
getTiempoData();  // Llama a la función para realizar la solicitud


function obtenerUsuarios() {
  fetch("/usuarios")  // Realiza una solicitud GET a la ruta /usuarios
    .then(response => {
      if (!response.ok) {  // Verifica si la respuesta es correcta
        throw new Error("Error al obtener los datos");
      }
      return response.json();  // Convierte la respuesta a JSON
    })
    .then(usuarios => {
      console.log("Usuarios obtenidos:", usuarios);  // Imprime los datos por consola
    })
    .catch(error => {  // Manejo de errores
      console.error("Error:", error);
    });
}

function guardarCambios() {
  var tiempoRestante = $("#exampleInput1").val();  // Obtener el valor del input

  // Verificar que el valor no esté vacío
  if (tiempoRestante === "" || isNaN(tiempoRestante)) {
    console.warn("El valor ingresado es inválido.");
    return;  // No envía la solicitud si el valor no es válido
  }

  // Enviar una solicitud AJAX para actualizar la base de datos
  $.ajax({
    url: "/update_tiempo",  // Ruta a la que se enviarán los datos
    type: "POST",
    data: JSON.stringify({ "tiempo_restante": tiempoRestante }),  // Datos en formato JSON
    contentType: "application/json",
    success: function (response) {  // Acciones en caso de éxito
      console.log("Datos actualizados:", response);
      window.location.href = "http://127.0.0.1:5000/triki"; 
      $("#configModal").modal('hide');  // Cerrar el modal tras la actualización exitosa
    },
    error: function (xhr, status, error) {  // Manejo de errores
      console.error("Error al actualizar:", error);
    }
  });
}


// Esta función llamará a obtenerUsuarios y luego mostrará los datos en las tarjetas
function mostrarUsuariosEnTarjetas() {
  obtenerUsuarios();  // Llama a la función para obtener los usuarios

  // Espera a que la función fetch los datos antes de continuar
  fetch("/usuarios")
    .then(response => response.json())
    .then(usuarios => {
      if (usuarios.length >= 2) {
        // Actualiza el contenido de la primera tarjeta
        const tarjeta1 = document.getElementById("tarjeta1");
        console.log(tarjeta1)
        tarjeta1.querySelector(".card-nombre").innerText = usuarios[0].nombre;
        tarjeta1.querySelector(".card-correo").innerText = usuarios[0].correo;
        tarjeta1.querySelector(".card-edad").innerText = usuarios[0].edad;

        const img1 = tarjeta1.querySelector(".card-foto");
        if (img1) {
          img1.src = src = "/static/images/" + usuarios[0].foto;  // Establece el atributo 'src' con la URL de la imagen
        }


        // Actualiza el contenido de la segunda tarjeta
        const tarjeta2 = document.getElementById("tarjeta2");
        console.log(tarjeta2)
        tarjeta2.querySelector(".card-nombre2").innerText = usuarios[1].nombre;
        tarjeta2.querySelector(".card-correo2").innerText = usuarios[1].correo;
        tarjeta2.querySelector(".card-edad2").innerText = usuarios[1].edad;

        const img2 = tarjeta2.querySelector(".card-foto2");
        if (img2) {
          img2.src = src = "/static/images/" + usuarios[1].foto;  // Establece el atributo 'src' con la URL de la imagen
        }

      }
    })
    .catch(error => {
      console.error("Error al obtener usuarios para las tarjetas:", error);
    });
}


function mostrarModal(texto) {
  textoModal.innerText = texto;
  modal.showModal();
  estadoJuego = "PAUSA";
}

function clearGanadorData() {
  $.ajax({
      url: "/clear_ganador",
      type: "DELETE",
      success: function(data) {
          console.log("Datos eliminados con éxito.");
          // Puedes agregar cualquier acción adicional aquí
          window.location.href = "http://127.0.0.1:5000/registro"; 
      },
      error: function(error) {
          console.error("Error al eliminar datos:", error);
          // Puedes agregar cualquier acción adicional en caso de error
      }
  });
}

// Llama a la función cuando el botón "Sí" es presionado
$("#confirmButton").click(function() {
  clearGanadorData();  // Llamar a la función que elimina datos
});




iniciarTemporizador(); // Comienza el temporizador al iniciar el juego
actualizarTurno(); // Establecer el turno inicial
