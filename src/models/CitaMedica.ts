import { Medico } from "./Medico";
import { Paciente } from "./Paciente";

export class CitaMedica {
    id: string;
    nombrePaciente: string;
    fecha: Date;
    hora: string;
    medicoAsignado: Medico;
    estado: "pendiente" | "confirmada" | "realizada" | "cancelada";
    creadoEn: Date;

    constructor(id: string, nombrePaciente: string, fecha: Date, hora: string, medicoAsignado: Medico) {
        this.id = id;
        this.nombrePaciente = nombrePaciente;
        this.fecha = fecha;
        this.hora = hora;
        this.medicoAsignado = medicoAsignado;
        this.estado = "pendiente";
        this.creadoEn = new Date();
    }

    confirmarCita(): void {
        this.estado = "confirmada";
    }

    realizarCita(): void {
        this.estado = "realizada";
    }

    cancelarCita(): void {
        this.estado = "cancelada";
    }
}
