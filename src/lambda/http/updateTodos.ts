import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import CitaMedicaService from 'src/services/CitaMedicaService'
import { CitaMedica } from 'src/models'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    // Obtener el id de los parámetros de la URL
    const id = event.pathParameters.id

    // Crear una instancia del servicio CitaMedicaService
    const citaMedicaService = new CitaMedicaService()

    try {
        // Los datos de la cita médica se pasan en el cuerpo de la solicitud (body)
        const citaMedica: Partial<CitaMedica> = { ...JSON.parse(event.body), id }

        // Llamada al servicio para actualizar la cita médica
        const citaActualizada = await citaMedicaService.updateCita(citaMedica)

        // Devolver la respuesta con la cita médica actualizada
        return {
            statusCode: 200,
            body: JSON.stringify({
                item: citaActualizada
            })
        }
    } catch (error) {
        console.error('Error al actualizar la cita médica:', error)

        // Manejo de errores en caso de que ocurra un problema durante la actualización
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Hubo un error al actualizar la cita médica.'
            })
        }
    }
}
