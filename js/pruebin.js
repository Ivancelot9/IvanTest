//Obtener referencias del HTML
let signUp= document.getElementById("signUp");
let signIn = document.getElementById("signIn");
let nameInput = document.getElementById("nameInput");
let title = document.getElementById("title");

//Referencias a los campos del formulario
//QuerySelector selecciona el primer elemento del DOM que coinda con tu parametro
const inputNombre = document.querySelector('input[placeholder="Nombre"]');
const inputNomina = document.querySelector('input[placeholder="Número de Nómina"]');
const inputContra = document.querySelector('input[placeholder="Contraseña"]');

//Mensaje de Advertencia
let statusMessage = document.createElement(("p"));
statusMessage.style.color = "red";
statusMessage.style.marginTop = "10px";
document.querySelector(".Forma-Contenedor").appendChild(statusMessage);

document.querySelector("form").addEventListener("submit", function (event) {
    if (!validarFormulario()) {
        event.preventDefault(); // Evita el envío si las validaciones fallan
    }
});

//Validar Formulario
function validarFormulario(){

    // `const` define una variable que no cambiará su referencia.
    // Obtenemos el valor del campo, eliminando los espacios en blanco al inicio y al final.
    const nombre = inputNombre.value.trim();

    // Usamos `let` porque el valor inicial puede cambiar más adelante en el código.
    let numNomina = inputNomina.value.trim();
    const contra =inputContra.value.trim();

    //Validar que camos no se queden vacios
    if(!nombre || !numNomina || !contra)
    {
        statusMessage.textContent = "Completa todos los capos";
        return false;
    }

    //Validar que el numero de nomina tenga exactamente 8 caracteres
    if(numNomina.length < 8)
    {
        numNomina = numNomina.padStart(8, "0");
    }

    if (numNomina.length !== 8)
    {
        statusMessage.textContent = "Agrega tres 0 antes de tu número de nómina ejemplo 00058587";
        return false;
    }

    statusMessage.textContent = "Formulario enviado correctamente";
    statusMessage.style.color = "green";
    return true;
}


// Eventos para los botones de la animación
signIn.onclick = function () {
    nameInput.style.maxHeight = "0";
    title.innerHTML = "Login";
    signUp.classList.add("disable");
    signIn.classList.remove("disable");
};

signUp.onclick = function () {
    nameInput.style.maxHeight = "60px";
    title.innerHTML = "Registro";
    signUp.classList.remove("disable");
    signIn.classList.add("disable");

    // Validar formulario al hacer clic en "Registro"
    if (validarFormulario()) {
        // Aquí podrías enviar los datos al servidor con un método como fetch o AJAX.
        console.log("Datos válidos. Procesando registro...");
    }
};



















//Animaciones de Botones
signIn.onclick = function () {
    nameInput.style.maxHeight = "0";
    title.innerHTML = "Login";
    signUp.classList.add("disable");
    signIn.classList.remove("disable");
}

signUp.onclick = function () {
    nameInput.style.maxHeight = "60px";
    title.innerHTML = "Registro";
    signUp.classList.remove("disable");
    signIn.classList.add("disable");
}




