class SheetApi
{
	set bookId(bookId) {
		this.bookId_ = bookId;
	}
	CreateBook() {
		return this.Run('', { method: 'POST', async: true });
	}
	Sort() {
		return this.Run(
			`:batchUpdate`,
			{
				method: 'POST',
				async: true,
				body: `{"requests":[{"sortRange":{"range":{"sheetId":"0","startRowIndex":0,"endRowIndex":100},"sortSpecs":[{"dimensionIndex":0,"sortOrder":"ASCENDING"}]}}]}`
			}
		);
	}
	GetBookInfo() {
		return this.Run(
			'?fields=sheets/properties(sheetId,title)',
			{ method: 'GET', async: true }
		);
	}
	GetRange(ranges) {
		var rs = [];
		for (var i in ranges) {
			rs.push(`ranges=${ranges[i]}`);
		}
		return this.Run(
			`/values:batchGet?${rs.join("&")}`,
			{ method: 'GET', async: true }
		);
	}
	AppendData(sheet, data) {
		for (var i=0;i<data.length;i++) {
			data[i] = `"${data[i]}"`
		}
		return this.Run(
			`/values/${sheet}!A:A:append?valueInputOption=USER_ENTERED`,
			{
				method: 'POST',
				async: true,
				body: `{"values": [[${data.join(',')}]]}`
			}
		);
	}
	DeleteLine(sheetId, delLines) {
		delLines.sort((a,b)=>a-b);
		var range = [];
		var start = delLines[0], ago;
		delLines.forEach((v) => {
			if (ago && Math.abs(ago-v) != 1) {
				range.push([start-1, ago]);
				start = v;
			}
			ago = v;
		});
		range.push([start-1, ago]);
		var req = range.reverse().map(v => 
			`{"deleteDimension":{"range":{"sheetId":${sheetId},"dimension":"ROWS","startIndex":${v[0]},"endIndex":${v[1]}}}}`
		).join(',')
		
		return this.Run(
			`:batchUpdate`,
			{
				method: 'POST',
				async: true,
				body: `{"requests": [${req}]}`
			}
		);
	}
	Update() {
		return this.Run(
			':batchUpdate',
			{
				method: 'POST',
				async: true,
				body: '{"requests":[{"updateCells":{"start":{"sheetId":0,"rowIndex":0,"columnIndex":0},"rows":[{"values":[{"userEnteredValue":{"stringValue":"tmp2"}}]}],"fields":"userEnteredValue"}}]}'
			}
		);
	}

	Run(path, request) {
		var url = 'https://sheets.googleapis.com/v4/spreadsheets/' + this.bookId_ + path;
		console.log("request url:" + url);
		
		return new Promise(function(resolve, reject) {
			chrome.identity.getAuthToken({interactive: true}, function(token) {
				if (chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError);
					reject();
				} else {
					request.headers = {
						'Authorization': 'Bearer ' + token,
						'Content-Type': 'application/json; charset=UTF-8'
					}
					request.contentType = 'json';
					
					return fetch(url, request)
					.then((response) => {
						console.dir(response);
						return resolve(response.json()); 
					});
				}
			});
		});
	}
}
var api = new SheetApi();