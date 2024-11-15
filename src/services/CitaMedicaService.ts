import CitaMedicaRepository from 'src/repositories/CitaMedicaRepository'
import * as uuid from 'uuid'
import { CitaMedica } from 'src/models/CitaMedica'
import { Medico } from 'src/models/Medico'

export default class CitaMedicaService {
    citaMedicaRepository: CitaMedicaRepository

    // Crear una instancia del repositorio de Citas Médicas
    constructor(citaMedicaRepository: CitaMedicaRepository = new CitaMedicaRepository()) {
        this.citaMedicaRepository = citaMedicaRepository
    }

    // Obtener todas las citas médicas
    async getAllCitas(): Promise<CitaMedica[]> {
        return this.citaMedicaRepository.getAllCitas()
    }

    // Crear una nueva cita médica
    async createCita(nombrePaciente: string, fecha: Date, hora: string, medicoAsignado: Medico): Promise<CitaMedica> {
        const id = uuid.v4()

        // Crear la nueva cita médica (con paciente y médico asignado)
        const citaMedica = new CitaMedica(id, nombrePaciente, fecha, hora, medicoAsignado)
        
        // Guardar la cita médica en el repositorio
        return await this.citaMedicaRepository.createCita(citaMedica)
    }

    // Actualizar una cita médica
    async updateCita(partialCita: Partial<CitaMedica>): Promise<CitaMedica> {
        return await this.citaMedicaRepository.updateCita(partialCita)
    }

    // Eliminar una cita médica por su ID
    async deleteCitaById(id: string): Promise<void> {
        return await this.citaMedicaRepository.deleteCitaById(id)
    }

    // Obtener una cita médica por ID
    async getCitaById(id: string): Promise<CitaMedica | null> {
        return await this.citaMedicaRepository.getCitaById(id)
    }
}
