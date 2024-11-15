import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import CitaMedicaService from 'src/services/CitaMedicaService'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Extraemos los datos de la cita médica desde el cuerpo de la solicitud
        const { nombrePaciente, fecha, hora, medicoAsignadoId } = JSON.parse(event.body)

        // Validamos que todos los datos necesarios están presentes
        if (!nombrePaciente || !fecha || !hora || !medicoAsignadoId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Faltan datos requeridos: nombrePaciente, fecha, hora, medicoAsignadoId.'
                })
            }
        }

        // Crear una instancia del servicio de CitaMedica
        const citaMedicaService = new CitaMedicaService()

        // Llamar al servicio para crear la cita médica
        const citaMedica = await citaMedicaService.createCita(nombrePaciente, new Date(fecha), hora, medicoAsignadoId)

        // Retornar la respuesta de éxito con el detalle de la cita médica creada
        return {
            statusCode: 201,
            body: JSON.stringify({
                item: citaMedica
            })
        }
    } catch (error) {
        console.error('Error al crear la cita médica:', error)

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Hubo un error al procesar la solicitud.'
            })
        }
    }
}
