import { google, sheets_v4 } from 'googleapis';
import { config } from '../config';
import { logger } from '../utils/logger';
import { Lead, PhoneStatus } from '../types';
import { withRetry } from '../utils/retry';

export class GoogleSheetsService {
  private sheets: sheets_v4.Sheets;
  private auth: any;
  
  constructor() {
    // Decode and parse service account
    const serviceAccountJson = Buffer.from(
      config.google.serviceAccount,
      'base64'
    ).toString('utf-8');
    
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    this.auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }
  
  // Validate sheet headers
  async validateHeaders(
    spreadsheetId: string,
    sheetName: string
  ): Promise<boolean> {
    try {
      const response = await withRetry(() =>
        this.sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${sheetName}!1:1`
        })
      );
      
      const headers = response.data.values?.[0] || [];
      const requiredHeaders = [
        'RowID', 'Name',
        'Num1', 'Num2', 'Num3', 'Num4', 'Num5',
        'Num6', 'Num7', 'Num8', 'Num9', 'Num10',
        'Status1', 'Status2', 'Status3', 'Status4', 'Status5',
        'Status6', 'Status7', 'Status8', 'Status9', 'Status10',
        'Notes', 'LastOutcome', 'AttemptCount', 'NextIndex'
      ];
      
      for (const required of requiredHeaders) {
        if (!headers.includes(required)) {
          logger.error('Missing required header', {
            spreadsheetId,
            sheetName,
            missing: required
          });
          return false;
        }
      }
      
      return true;
    } catch (error) {
      logger.error('Failed to validate headers', {
        spreadsheetId,
        sheetName,
        error
      });
      return false;
    }
  }
  
  // Read router configuration
  async getRouterEntry(agentEmail: string): Promise<any> {
    try {
      const response = await withRetry(() =>
        this.sheets.spreadsheets.values.get({
          spreadsheetId: config.google.routerSpreadsheetId,
          range: 'Router!A:F'
        })
      );
      
      const rows = response.data.values || [];
      const headers = rows[0];
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const entry: any = {};
        
        headers.forEach((header: string, index: number) => {
          entry[header] = row[index];
        });
        
        if (entry.AgentEmail === agentEmail && entry.Active === 'TRUE') {
          return {
            agentEmail: entry.AgentEmail,
            dialpadUserId: entry.DialpadUserID,
            spreadsheetId: entry.SpreadsheetId,
            tabId: parseInt(entry.TabId || '0'),
            campaignName: entry.CampaignName
          };
        }
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to get router entry', { agentEmail, error });
      return null;
    }
  }
  
  // Get leads from sheet
  async getLeads(
    spreadsheetId: string,
    sheetName: string,
    limit: number = 100
  ): Promise<Lead[]> {
    try {
      const response = await withRetry(() =>
        this.sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${sheetName}!A2:Z${limit + 1}`
        })
      );
      
      const rows = response.data.values || [];
      const leads: Lead[] = [];
      
      for (const row of rows) {
        const lead: Lead = {
          rowId: row[0],
          name: row[1],
          numbers: [],
          statuses: [],
          notes: row[22],
          lastOutcome: row[23],
          attemptCount: parseInt(row[24] || '0'),
          nextIndex: parseInt(row[25] || '1')
        };
        
        // Extract phone numbers and statuses
        for (let i = 1; i <= 10; i++) {
          const num = row[1 + i];
          const status = row[11 + i];
          
          if (num) {
            lead.numbers.push(num);
            lead.statuses.push(status as PhoneStatus || null);
          }
        }
        
        leads.push(lead);
      }
      
