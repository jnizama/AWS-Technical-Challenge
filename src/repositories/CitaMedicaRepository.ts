import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { CitaMedica } from "src/models/CitaMedica"; 
import { Medico } from "src/models/Medico";
import { Paciente } from "src/models/Paciente";

export default class CitaMedicaRepository {
    constructor(
      private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
      private readonly citaMedicaTable = process.env.CITAS_MEDICAS_TABLE
    ) {}
  
    // Get all citas médicas
    async getAllCitas(): Promise<CitaMedica[]> {
        const result = await this.docClient.scan({
            TableName: this.citaMedicaTable
        }).promise();
  
        // Convert DynamoDB items to CitaMedica objects
        return result.Items.map(item => this.dynamoToCitaMedica(item));
    }
  
    // Get a cita médica by ID
    async getCitaById(id: string): Promise<CitaMedica | null> {
        const result = await this.docClient.get({
            TableName: this.citaMedicaTable,
            Key: { 'id': id }
        }).promise();
  
        if (!result.Item) return null;
  
        return this.dynamoToCitaMedica(result.Item);
    }
  
    // Create a new cita médica
    async createCita(cita: CitaMedica): Promise<CitaMedica> {
        const item = this.citaToDynamo(cita);
        
        await this.docClient.put({
            TableName: this.citaMedicaTable,
            Item: item
        }).promise();
  
        return cita;
    }
  
    // Update cita médica
    async updateCita(partialCita: Partial<CitaMedica>): Promise<CitaMedica> {
        const updated = await this.docClient.update({
            TableName: this.citaMedicaTable,
            Key: { 'id': partialCita.id },
            UpdateExpression: 'set #nombrePaciente = :nombrePaciente, fecha = :fecha, hora = :hora, estado = :estado',
            ExpressionAttributeNames: {
                '#nombrePaciente': 'nombrePaciente'
            },
            ExpressionAttributeValues: {
                ':nombrePaciente': partialCita.nombrePaciente,
                ':fecha': partialCita.fecha?.toISOString(),
                ':hora': partialCita.hora,
                ':estado': partialCita.estado
            },
            ReturnValues: 'UPDATED_NEW'
        }).promise();
  
        return updated.Attributes as CitaMedica;
    }
  
    // Delete cita médica by ID
    async deleteCitaById(id: string): Promise<void> {
        await this.docClient.delete({
            TableName: this.citaMedicaTable,
            Key: { 'id': id }
        }).promise();
    }
  
    // Helper function to map from DynamoDB to CitaMedica object
    private dynamoToCitaMedica(item: any): CitaMedica {
        const medico = new Medico(item.medicoAsignado.id, item.medicoAsignado.nombre, item.medicoAsignado.especialidad, item.medicoAsignado.edad,item.medicoAsignado.telefono,item.medicoAsignado.email,);
        const paciente = new Paciente(item.paciente.id, item.paciente.nombre, item.paciente.edad, item.paciente.telefono, item.paciente.email);
  
        const cita = new CitaMedica(
            item.id,
            item.nombrePaciente,
            new Date(item.fecha),
            item.hora,
            medico
        );
  
        cita.estado = item.estado;
        cita.creadoEn = new Date(item.creadoEn);
  
        return cita;
    }
  
    // Helper function to map CitaMedica object to DynamoDB format
    private citaToDynamo(cita: CitaMedica): any {
        return {
            id: cita.id,
            nombrePaciente: cita.nombrePaciente,
            fecha: cita.fecha.toISOString(),
            hora: cita.hora,
            estado: cita.estado,
            medicoAsignado: {
                id: cita.medicoAsignado.id,
                nombre: cita.medicoAsignado.nombre,
                especialidad: cita.medicoAsignado.especialidad
            },
            paciente: {
                id: cita.medicoAsignado.id,
                nombre: cita.medicoAsignado.nombre,
                edad: cita.medicoAsignado.edad,
                telefono: cita.medicoAsignado.telefono,
                email: cita.medicoAsignado.email
            },
            creadoEn: cita.creadoEn.toISOString()
        };
    }
  }
  