import { Injectable } from '@nestjs/common';
import { ConnectionPool } from 'mssql';

@Injectable()
export class SqlService {
  private pool: ConnectionPool;

  constructor() {
    this.pool = new ConnectionPool({
      type: 'mssql',
      user: process.env.SSMS_USERNAME,
      password: process.env.SSMS_PASSWORD,
      server: process.env.SSMS_HOST,
      port: parseInt(process.env.SSMS_PORT),
      database: process.env.SSMS_DATABASE,
      synchronize: true,
      options: {
        encrypt: false
      }
    });
  }

  async executeQuery(query: string): Promise<any> {
    try {
      await this.pool.connect();
      const result = await this.pool.query(query);
      await this.pool.close();
      return result.recordset;
    } catch (error) {
      throw new Error(`Failed to execute query: ${error.message}`);
    }
  }

  async getUsers(): Promise<any[]> {
    const query = `SELECT *  FROM [012425].[dbo].[DBR1_V1]`;
    return await this.executeQuery(query);
  }
  
}
