import { google } from "googleapis";

export class GoogleSheets {
	async connect() {
		const client = new google.auth.JWT(
			process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-ignore
			null,
			process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
			["https://www.googleapis.com/auth/spreadsheets"]
		);
		await client.authorize((error, tokens) => {
			if (error) {
				console.error(error);
				return;
			} else {
				console.log("Connected");
			}
		});

		return client;
	}

	public async update(data: {
		spreadsheetId: string;
		data: Array<Array<string>>;
	}) {
		const client = await this.connect();
		const gsapi = google.sheets({ version: "v4", auth: client });
		const _data = await this.get(data.spreadsheetId);
		const newData = _data!.values!.map((row) => {
			if (row[0] == data.data[0][0] && row[1] == data.data[0][1]) {
				row[1] = data.data[0][2];
			}
			return row;
		});
		const opt = {
			spreadsheetId: data.spreadsheetId,
			range: "'Raw Draft Data'!A2:B",
			valueInputOption: "USER_ENTERED",
			resource: {
				values: newData,
			},
		};

		const res = await gsapi.spreadsheets.values.update(opt);
	}

	public async get(spreadsheetId: string) {
		const client = await this.connect();
		const gsapi = google.sheets({ version: "v4", auth: client });
		const opt = {
			spreadsheetId,
			range: "'Raw Draft Data'!A2:B",
		};

		const res = await gsapi.spreadsheets.values.get(opt);
		return res.data;
	}

	public async add(data: {
		spreadsheetId: string;
		data: Array<Array<string>>;
	}) {
		const client = await this.connect();
		const gsapi = google.sheets({ version: "v4", auth: client });
		const opt = {
			spreadsheetId: data.spreadsheetId,
			range: "'Raw Draft Data'!A2:B2",
			valueInputOption: "USER_ENTERED",
			resource: {
				range: "'Raw Draft Data'!A2:B2",
				values: data.data,
			},
		};
		const res = await gsapi.spreadsheets.values.append(opt);
		return res.data;
	}
}
