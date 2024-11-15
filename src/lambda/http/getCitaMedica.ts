import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import CitaMedicaService from 'src/services/CitaMedicaService'

// La función handler obtiene todas las citas médicas
export const handler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Crear una instancia de CitaMedicaService
        const citaMedicaService = new CitaMedicaService()

        // Obtener todas las citas médicas
        const citasMedicas = await citaMedicaService.getAllCitas()

        // Responder con todas las citas médicas encontradas
        return {
            statusCode: 200,
            body: JSON.stringify({
                items: citasMedicas
            })
        }
    } catch (error) {
        console.error('Error al obtener las citas médicas:', error)

        // Manejo de errores
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Hubo un error al obtener las citas médicas.'
            })
        }
    }
}
