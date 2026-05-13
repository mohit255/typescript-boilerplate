// src/utils/secretService.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export class SecretService {
  private client: SecretsManagerClient;

  constructor(region: string = process.env.AWS_REGION || 'ap-south-1') {
    this.client = new SecretsManagerClient({ region });
  }

  /**
   * Fetch secrets from AWS Secrets Manager
   * @param secretName Secret ID in Secrets Manager
   * @returns Parsed secret object
   */
  public async getSecret(secretName: string): Promise<Record<string, any>> {
    try {
      const command = new GetSecretValueCommand({ SecretId: secretName });
      const data = await this.client.send(command);

      if (data.SecretString) {
        return JSON.parse(data.SecretString);
      } else if (data.SecretBinary) {
        const buff = Buffer.from(data.SecretBinary as Uint8Array);
        return JSON.parse(buff.toString('utf-8'));
      }

      throw new Error('Secret data format is invalid.');
    } catch (error) {
      console.error(`❌ Failed to retrieve secret: ${secretName}`, error);
      throw error;
    }
  }
}
