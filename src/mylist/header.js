import React from "react";

import { _storage, getData, saveData } from "./../function.js";

export default class Layout extends React.Component {
	
	constructor() {
		super();
	}
	
	onEdit = async () => {
		switch (this.props.editMode) {
		case 'none': this.props.changeMode({edit: 'edit'}); break;
		case 'edit': this.props.changeMode({edit: 'none'}); break;
		case 'save':
			await this.props.changeMode({preload: true});
			await this.props.changeData(async (data) => await saveData(data))
			await this.props.changeMode({preload: false, edit: 'none'});
			break;
		}
	}
	onReload = async () => {
		await this.props.changeMode({preload: true, draw: false})
		await _storage.setSync({reload:true})
		let json = (await getData()).getAllJson();
		await this.props.changeData(data => data.reload(json))
		await this.props.changeMode({preload: false, draw: true, edit: 'none'})
	}
	
	
	render() {
		let edit = { mode: this.props.editMode };
		switch (edit.mode) {
		case 'none': edit.str = '編集'; edit.icon = 'edit'; break;
		case 'edit': edit.str = '終了'; edit.icon = 'edit'; break;
		case 'save': edit.str = '保存'; edit.icon = 'save'; break; }
		
		const menuBtn = " btn btn-flat waves-effect"
		
		return (
			<nav>
				<ul class="menu right">
					<li>
						<a class={edit.mode + menuBtn} onClick={this.onEdit}>
							<i class="material-icons left">{edit.icon}</i>{edit.str}
						</a>
					</li>
					<li>
						<a class={menuBtn} onClick={this.onReload}>
							<i class="material-icons left">sync</i>同期
						</a>
					</li>
					<li>
						<a class={menuBtn} href="option.html">
							<i class="material-icons left">settings</i>設定
						</a>
					</li>
				</ul>
				
				<div class="search">
					<form method="get">
						<input type="text" name="fstr" class="browser-default"/>
						<input type="hidden" name="list" />
						<label>
							<input type="submit" style={{display:'none'}} />
							<i class="material-icons big">search</i>
						</label>
					</form>
				</div>
			</nav>
		);
	}
}