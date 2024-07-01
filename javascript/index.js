document.addEventListener('DOMContentLoaded', (event) => {
    cargarPeliculas();
    cargarCarrito();
});

let items = [];

let total = 0;
let carrito = [];

let InteresCuotas = {
    3: 5,
    6: 8
};

document.getElementById('comprar').addEventListener('click', () => mostrarPeliculas(false));
document.getElementById('alquilar').addEventListener('click', () => mostrarPeliculas(true));
document.getElementById('verCarrito').addEventListener('click', mostrarCarrito);
document.getElementById('finalizarCompra').addEventListener('click', finalizarCompra);
document.getElementById('pagoEfectivo').addEventListener('click', pagarEfectivo);
document.getElementById('pagoCuotas').addEventListener('click', () => mostrarCuotas());
document.getElementById('calcularCuotas').addEventListener('click', calcularCuotas);

function cargarPeliculas() {
    fetch('./data/peliculas.json')
        .then(response => response.json())
        .then(data => {
            items = data;
        })
        .catch(error => console.error('Error al cargar el archivo JSON:', error));
}

function mostrarPeliculas(alquiler) {
    const peliculasDisponibles = document.getElementById('peliculasDisponibles');
    const listaPeliculas = document.getElementById('listaPeliculas');
    peliculasDisponibles.classList.remove('hidden');
    listaPeliculas.innerHTML = '';

    for (let i = 0; i < items.length; i++) {
        if ((alquiler && items[i].alquiler) || !alquiler) {
            const li = document.createElement('li');
            li.textContent = `${i + 1}: ${items[i].titulo} - ${items[i].genero} (${items[i].año}) - ${alquiler ? items[i].costoAlquilerPorDia + ' pesos por día' : items[i].precio + ' pesos'}`;
            li.dataset.index = i;
            listaPeliculas.appendChild(li);

            li.addEventListener('click', (event) => {
                seleccionarPelicula(i, alquiler);
            });
        }
    }
}

function seleccionarPelicula(index, alquiler) {
    let pelicula = items[index];
    if (alquiler && pelicula.alquiler) {
        let diasAlquiler = parseInt(prompt('Ingrese la cantidad de días de alquiler:'));
        if (!isNaN(diasAlquiler)) {
            pelicula.duracionAlquiler = diasAlquiler;
            if (!estaEnCarrito(pelicula)) {
                carrito.push(pelicula);
                total += pelicula.costoAlquilerPorDia * diasAlquiler;
                alert(`${pelicula.titulo} ha sido agregado al carrito.`);
                guardarCarrito();
            } else {
                alert(`${pelicula.titulo} ya está en el carrito.`);
            }
        } else {
            alert('Ingrese un número válido para los días de alquiler.');
        }
    } else if (!alquiler && !pelicula.alquiler) {
        if (!estaEnCarrito(pelicula)) {
            carrito.push(pelicula);
            total += pelicula.precio;
            alert(`${pelicula.titulo} ha sido agregado al carrito.`);
            guardarCarrito();
        } else {
            alert(`${pelicula.titulo} ya está en el carrito.`);
        }
    } else {
        alert('Esta acción no es válida para esta película.');
    }
}

function estaEnCarrito(pelicula) {
    return carrito.some(item => item.titulo === pelicula.titulo && item.alquiler === pelicula.alquiler && item.duracionAlquiler === pelicula.duracionAlquiler);
}

function mostrarCarrito() {
    cargarCarrito();
    const carritoDiv = document.getElementById('carrito');
    const listaCarrito = document.getElementById('listaCarrito');
    const totalCarrito = document.getElementById('totalCarrito');
    carritoDiv.classList.remove('hidden');
    listaCarrito.innerHTML = '';

    for (let i = 0; i < carrito.length; i++) {
        const li = document.createElement('li');
        li.textContent = `${carrito[i].titulo} - ${carrito[i].genero} (${carrito[i].año}) - ${carrito[i].alquiler ? carrito[i].costoAlquilerPorDia + ' pesos por día' : carrito[i].precio + ' pesos'}`;
        listaCarrito.appendChild(li);
    }
    totalCarrito.textContent = total;
}

function finalizarCompra() {
    if (carrito.length === 0) {
        alert("No puede finalizar la compra sin haber seleccionado algo.");
        return;
    }

    const finalizarDiv = document.getElementById('finalizar');
    const totalFinalizar = document.getElementById('totalFinalizar');
    finalizarDiv.classList.remove('hidden');
    totalFinalizar.textContent = total;
}

function pagarEfectivo() {
    alert(`El total de su compra es de ${total} pesos. ¡Gracias por su compra!`);
    resetearCompra();
}

function mostrarCuotas() {
    document.getElementById('cuotas').classList.remove('hidden');
}

function calcularCuotas() {
    const cuotas = parseInt(document.getElementById('cantidadCuotas').value);
    if (cuotas >= 3 && cuotas <= 6) {
        const totalInteres = round(total * (1 + (InteresCuotas[cuotas] / 100)), 2);
        const valorCuota = round(totalInteres / cuotas, 2);

        document.getElementById('cuotas').classList.add('hidden');
        document.getElementById('resultadoCuotas').classList.remove('hidden');
        document.getElementById('totalInteres').textContent = totalInteres;
        document.getElementById('valorCuota').textContent = valorCuota;

        document.getElementById('finalizar').classList.remove('hidden');
        document.getElementById('totalFinalizar').textContent = totalInteres;

        document.getElementById('calcularCuotas').disabled = true;
    } else {
        alert('Ingrese un número de cuotas válido (entre 3 y 6).');
    }
}

function resetearCompra() {
    total = 0;
    carrito = [];
    localStorage.removeItem('carrito');
    document.getElementById('listaCarrito').innerHTML = '';
    document.getElementById('totalCarrito').textContent = '';
    document.getElementById('totalFinalizar').textContent = '';
    document.getElementById('totalInteres').textContent = '';
    document.getElementById('valorCuota').textContent = '';
    document.getElementById('peliculasDisponibles').classList.add('hidden');
    document.getElementById('carrito').classList.add('hidden');
    document.getElementById('finalizar').classList.add('hidden');
    document.getElementById('cuotas').classList.add('hidden');
    document.getElementById('resultadoCuotas').classList.add('hidden');

    document.getElementById('calcularCuotas').disabled = false;
}

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function cargarCarrito() {
    let carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarTotal();
    }
}

function actualizarTotal() {
    total = carrito.reduce((sum, pelicula) => {
        if (pelicula.alquiler) {
            return sum + (pelicula.costoAlquilerPorDia * pelicula.duracionAlquiler);
        } else {
            return sum + pelicula.precio;
        }
    }, 0);
}
function round(numero, decimales = 2) {
    const factor = Math.pow(10, decimales);
    return Math.round(numero * factor) / factor;
}