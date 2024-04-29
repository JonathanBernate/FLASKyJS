// Caracteres para el tablero
const x = "✖";
const o = "〇";


// Variables para el temporizador
let tiempoRestante = 10; // 10 segundos para cada turno
let temporizador;
let estadoJuego = "P1"; // P1 | P2 | PAUSA

let juagador1
let jugador2

getCountP1P2();

window.onload = mostrarUsuariosEnTarjetas;
document.addEventListener("DOMContentLoaded", obtenerUsuarios);  // Ejecutar la función al cargar la página


function getCountP1P2() {
  // URL del endpoint en Flask
  const endpoint = '/count_p1_p2';

  // Realizar la llamada al endpoint
  fetch(endpoint)
    .then(response => {
      if (!response.ok) {
        throw new Error("Error al obtener datos: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      const winnerMessage = document.getElementById('winnerMessage'); 
      const winMessage = document.getElementById('winMessage');


      if (data.total_P1 > data.total_P2) {
        winnerMessage.innerText = "Primer puesto jugador 1";
        winMessage.innerText = "Segundo puesto jugador 2";
      } else if (data.total_P2 > data.total_P1) {
        winnerMessage.innerText = "Primer puesto jugador 2";
        winMessage.innerText = "Segundo puesto jugador 1";
      } else {
        winnerMessage.innerText = "Es un empate";
        winMessage.innerText = "Es un empate";
      }

    
     
     
      const ctx = document.getElementById('myChart').getContext('2d');

      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Jugador1', 'Jugador2'], // Nombres de las categorías
          datasets: [{
            label: 'Conteo',
            data: [data.total_P1, data.total_P2], // Datos obtenidos
            backgroundColor: ['#DC3545', '#007BFF'], // Colores para cada barra
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

    })
    .catch(error => {
      console.error("Error:", error);
    });
}



// Función para actualizar el turno
function actualizarTurno() {
  const jugador = estadoJuego === "P1" ? "1" : "2";
  turnoElement.innerText = `Turno del jugador ${jugador}`;
}



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

$("#confirmButton").click(function() {
  clearGanadorData();  // Llamar a la función que elimina datos
});




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