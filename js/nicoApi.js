class VideoInfo
{
	static getVideoInfoArray(url, group) {
		let videoId = url.match(/\/watch\/((?:sm|nm|so)?[0-9]+)/);
		return VideoInfo.getVideoXml(videoId[1])
		.then((xml) => {
			let getXmlDoc = function(name) {
				return $(xml).find(name).first().text();
			}
			var data = [];
			data.push(group);
			data.push("index");
			data.push(location.href);
			data.push(getXmlDoc("title"));
			data.push(getXmlDoc("thumbnail_url"));
			var tags = [];
			$(xml).find("tags").each(function(i, t){
				for (var i = 0; i < t.children.length; i++) {
					tags.push(t.children.item(i).textContent);
				}
			});
			data.push(tags.join(" "));
			data.push(getXmlDoc("length"));
			data.push(VideoInfo.getNowDate());
			return data;
		});
	}
	static getVideoXml(videoId) {
		return new Promise(function(resolve, reject) {
			$.ajax({
				url: "//ext.nicovideo.jp/api/getthumbinfo/" + videoId,
				type: 'GET',
				dataType: 'xml',
				timeout: 1000,
				success: (response) => resolve(response)
			});
		});
	}
	static getNowDate() {
		var now = new Date();
		var yyyy = now.getFullYear(),
			MM = (now.getMonth() + 1),
			dd = now.getDate(),
			hh = now.getHours(),
			mm = now.getMinutes();
		return `${yyyy}/${MM}/${dd} ${hh}:${mm}`;
	}
}

