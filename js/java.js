// Verificar formulario
function checkFormCompletion() {
    const requiredFields = document.querySelectorAll("input[required], textarea[required]");
    const fileInput = document.getElementById("adjuntar");

    const allFilled = [...requiredFields].every(field => {
        if (field.type === "checkbox" || field.type === "radio") {
            const group = document.querySelectorAll(`input[name="${field.name}"]:checked`);
            return group.length > 0;
        }
        return field.value.trim();
    }) && fileInput.files.length > 0;

    document.getElementById("submitButton").disabled = !allFilled;
}

// Control de selección de Proyecto
function toggleAmenity(checkbox) {
    const selected = document.querySelectorAll('input[name="tipoProyecto"]:checked');
    if (selected.length > 1) {
        checkbox.checked = false;
        Swal.fire("¡Máximo 1 tipo de Proyecto!", "Por favor selecciona solo uno.", "warning");
    }
    updateSelection(checkbox);
    checkFormCompletion();
}

// Control de selección de respuesta
function toggleRespuesta(radio) {
    document.querySelectorAll('input[name="respuesta"]').forEach(r => {
        updateSelection(r);
    });
    checkFormCompletion();
}

// Estilos de selección
function updateSelection(element) {
    const label = element.closest('.option');
    if (element.checked) {
        label.classList.add("selected");
    } else {
        label.classList.remove("selected");
    }
}

// Vista previa de imagen
function previewImage() {
    const fileInput = document.getElementById("adjuntar");
    const preview = document.getElementById("imagePreview");

    if (fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = "block";
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        preview.style.display = "none";
    }

    checkFormCompletion();
}

// Envío de formulario
function UploadFile() {
    const file = document.getElementById("adjuntar").files[0];
    const reader = new FileReader();
    showLoader();

    reader.onload = function () {
        document.getElementById("fileContent").value = reader.result;
        document.getElementById("filename").value = file.name;

        const form = document.getElementById("uploadForm");
        const formData = new FormData(form);

        // Ayudas seleccionadas
        const ayudas = Array.from(document.querySelectorAll('input[name="tipoProyecto"]:checked')).map(cb => cb.value);
        formData.set("tipoProyecto", ayudas.join(", "));

        // Respuesta seleccionada
        const respuesta = document.querySelector('input[name="respuesta"]:checked');
        if (respuesta) {
            formData.set("respuesta", respuesta.value);
        }

        // Fecha y hora
        const now = new Date();
        const fecha = now.toLocaleDateString("es-CO");
        const hora = now.toLocaleTimeString("es-CO");

        formData.set("fechaEnvio", fecha);
        formData.set("horaEnvio", hora);

        fetch(form.action, {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                hideLoader();
                if (data.status === "success") {
                    showModal(data.details, fecha, hora);
                } else {
                    Swal.fire("Error", "No se pudo enviar el formulario. Inténtalo de nuevo.", "error");
                }
            })
            .catch(() => {
                hideLoader();
                Swal.fire("Error", "Hubo un problema de conexión.", "error");
            });
    };

    reader.readAsDataURL(file);
}

// Mostrar modal y confeti
function showModal(details, fecha, hora) {
    document.getElementById("modalMessage").innerHTML = `
          <h2>¡Formulario enviado exitosamente!</h2>
          <p><strong>Nombre:</strong> ${details.nombre}</p>
          <p><strong>Documento:</strong> ${details.documento}</p>
          <p><strong>Dirección:</strong> ${details.direccion}</p>
          <p><strong>Área (m²):</strong> ${details.area}</p>
          <p><strong>Tipo de Proyecto:</strong> ${details.tipoProyecto}</p>
          <p><strong>Planos Aprobados?:</strong> ${details.respuesta}</p>
          <p><strong>Descripción:</strong> ${details.descripcion}</p>
          <p><a href="${details.fileUrl}" target="_blank">Ver Archivo</a></p>
          <p><strong>Fecha:</strong> ${fecha}</p>
          <p><strong>Hora:</strong> ${hora}</p>
        `;
    document.getElementById("myModal").style.display = "block";

    // 🎉 Lanzar confeti solo cuando se envía correctamente
    confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 }
    });
}

// Loader
function showLoader() {
    document.querySelector('.socket').style.display = 'flex';
}
function hideLoader() {
    document.querySelector('.socket').style.display = 'none';
}

// Cierra el modal y resetea el formulario
function closeModal() {
    document.getElementById("myModal").style.display = "none";
    document.getElementById("uploadForm").reset();
    document.getElementById("imagePreview").style.display = "none";
    document.getElementById("submitButton").disabled = true;
    document.querySelectorAll('.option.selected').forEach(option => {
        option.classList.remove('selected');
    });
}

// Eventos de validación
document.querySelectorAll("input[required], textarea[required]").forEach(input => {
    input.addEventListener("input", checkFormCompletion);
    if (input.type === "checkbox" || input.type === "radio") {
        input.addEventListener("change", checkFormCompletion);
    }
});

// Radios para selección
document.querySelectorAll('input[name="respuesta"]').forEach(radio => {
    radio.addEventListener("change", function () {
        toggleRespuesta(this);
    });
});

// Inicialización
window.onload = checkFormCompletion;