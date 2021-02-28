"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSheets = void 0;
const googleapis_1 = require("googleapis");
class GoogleSheets {
    constructor() { }
    async connect() {
        var _a;
        const client = new googleapis_1.google.auth.JWT(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, 
        //@ts-ignore
        null, (_a = process.env.GOOGLE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, "\n"), [
            'https://www.googleapis.com/auth/spreadsheets'
        ]);
        await client.authorize((error, tokens) => {
            if (error) {
                console.error(error);
                return;
            }
            else {
                console.log("Connected");
            }
        });
        return client;
    }
    async update(data) {
        const client = await this.connect();
        const gsapi = googleapis_1.google.sheets({ version: 'v4', auth: client });
        let _data = await this.get(data.spreadsheetId);
        let newData = _data.values.map((row) => {
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
                values: newData
            }
        };
        let res = await gsapi.spreadsheets.values.update(opt);
    }
    async get(spreadsheetId) {
        const client = await this.connect();
        const gsapi = googleapis_1.google.sheets({ version: 'v4', auth: client });
        const opt = {
            spreadsheetId,
            range: "'Raw Draft Data'!A2:B",
        };
        let res = await gsapi.spreadsheets.values.get(opt);
        return res.data;
    }
    async add(data) {
        const client = await this.connect();
        const gsapi = googleapis_1.google.sheets({ version: 'v4', auth: client });
        const opt = {
            spreadsheetId: data.spreadsheetId,
            range: "'Raw Draft Data'!A2:B2",
            valueInputOption: "USER_ENTERED",
            resource: {
                range: "'Raw Draft Data'!A2:B2",
                values: data.data
            }
        };
        let res = await gsapi.spreadsheets.values.append(opt);
    }
}
exports.GoogleSheets = GoogleSheets;
