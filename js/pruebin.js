document.getElementById("formularioRegistro").addEventListener("submit", function (event){
    event.preventDefault();

//Obtener referencias del HTML
let signUp= document.getElementById("signUp");
let signIn = document.getElementById("signIn");
let nameInput = document.getElementById("nameInput");
let title = document.getElementById("title");

//Referencias a los campos del formulario
//QuerySelector selecciona el primer elemento del DOM que coinda con tu parametro
const inputNombre = document.getElementById('input[placeholder="Nombre"]');
const inputNomina = document.getElementById('input[placeholder="Número de Nómina"]');
const inputContrasena = document.getElementById('input[placeholder="Contrasena"]');

//Mensaje de Advertencia
let statusMessage = document.createElement(("p"));
statusMessage.style.color = "red";
statusMessage.style.marginTop = "10px";

//Validar Formulario
function validarFormulario(){

    // `const` define una variable que no cambiará su referencia.
    // Obtenemos el valor del campo, eliminando los espacios en blanco al inicio y al final.
    const nombre = inputNombre.value.trim();

    // Usamos `let` porque el valor inicial puede cambiar más adelante en el código.
    let numNomina = inputNomina.value.trim();
    const contrasena =inputContrasena.value.trim();

    //Validar que camos no se queden vacios
    if(!nombre || !numNomina || !contrasena)
    {
        statusMessage.textContent = "Completa todos los campos";
        return false;
    }

    //Validar que el numero de nomina tenga solo 5 digitos
    if(numNomina.length !== 5)
    {
        statusMessage.textContent = "Número de Nómina debe tener 5 digitos";
        return false;
    }

    //Agrega 3 ceros al inicio de la nomina
    numNomina = numNomina.padStart(8, "0");

    //Actualizar el valor del campo con los ceros añadidos
    inputNomina.value = numNomina;

    statusMessage.textContent = "Formulario enviado correctamente";
    statusMessage.style.color = "green";
    return true;
}


//Enviar datos al servidor con fetch
    const formData = new FormData();
    formData.append("Nombre", inputNombre.value.trim());
    formData.append("NumNomina", inputNomina.value.trim());
    formData.append("Contrasena", inputContrasena.value.trim());

    fetch("dao/registroUsuario.php", {
        method: "POST",
        body: formData,
})
        .then((response) =>{
        if (!response.ok) {
            throw new Error("Error en la respuesta del servidor");
        }
        return response.json();
        })
        .then((data) =>{
            if (data.status === "success"){
                //Mostrar mensaje de exito y redirigir al usuario
                Swal.fire({
                    icon: "success",
                    title: "¡Registro exitoso!",
                    text: data.message || "Tu cuenta ha sido creada correctamente",
                    confirmButtonText: "Iniciar Sesión",
                })
            } else {
                //Mostrar Mensaje de error del servidor
                statusMessage.textContent = data.message || "Hubo un problema al procesar";
                statusMessage.style.color = "red";
            }
        })
        .catch((error) => {
           //Manejar errores de comunicacion con el servidor
           statusMessage.textContent = "Error en la comunicación con el servidor";
           statusMessage.style.color = "red";
           console.error("Error", error);
        });



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
}

});