      return leads;
    } catch (error) {
      logger.error('Failed to get leads', { spreadsheetId, sheetName, error });
      return [];
    }
  }
  
  // Write disposition result
  async writeDisposition(
    spreadsheetId: string,
    sheetId: number,
    rowIndex: number,
    numIndex: number,
    status: PhoneStatus,
    color: string,
    outcome: string,
    callId: string
  ): Promise<boolean> {
    try {
      const statusColIndex = 11 + numIndex;
      const timestamp = new Date().toISOString();
      const note = `${outcome} (${timestamp}) call_id=${callId}`;
      
      const requests = [
        // Update status cell color
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: rowIndex,
              endRowIndex: rowIndex + 1,
              startColumnIndex: statusColIndex,
              endColumnIndex: statusColIndex + 1
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: this.hexToRgb(color)
              }
            },
            fields: 'userEnteredFormat.backgroundColor'
          }
        },
        // Update status value
        {
          updateCells: {
            range: {
              sheetId,
              startRowIndex: rowIndex,
              endRowIndex: rowIndex + 1,
              startColumnIndex: statusColIndex,
              endColumnIndex: statusColIndex + 1
            },
            rows: [{
              values: [{
                userEnteredValue: { stringValue: status }
              }]
            }],
            fields: 'userEnteredValue'
          }
        },
        // Update LastOutcome
        {
          updateCells: {
            range: {
              sheetId,
              startRowIndex: rowIndex,
              endRowIndex: rowIndex + 1,
              startColumnIndex: 23,
              endColumnIndex: 24
            },
            rows: [{
              values: [{
                userEnteredValue: { stringValue: outcome }
              }]
            }],
            fields: 'userEnteredValue'
          }
        },
        // Increment AttemptCount
        {
          updateCells: {
            range: {
              sheetId,
              startRowIndex: rowIndex,
              endRowIndex: rowIndex + 1,
              startColumnIndex: 24,
              endColumnIndex: 25
            },
            rows: [{
              values: [{
                userEnteredValue: { numberValue: numIndex + 1 }
              }]
            }],
            fields: 'userEnteredValue'
          }
        },
        // Append to Notes
        {
          updateCells: {
            range: {
              sheetId,
              startRowIndex: rowIndex,
              endRowIndex: rowIndex + 1,
              startColumnIndex: 22,
              endColumnIndex: 23
            },
            rows: [{
              values: [{
                userEnteredValue: { stringValue: note }
              }]
            }],
            fields: 'userEnteredValue'
          }
        }
      ];
      
      await withRetry(() =>
        this.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: { requests }
        })
      );
      
      logger.info('Disposition written to sheet', {
        spreadsheetId,
        rowIndex,
        numIndex,
        status,
        outcome
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to write disposition', {
        spreadsheetId,
        rowIndex,
        error
      });
      return false;
    }
  }
  
  // Skip sibling numbers
  async skipSiblings(
    spreadsheetId: string,
    sheetId: number,
    rowIndex: number,
    skipIndices: number[]
  ): Promise<boolean> {
    try {
      const requests = skipIndices.map(index => ({
        updateCells: {
          range: {
            sheetId,
            startRowIndex: rowIndex,
            endRowIndex: rowIndex + 1,
            startColumnIndex: 11 + index,
            endColumnIndex: 12 + index
          },
          rows: [{
            values: [{
              userEnteredValue: { stringValue: 'SKIPPED' }
            }]
          }],
          fields: 'userEnteredValue'
        }
      }));
      
      // Add color formatting for SKIPPED status
      const colorRequests = skipIndices.map(index => ({
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: rowIndex,
            endRowIndex: rowIndex + 1,
            startColumnIndex: 11 + index,
            endColumnIndex: 12 + index
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: this.hexToRgb(config.policies.statusColors.skipped)
            }
          },
          fields: 'userEnteredFormat.backgroundColor'
        }
      }));
      
      await withRetry(() =>
        this.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [...requests, ...colorRequests]
          }
        })
      );
      
      logger.info('Sibling numbers skipped', {
        spreadsheetId,
        rowIndex,
        skipIndices
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to skip siblings', {
        spreadsheetId,
        rowIndex,
        error
      });
      return false;
    }
  }
  
  // Helper to convert hex color to RGB
  private hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      red: parseInt(result[1], 16) / 255,
      green: parseInt(result[2], 16) / 255,
      blue: parseInt(result[3], 16) / 255
    } : { red: 0, green: 0, blue: 0 };
  }
}