export class Paciente {
    id: string;
    nombre: string;
    edad: number;
    telefono: string;
    email: string;

    constructor(id: string, nombre: string, edad: number, telefono: string, email: string) {
        this.id = id;
        this.nombre = nombre;
        this.edad = edad;
        this.telefono = telefono;
        this.email = email;
    }
}
