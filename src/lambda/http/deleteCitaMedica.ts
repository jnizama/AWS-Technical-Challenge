import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import CitaMedicaService from 'src/services/CitaMedicaService'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Obtener el ID de la cita médica desde los parámetros de la URL
        const id = event.pathParameters.id

        // Crear una instancia de CitaMedicaService
        const citaMedicaService = new CitaMedicaService()

        // Llamar al servicio para eliminar la cita médica por su ID
        await citaMedicaService.deleteCitaById(id)

        // Responder con un mensaje de éxito si la cita médica se eliminó correctamente
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Cita médica eliminada exitosamente.'
            })
        }
    } catch (error) {
        console.error('Error al eliminar la cita médica:', error)

        // Manejo de errores si no se encuentra la cita médica o si ocurre otro error
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Hubo un error al eliminar la cita médica.'
            })
        }
    }
}
