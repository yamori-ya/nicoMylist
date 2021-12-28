import {arrayMoveImmutable} from 'array-move';

export default class Data {
	
	constructor(json) {
		this.f_order = json.f_order;
		this.folder = json.folder;
		this.video  = json.video;
	}
	getAllJson() {
		return {
			f_order: this.f_order,
			folder: this.getFolder(),
			video: this.video,
		};
	}
	reload(json) {
		this.f_order = json.f_order;
		this.folder = json.folder;
		this.video  = json.video;
	}
	
	getFolder() {
		let orderList = this.folder.concat();
		
		switch (this.f_order) {
		case 1: // 名前昇順
			return orderList.sort();
		case 2: // 名前降順
			return orderList.sort().reverse();
		default: // オーダーなし任意並び
			return orderList;
		}
	}
	addFolder(name) {
		let now = new Date(), id = now.getTime();
		this.folder.push({
			id, name, order: 0,
			create: now.toLocaleString(),
			update: now.toLocaleString(),
		});
		this.video[id] = [];
	}
	delFolder(id) {
		this.folder = this.folder.filter(f => f.id != id);
		delete this.video[id];
	}
	sortFolder(oldIndex, newIndex) {
		this.folder = arrayMoveImmutable(this.folder, oldIndex, newIndex)
	}
	
	
	getVideo(id) {
		let orderList = this.video[id].concat();
		let order = this.folder.filter(e => e.id == id)[0].order
		
		switch (order) {
		case 1: // 名前昇順
			return orderList.sort();
		case 2: // 名前降順
			return orderList.sort().reverse();
		default: // オーダーなし任意並び
			return orderList;
		}
	}
	moveVideo(srcId, destId, indexArr) {
		copyVideo(srcId, destId, indexArr);
		delVideo(srcId, indexArr);
	}
	copyVideo(srcId, destId, indexArr) {
		let data = this.video[srcId].filter((e,i) => indexArr.includes(i));
		this.video[destId] = this.video[destId].concat(data);
	}
	delVideo(id, indexArr) {
		this.video[id] = this.video[id].filter((e,i) => !indexArr.includes(i));
	}
	sortVideo(id, oldIndex, newIndex) {
		this.video[id] = arrayMoveImmutable(this.video[id], oldIndex, newIndex);
	}
	
}