document.addEventListener("DOMContentLoaded", () => {
  const botones = document.querySelectorAll(".touch-btn");

  const supportsPointer = window.PointerEvent !== undefined;

  botones.forEach((btn) => {
    if (supportsPointer) {
      btn.addEventListener("pointerdown", (e) => {
        if (e.isPrimary !== false) ejecutarAccion(btn.dataset.action);
      }, { passive: true });
    } else {
      let touched = false;
      btn.addEventListener("touchstart", (e) => {
        touched = true;
        ejecutarAccion(btn.dataset.action);
      }, { passive: true });

      btn.addEventListener("click", (e) => {
        if (touched) { touched = false; return; }
        ejecutarAccion(btn.dataset.action);
      });
    }
  });

  function ejecutarAccion(accion) {
    switch (accion) {
      case "accion1":
        alert("Ejecutando acción 1");
        break;
      case "accion2":
        alert("Ejecutando acción 2");
        break;
      case "accion3":
        alert("Ejecutando acción 3");
        break;
      default:
        console.log("Acción no definida:", accion);
    }
  }
});
