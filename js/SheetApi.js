class SheetApi
{
	constructor(bookId) {
		this.bookId_ = bookId;
	}
	
	CreateBook() {
		this.bookId_ = ''
		var name = 'マイリスト'
		return this.Run('', {
			method: 'POST',
			async: true,
			body: `{"properties":{"title":"${name}"},"sheets":[{"properties":{"title":"info"}},{"properties":{"title":"list"}}]}`
		})
		.then(res => {
			this.bookId_ = res.spreadsheetId
			return new Promise(function(resolve, reject) {
				var infoId, listId
				for (var s of res.sheets) {
					switch (s.properties.title) {
					case 'info': infoId = s.properties.sheetId; break;
					case 'list': listId = s.properties.sheetId; break; }
				}
				resolve({ book: res.spreadsheetId, info: infoId, list: listId })
			});
		})
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
			data[i] = '"'+data[i].replaceAll('"', '\\"')+'"'
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
		delLines.forEach(v => {
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
	Update(id, rcvList) {
		var req = rcvList.map(rcv => 
			`{"updateCells": {"start": {"sheetId": ${id},"rowIndex": ${rcv.row},"columnIndex": ${rcv.col}},"rows": [{"values": [{"userEnteredValue": {"stringValue": "${rcv.val}"}}]}],"fields": "userEnteredValue"}}`
		).join(',')
		
		return this.Run(
			':batchUpdate',
			{
				method: 'POST',
				async: true,
				body: `{"requests": [${req}]}`
			}
		);
	}

	Run(path, request) {
		var url = 'https://sheets.googleapis.com/v4/spreadsheets/' + this.bookId_ + path;
		console.log("request url:" + url);
		console.log(request);
		
		return new Promise(function(resolve, reject) {
			let authURL = "https://accounts.google.com/o/oauth2/auth"
			authURL += `?client_id=645932863093-oqe5hc67ec4f927bvirkbtd2nlno6mgr.apps.googleusercontent.com`
			authURL += `&response_type=token`
			authURL += `&redirect_uri=${chrome.identity.getRedirectURL("oauth2.html")}`
			authURL += `&scope=${encodeURIComponent("https://www.googleapis.com/auth/spreadsheets")}`;
			chrome.identity.launchWebAuthFlow({interactive: true, url: authURL}, function(redirectURL) {
				if (chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError);
					reject();
				} else {
					let param = new URL(redirectURL.replace('#', '?'))
					let token = param.searchParams.get("access_token")
					
					request.headers = {
						'Authorization': 'Bearer ' + token,
						'Content-Type': 'application/json; charset=UTF-8'
					}
					request.contentType = 'json';
					console.log(request);
					
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