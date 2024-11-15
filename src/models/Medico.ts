export class Medico {
    id: string;
    nombre: string;
    especialidad: string;
    edad: number;
    telefono: string;
    email: string;

    constructor(id: string, nombre: string, especialidad: string, edad: number, telefono: string, email: string) {
        this.id = id;
        this.nombre = nombre;
        this.especialidad = especialidad;
        this.edad = edad;
        this.telefono = telefono;
        this.email = email;
    }
}
