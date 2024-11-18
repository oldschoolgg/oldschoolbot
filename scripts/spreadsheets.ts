import fs from 'node:fs';
import readline from 'node:readline';
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!);

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.file'];

const jwt = new JWT({
	email: credentials.client_email,
	key: credentials.private_key,
	scopes: SCOPES
});

const fileToSpreadsheetMappings = [
	{
		filePath: 'data/monster_data.tsv',
		sheetIndex: 1,
		metaCell: [1, 1]
	}
];

async function updateMeta(doc: GoogleSpreadsheet, row: number, col: number, newValue: any) {
	try {
		const sheet = doc.sheetsByIndex[0];
		await sheet.loadCells();

		const cell = sheet.getCell(row, col);
		cell.value = newValue;

		await sheet.saveUpdatedCells();
	} catch (error) {
		console.error(`Error updating cell: ${error}`);
	}
}

async function parseTsv(filePath: string): Promise<any[][]> {
	const rows: any[][] = [];
	const fileStream = fs.createReadStream(filePath);
	const rl = readline.createInterface({ input: fileStream, crlfDelay: Number.POSITIVE_INFINITY });

	for await (const line of rl) {
		const row = line.split('\t');
		rows.push(row.map(cell => cell.trim().replace(/^"|"$/g, '')));
	}

	return rows;
}

async function updateSpreadsheet(doc: GoogleSpreadsheet, sheetIndex: number, rows: any[][]) {
	try {
		const sheet = doc.sheetsByIndex[sheetIndex];

		if (rows.length === 0) {
			throw new Error('No data found in the TSV file');
		}

		const headers = rows[0];
		const dataRows = rows.slice(1);

		await sheet.clear();
		await sheet.setHeaderRow(headers);

		await sheet.addRows(dataRows);
	} catch (error) {
		console.error(`Failed to update spreadsheet: ${error}`);
	}
}

(async () => {
	const branch = process.env.GITHUB_REF?.split('/').pop()!;
	if (!['master', 'bso'].includes(branch)) return;
	const spreadsheetID =
		branch === 'master'
			? '1XztqUjjfR_dDD2OIgURF5YLreumPQ1J9Ez7ncDwJEE8'
			: '1PdiN5y3uIdTdEfS0gYXVlO9QGz2WfckV1Y1MVIyaOTs';

	for (const mapping of fileToSpreadsheetMappings) {
		const rows = await parseTsv(mapping.filePath);
		const doc = new GoogleSpreadsheet(spreadsheetID, jwt);
		await doc.loadInfo();
		await updateSpreadsheet(doc, mapping.sheetIndex, rows);
		await updateMeta(
			doc,
			mapping.metaCell[0],
			mapping.metaCell[1],
			new Date().toISOString().slice(0, '2024-09-07'.length)
		);
	}
})();
